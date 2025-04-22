import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onsubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={onsubmit} className="flex mb-4">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What do you wanna watch?"
        className="flex-1 px-3 py-2 rounded-l bg-grey-800 text-white"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-red-600 rounded-r hover:bg-red-700"
      >
        Search
      </button>
    </form>
  );
}
