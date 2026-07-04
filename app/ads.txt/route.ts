import { NextResponse } from "next/server";
import { toAdClientId } from "../../lib/adsense";

export function GET() {
  const adClient = toAdClientId(
    process.env.GOOGLE_ADSENSE_ID || process.env.NEXT_PUBLIC_ADSENSE_ID,
  );

  if (!adClient) {
    return new NextResponse("", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const publisherId = adClient.replace(/^ca-/, "");
  const content = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
