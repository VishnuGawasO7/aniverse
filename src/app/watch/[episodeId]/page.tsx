// File: src/app/watch/[episodeId]/page.tsx
import Player from "@/components/player";
import { hianime } from "@/lib/aniwatch";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ episodeId: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  // Await the async props
  const { episodeId } = await params;
  const { ep } = await searchParams;

  // Rebuild the episode ID query
  const fullEpisodeId = ep
    ? `${episodeId}?ep=${encodeURIComponent(ep)}`
    : episodeId;

  // Fetch the source URL
  const json = await hianime.getEpisodeSources(fullEpisodeId, "hd-2");
  const originalSourceUrl = json.sources?.[0]?.url || "";

  if (!originalSourceUrl) {
    return <div className="text-white">No playable source found.</div>;
  }

  // Proxy through your API
  const proxySourceUrl = `/api/proxy?target=${encodeURIComponent(
    originalSourceUrl
  )}`;

  return (
    <div className="p-4 bg-black min-h-screen">
      <h1 className="text-2xl text-white mb-4">Now Playing</h1>
      <Player src={proxySourceUrl} />
    </div>
  );
}
