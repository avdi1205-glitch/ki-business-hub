"use client";

type Props = {
  id: number;
  url: string;
  text?: string;
};

export default function AffiliateButton({
  id,
  url,
  text = "🚀 Angebot ansehen",
}: Props) {
  async function handleClick() {
    try {
      await fetch("/api/click-affiliate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error(error);
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl bg-green-600 hover:bg-green-700 px-6 py-3 font-bold transition"
    >
      {text}
    </button>
  );
}