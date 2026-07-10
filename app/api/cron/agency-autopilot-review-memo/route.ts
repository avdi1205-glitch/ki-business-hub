import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

type QueuedContext = {
  executeAt?: string;
  createdAt?: string;
  totalCandidates?: number;
  dailyLimit?: number;
  alreadySentToday?: number;
  remainingToday?: number;
  sendWindowOpen?: boolean;
  drafts?: Array<{
    email: string;
    name: string | null;
    teamSize: string | null;
    stage: string;
    followUpCount: number;
    subject: string;
  }>;
};

function parseContext(value: string | null): QueuedContext {
  if (!value) return {};
  try {
    return JSON.parse(value) as QueuedContext;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queue = await prisma.internalBotRun.findMany({
      where: {
        recurringTaskKey: "agency-review-memo",
        answer: "pending",
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    if (!queue.length) {
      return NextResponse.json({ success: true, processed: 0, message: "No queued review memos." });
    }

    const now = Date.now();
    const due = queue.filter((item) => {
      const context = parseContext(item.context);
      if (!context.executeAt) return true;
      return new Date(context.executeAt).getTime() <= now;
    });

    if (!due.length) {
      return NextResponse.json({ success: true, processed: 0, message: "Queued review memos are not due yet." });
    }

    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";
    if (!process.env.RESEND_API_KEY || !fromEmail) {
      return NextResponse.json({ error: "Resend is not configured" }, { status: 503 });
    }

    const resend = await getResend();
    let processed = 0;

    for (const item of due) {
      const context = parseContext(item.context);
      const drafts = context.drafts || [];

      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: "Agency Autopilot Review Memo (kein Versand ausgefuehrt)",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:680px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:12px;">Agency Autopilot Review Memo</h1>
            <p>Dies ist ein reines Review-Memo. Es wurden keine E-Mails an Leads versendet.</p>
            <p><strong>Geplante Ausfuehrung:</strong> ${context.executeAt || "-"}</p>
            <p><strong>Kandidaten:</strong> ${context.totalCandidates || drafts.length}</p>
            <p><strong>Versandfenster offen:</strong> ${context.sendWindowOpen ? "ja" : "nein"}</p>
            <p><strong>Tageslimit:</strong> ${context.dailyLimit || 0} | Bereits gesendet: ${context.alreadySentToday || 0} | Rest heute: ${context.remainingToday || 0}</p>
            <h2 style="margin-top:18px;">Top Entwuerfe</h2>
            <ul>
              ${drafts.slice(0, 10).map((draft) => `<li>${draft.email} (${draft.teamSize || "-"}, stage: ${draft.stage}, follow-up: ${draft.followUpCount}x)</li>`).join("")}
            </ul>
            <p style="margin-top:14px;">Naechster Schritt: Entwuerfe in der Admin-Ansicht pruefen und Versand nur bei Bedarf manuell freigeben.</p>
          </div>
        `,
      });

      await prisma.internalBotRun.update({
        where: { id: item.id },
        data: {
          answer: "done",
          context: JSON.stringify({
            ...context,
            deliveredAt: new Date().toISOString(),
          }),
        },
      });

      processed += 1;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    console.error("[CRON-AGENCY-AUTOPILOT-REVIEW-MEMO]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
