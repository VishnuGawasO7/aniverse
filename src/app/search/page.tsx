"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchPhrase = searchParams.get("q") || "";
  const [animes, setAnimes] = useState<
    { id: string; name: string; poster: string }[]
  >([]);

  useEffect(() => {
    if (!searchPhrase) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchPhrase)}&page=1`
        );
        if (!res.ok) {
          throw new Error("API request failed");
        }
        const data = await res.json();
        // Assuming your API returns an object with `animes`
        setAnimes(data.animes);
      } catch (error) {
        console.error("Search error:", error);
      }
    })();
  }, [searchPhrase]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Results for “{searchPhrase}”</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {animes.map((a) => (
          <Link
            key={a.id}
            href={`/anime/${a.id}`}
            className="block bg-gray-800 rounded overflow-hidden shadow"
          >
            <img
              src={a.poster}
              alt={a.name}
              className="w-full h-40 object-cover"
            />
            <p className="p-2 text-center">{a.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
