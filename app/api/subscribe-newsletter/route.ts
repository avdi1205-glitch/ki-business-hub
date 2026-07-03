import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "subscribed") {
        return Response.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      }
      // Reactivate subscription
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: "subscribed" },
      });
    } else {
      // Create new subscriber
      await prisma.newsletterSubscriber.create({
        data: { email, name, status: "subscribed" },
      });
    }

    // TODO: Send welcome email via Resend
    // const response = await resend.emails.send({
    //   from: "newsletter@yourdomain.com",
    //   to: email,
    //   subject: "Willkommen im KI Business Hub Newsletter!",
    //   html: "..."
    // });

    return Response.json({
      success: true,
      message: "Erfolgreich angemeldet! 🎉",
    });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Subscriber Count
export async function GET() {
  try {
    const count = await prisma.newsletterSubscriber.count({
      where: { status: "subscribed" },
    });

    return Response.json({ subscriberCount: count });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
