type AiTransparencyBadgeProps = {
  locale?: string;
  className?: string;
};

export default function AiTransparencyBadge({ locale = "de", className = "" }: AiTransparencyBadgeProps) {
  const isEn = locale === "en";

  return (
    <p
      className={`inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200 ${className}`.trim()}
    >
      {isEn ? "AI-assisted content - human reviewed" : "KI-unterstuetzter Inhalt - menschlich geprueft"}
    </p>
  );
}