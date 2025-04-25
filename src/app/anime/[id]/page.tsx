import Link from "next/link";
import { hianime } from "@/lib/aniwatch";
import { Metadata } from "next";

interface Episode {
  number: number;
  episodeId: string;
}

interface AnimePageProps {
  params: {
    id: string;
  };
}

// Optional: SEO metadata
export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  const title = params.id.replace(/-/g, " ");
  return {
    title: `${title} - Episodes | Aniverse`,
  };
}

export default async function AnimePage({
  params,
}: AnimePageProps): Promise<JSX.Element> {
  const { id } = params;

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
            const params = new URLSearchParams(queryString);
            ep = params.get("ep") || "";
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
