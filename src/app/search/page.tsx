"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

interface Anime {
  id: string;
  name: string;
  poster: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const searchPhrase = searchParams.get("q") || "";
  const [animes, setAnimes] = useState<Anime[]>([]);

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
        // Casting the fetched data to ensure it matches the Anime type
        setAnimes(data.animes as Anime[]);
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
              width={300}
              height={400}
              className="w-full h-40 object-cover"
            />
            <p className="p-2 text-center">{a.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
