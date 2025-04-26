import Player from "@/components/player";
import { hianime } from "@/lib/aniwatch"; // Ensure AnimeServers type is exported if needed.
import AnimePage from "@/app/anime/[id]/page";
import Link from "next/link";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ episodeId: string }>;
  searchParams: Promise<{ ep?: string; serverSelect?: string; subOrDub?: string }>;
}) {
  // Await the route parameters before destructuring them
  const { episodeId } = await params;
  const { ep, serverSelect = "hd-1", subOrDub } = await searchParams;

  // Narrow serverSelect to allowed values ("hd-1" or "hd-2")
  const validServerSelect: "hd-1" | "hd-2" =
    serverSelect === "hd-2" ? "hd-2" : "hd-1";

  // Validate subOrDub to match the expected union type ("sub" | "dub" | "raw")
  const validSubOrDub: "sub" | "dub" | "raw" =
    subOrDub === "dub" || subOrDub === "raw" ? subOrDub : "sub";

  // Rebuild the episode ID query if an 'ep' query string is present
  const fullEpisodeId = ep ? `${episodeId}?ep=${encodeURIComponent(ep)}` : episodeId;

  // Use the validated values when fetching the episode source
  const json = await hianime.getEpisodeSources(
    fullEpisodeId,
    validServerSelect,
    validSubOrDub
  );
  const originalSourceUrl = json.sources?.[0]?.url || "";

  if (!originalSourceUrl) {
    return <div className="text-white">No playable source found.</div>;
  }

  // Proxy the source URL through your API.
  const proxySourceUrl = `/api/proxy?target=${encodeURIComponent(
    originalSourceUrl
  )}`;

  return (
    <div className="p-4 bg-black min-h-screen">
      <h1 className="text-2xl text-white mb-4">Now Playing</h1>
      <Player src={proxySourceUrl} />

      <div className="w-full h-30 grid grid-cols-1 text-center mx-3.5 border-2">
        {/* "sub" selection block */}
        <div className="bg-gray-900 py-3">
          <span className="text-white font-bold">sub</span>
          <div className="flex justify-center space-x-4 mt-2">
            <Link
              href={{
                pathname: `/watch/${episodeId}`,
                query: { ep, serverSelect: "hd-1", subOrDub: "sub" },
              }}
              className={`px-3 py-1 rounded ${
                validServerSelect === "hd-1" && validSubOrDub === "sub"
                  ? "bg-emerald-600"
                  : "bg-emerald-950"
              } text-white`}
            >
              hd-1
            </Link>
            <Link
              href={{
                pathname: `/watch/${episodeId}`,
                query: { ep, serverSelect: "hd-2", subOrDub: "sub" },
              }}
              className={`px-3 py-1 rounded ${
                validServerSelect === "hd-2" && validSubOrDub === "sub"
                  ? "bg-emerald-600"
                  : "bg-emerald-950"
              } text-white`}
            >
              hd-2
            </Link>
          </div>
        </div>
        {/* "dub" selection block */}
        <div className="bg-gray-800 py-3 mt-4">
          <span className="text-white font-bold">dub</span>
          <div className="flex justify-center space-x-4 mt-2">
            <Link
              href={{
                pathname: `/watch/${episodeId}`,
                query: { ep, serverSelect: "hd-1", subOrDub: "dub" },
              }}
              className={`px-3 py-1 rounded ${
                validServerSelect === "hd-1" && validSubOrDub === "dub"
                  ? "bg-emerald-600"
                  : "bg-emerald-950"
              } text-white`}
            >
              hd-1
            </Link>
            <Link
              href={{
                pathname: `/watch/${episodeId}`,
                query: { ep, serverSelect: "hd-2", subOrDub: "dub" },
              }}
              className={`px-3 py-1 rounded ${
                validServerSelect === "hd-2" && validSubOrDub === "dub"
                  ? "bg-emerald-600"
                  : "bg-emerald-950"
              } text-white`}
            >
              hd-2
            </Link>
          </div>
        </div>
      </div>

      {/* Render the AnimePage with the given anime id */}
      <AnimePage params={Promise.resolve({ id: episodeId })} />
    </div>
  );
}