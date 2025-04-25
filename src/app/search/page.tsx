"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
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
            <div className="relative w-full h-40">
              <Image
                src={a.poster}
                alt={a.name}
                fill
                className="object-cover"
                unoptimized={false}
              />
            </div>
            <p className="p-2 text-center">{a.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
