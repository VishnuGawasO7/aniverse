"use client";

import { useEffect, useRef, useState } from "react";
import Hls, { ErrorData, Events } from "hls.js";

interface PlayerProps {
  src: string;       // URL of the .m3u8 (should be your proxy URL)
  poster?: string;   // Optional poster image
  className?: string; // Additional CSS classes, if desired
}

export default function Player({ src, poster, className = "" }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Decode any encoded URL.
  src = decodeURIComponent(src);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quality control state:
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  // currentLevel === -1 implies auto quality.
  const [currentLevel, setCurrentLevel] = useState<number>(-1); 

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Clean up any previous Hls instance.
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
      
      hls.on(Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);
      });
      
      hls.on(Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        // Save quality level options from the parsed manifest.
        setLevels(hls.levels);
        setCurrentLevel(hls.currentLevel); // -1 means auto quality.
      });
      
      // Update the UI when the quality level changes.
      hls.on(Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentLevel(hls.currentLevel);
      });
      
      hls.on(Events.ERROR, (_event, data: ErrorData) => {
        console.error("HLS.js error:", data);
        setError(data.details || "An unknown HLS error occurred");
        setIsLoading(false);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS fallback.
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
      });
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
  }, [src]);
  
  // Handler for quality selection.
  const onQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value, 10);
    setCurrentLevel(newLevel);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = newLevel; // -1 stands for auto.
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {poster && (
        <img
          src={poster}
          alt="video poster"
          className="absolute inset-0 w-full h-full object-cover blur-md"
        />
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
  
      {/* Quality Dropdown */}
      {levels.length > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 p-2 rounded">
          <select
            className="bg-black text-white text-sm"
            value={currentLevel}
            onChange={onQualityChange}
          >
            <option value={-1}>Auto</option>
            {levels.map((level, index) => {
              const label = level.height ? `${level.height}p` : `Level ${index}`;
              return (
                <option key={index} value={index}>
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
