"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls, { ErrorData, Events } from "hls.js";
import Image from "next/image";

interface PlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function Player({ src, poster, className = "" }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const decodedSrc = useMemo(() => decodeURIComponent(src), [src]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.attachMedia(video);

      hls.on(Events.MEDIA_ATTACHED, () => hls.loadSource(decodedSrc));
      hls.on(Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setLevels(hls.levels);
        setCurrentLevel(hls.currentLevel);
      });
      hls.on(Events.LEVEL_SWITCHED, () =>
        setCurrentLevel(hls.currentLevel)
      );
      hls.on(Events.ERROR, (_e, data: ErrorData) => {
        console.error("HLS.js error:", data);
        setError(data.details || "An unknown HLS error occurred");
        setIsLoading(false);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = decodedSrc;
      video.addEventListener("loadedmetadata", () => setIsLoading(false));
      video.addEventListener("error", () => {
        setError("Native HLS playback failed");
        setIsLoading(false);
      });
    } else {
      setError("HLS is not supported in this browser");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [decodedSrc]);

  const onQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value, 10);
    setCurrentLevel(newLevel);
    if (hlsRef.current) hlsRef.current.currentLevel = newLevel;
  };

  return (
    <div className={`relative ${className}`}>
      {poster && (
        <div className="absolute inset-0">
          <Image
            src={poster}
            alt="video poster"
            fill
            className="object-cover blur-md"
          />
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          Loading video…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-75 text-white p-4">
          <p>Error: {error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className="w-full rounded-lg shadow-lg relative"
      />

      {levels.length > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 p-2 rounded">
          <select
            className="bg-black text-white text-sm"
            value={currentLevel}
            onChange={onQualityChange}
          >
            <option value={-1}>Auto</option>
            {levels.map((level, idx) => {
              const label = level.height ? `${level.height}p` : `Level ${idx}`;
              return (
                <option key={idx} value={idx}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
}
