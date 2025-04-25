import Player from "@/components/player";
import { hianime } from "@/lib/aniwatch";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { episodeId: string };
  searchParams: { ep?: string };
}) {
  // Await to retrieve dynamic route parameters
  const { episodeId } = await Promise.resolve(params);
  const ep = searchParams.ep; // example: "2142"

  // Rebuild the full episode identifier in the expected format.
  const fullEpisodeId = ep ? `${episodeId}?ep=${ep}` : episodeId;
  
  // Get the original source URL from your scraper using the full identifier.
  const json = await hianime.getEpisodeSources(fullEpisodeId,'hd-2');
  const originalSourceUrl = json.sources?.[0]?.url || "";

  if (!originalSourceUrl) {
    return <div className="text-white">No playable source found.</div>;
  }

  // Construct the proxy URL with the original URL as an encoded query parameter.
  const proxySourceUrl = `/api/proxy?target=${encodeURIComponent(originalSourceUrl)}`;

  return (
    <div className="p-4 bg-black min-h-screen">
      <h1 className="text-2xl text-white mb-4">Now Playing</h1>
      <Player src={proxySourceUrl} />
    </div>
  );
}
