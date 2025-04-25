import Link from "next/link";
import { hianime } from "@/lib/aniwatch";

interface Episode {
  number: number;
  episodeId: string;
  // We no longer expect `slug` and `ep` directly; we'll parse them from `episodeId`.
}

type AnimePageProps = {
  params: { id: string };
};

export default async function AnimePage(
  props: AnimePageProps
): Promise<JSX.Element> {
  // Destructure the params inside the function body instead of the parameter list.
  const { id } = props.params;

  // Fetch the episodes for the given anime id.
  const json = await hianime.getEpisodes(id);
  const eps: Episode[] = json.episodes;

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">{id.replace(/-/g, " ")}</h1>
      <ul className="list-disc pl-5 space-y-2">
        {eps.map((e) => {
          // Default values.
          let slug = e.episodeId;
          let ep = "";

          // If the episodeId contains query parameters, extract them.
          if (e.episodeId.includes("?")) {
            const [base, queryString] = e.episodeId.split("?");
            slug = base;
            const params = new URLSearchParams(queryString);
            ep = params.get("ep") || "";
          }

          return (
            <li key={e.episodeId}>
              {/* Build a URL like: /watch/one-piece-100?ep=2142 */}
              <Link href={`/watch/${slug}?ep=${ep}`}>
                Episode {e.number}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
