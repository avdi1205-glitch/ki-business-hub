"use client";

type Props = {
  id: number;
};

export default function DeleteAffiliateButton({ id }: Props) {
  async function deleteAffiliateLink() {
    if (!confirm("Affiliate Link wirklich löschen?")) {
      return;
    }

    await fetch("/api/delete-affiliate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    window.location.reload();
  }

  return (
    <button
      onClick={deleteAffiliateLink}
      className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
    >
      Löschen
    </button>
  );
}