import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = request.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return new Response(renderHtml(false, "Ungültiger Bestätigungslink."), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const tokenHash = hashToken(token);

  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: {
      email: normalizedEmail,
      confirmTokenHash: tokenHash,
      confirmTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!subscriber) {
    return new Response(renderHtml(false, "Der Link ist abgelaufen oder ungültig."), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  await prisma.newsletterSubscriber.update({
    where: { email: normalizedEmail },
    data: {
      status: "subscribed",
      confirmTokenHash: null,
      confirmTokenExpiresAt: null,
      confirmedAt: new Date(),
    },
  });

  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (process.env.RESEND_API_KEY && fromEmail) {
    try {
      const resend = await getResend();
      await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Willkommen im Nexmoneta Newsletter",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:12px;">Willkommen ${subscriber.name ? String(subscriber.name) : "bei Nexmoneta"}</h1>
            <p>Dein Newsletter-Abo ist jetzt bestätigt.</p>
            <p>Du bekommst jetzt konkrete Empfehlungen, neue Artikel und Tools mit echtem Monetarisierungspotenzial.</p>
            <p style="margin-top:24px;"><strong>Bonus:</strong> Halte Ausschau nach den Top AI Tools und Conversion-Tipps in den nächsten Mails.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.warn("[NEWSLETTER-CONFIRM] Welcome mail could not be sent", mailError);
    }
  }

  return new Response(renderHtml(true, "Danke. Dein Newsletter-Abo ist bestätigt."), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderHtml(success: boolean, message: string) {
  const accent = success ? "#10b981" : "#f59e0b";
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nexmoneta Newsletter</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #08111f; color: #e2e8f0; display: grid; min-height: 100vh; place-items: center; padding: 24px; }
          .card { max-width: 640px; width: 100%; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px; box-shadow: 0 24px 80px rgba(0,0,0,0.35); }
          .badge { display: inline-block; padding: 8px 14px; border-radius: 999px; background: ${accent}22; color: ${accent}; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
          h1 { margin: 18px 0 12px; font-size: 34px; line-height: 1.1; color: white; }
          p { line-height: 1.7; }
          a { color: #67e8f9; }
        </style>
      </head>
      <body>
        <main class="card">
          <span class="badge">Newsletter</span>
          <h1>${success ? "Bestätigt" : "Fast geschafft"}</h1>
          <p>${message}</p>
          <p><a href="/">Zur Startseite</a></p>
        </main>
      </body>
    </html>
  `;
}