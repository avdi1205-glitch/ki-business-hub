"use client";

type Props = {
  id: number;
};

export default function DeleteButton({ id }: Props) {
  async function deleteArticle() {
    if (!confirm("Delete this article?")) {
      return;
    }

    await fetch("/api/delete-article", {
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
      onClick={deleteArticle}
      className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
    >
      Delete
    </button>
  );
}