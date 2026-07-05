"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="de">
      <body style={{ margin: 0, background: "#0f172a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <section style={{ maxWidth: "700px", textAlign: "center" }}>
            <p
              style={{
                display: "inline-block",
                marginBottom: "12px",
                padding: "4px 10px",
                borderRadius: "9999px",
                border: "1px solid rgba(248,113,113,0.35)",
                background: "rgba(239,68,68,0.15)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Schwerer Fehler
            </p>
            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(28px,4vw,42px)" }}>
              Die Anwendung ist kurzzeitig nicht verfuegbar
            </h1>
            <p style={{ margin: "0 0 24px", lineHeight: 1.7, color: "#cbd5e1" }}>
              Der Fehler wurde protokolliert. Versuche einen Neustart oder gehe zur Startseite.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  background: "#0891b2",
                  color: "white",
                  fontWeight: 700,
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                Erneut versuchen
              </button>
              <Link
                href="/"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#e2e8f0",
                  fontWeight: 700,
                  padding: "10px 16px",
                  textDecoration: "none",
                }}
              >
                Zur Startseite
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
