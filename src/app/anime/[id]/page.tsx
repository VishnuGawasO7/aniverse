// src/app/anime/[id]/page.tsx
import Link from "next/link";
import { hianime } from "@/lib/aniwatch";
import { Metadata } from "next";

interface Episode {
  number: number;
  episodeId: string;
}

// In Next.js 15, `params` is now an async API and must be typed as a Promise
interface AnimePageProps {
  params: Promise<{ id: string }>;
}

// SEO metadata generator
export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  // await the params Promise
  const { id } = await params;
  const title = id.replace(/-/g, " ");
  return {
    title: `${title} - Episodes | Aniverse`,
  };
}

export default async function AnimePage({
  params,
}: AnimePageProps): Promise<JSX.Element> {
  // await the params Promise before destructuring
  const { id } = await params;

  const json = await hianime.getEpisodes(id);
  const eps: Episode[] = json.episodes;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-4">
        {id.replace(/-/g, " ")}
      </h1>
      <ul className="list-disc pl-5 space-y-2 text-white">
        {eps.map((e) => {
          let slug = e.episodeId;
          let ep = "";

          if (e.episodeId.includes("?")) {
            const [base, queryString] = e.episodeId.split("?");
            slug = base;
            const ps = new URLSearchParams(queryString);
            ep = ps.get("ep") || "";
          }

          return (
            <li key={e.episodeId}>
              <Link
                className="text-blue-400 hover:underline"
                href={`/watch/${slug}?ep=${ep}`}
              >
                Episode {e.number}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
