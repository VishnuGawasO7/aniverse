// src/app/anime/[id]/page.tsx
import Link from "next/link";
import { hianime } from "@/lib/aniwatch";
import { Metadata } from "next";

// Only number & episodeId needed for rendering
interface Episode {
  number: number;
  episodeId: string;
}

interface AnimePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id.replace(/-/g, " ")} - Episodes | Aniverse` };
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id } = await params;

  const json = await hianime.getEpisodes(id);

  // 1) Filter out any entries missing episodeId
  // 2) Cast the result to your simpler Episode[] for rendering
  const eps = json.episodes
    .filter((e) => e.episodeId !== null)
    .map((e) => ({
      number: e.number,
      episodeId: e.episodeId!, // `!` safe because we just filtered nulls
    })) as Episode[];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-white mb-4 w-full ">
        {id.replace(/-/g, " ")} 
      </h1>
      <ul className="grid grid-cols-5 sm:grid-cols-10 w-full text-white ">
        {eps.map((e) => {
          const [slug, query] = e.episodeId.split("?");
          const ep = query ? new URLSearchParams(query).get("ep") || "" : "";

          return (
            <li key={e.episodeId}>
              <div className="bg-blue-950 m-1 w-10 h-8 text-center">
                <Link
                  className="text-blue-400 hover:underline"
                  href={`/watch/${slug}?ep=${ep}`}
                >
                  {e.number}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
