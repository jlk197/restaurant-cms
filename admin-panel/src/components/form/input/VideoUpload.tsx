import React, { useState } from "react";

interface VideoUploadProps {
  currentVideo?: string;
  onVideoUrlChanged: (url: string) => void;
  className?: string;
}

export const getEmbedUrl = (url: string): string => {
  if (!url) return "";

  // Convert YouTube watch URLs to embed URLs
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert short YouTube URLs to embed URLs
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert Vimeo URLs to embed URLs
  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1].split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
};

const VideoUpload: React.FC<VideoUploadProps> = ({
  currentVideo,
  onVideoUrlChanged,
  className = "",
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(currentVideo || "");
  const [error, setError] = useState<string>("");

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setVideoUrl(url);

    // Basic URL validation
    if (url && !isValidVideoUrl(url)) {
      setError(
        "Please enter a valid video URL (YouTube, Vimeo, or direct video link)"
      );
    } else {
      setError("");
      onVideoUrlChanged(url);
    }
  };

  const isValidVideoUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Check for common video platforms or direct video files
      const validDomains = ["youtube.com", "youtu.be", "vimeo.com"];
      const validExtensions = [".mp4", ".webm", ".ogg"];

      const isValidDomain = validDomains.some((domain) =>
        urlObj.hostname.includes(domain)
      );
      const isValidExtension = validExtensions.some((ext) =>
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      return (
        isValidDomain || isValidExtension || urlObj.pathname.includes("embed")
      );
    } catch {
      return false;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {videoUrl && (
        <div className="relative inline-block w-full max-w-2xl">
          <div className="aspect-video w-full">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full border border-gray-200 rounded-lg dark:border-gray-800"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video preview"
            />
          </div>
        </div>
      )}

      <div>
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="Enter video URL (YouTube, Vimeo, or direct link)"
          className="focus:border-ring-brand-300 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3.5 text-sm text-gray-900 shadow-theme-xs transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400"
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Supported: YouTube, Vimeo, or direct video links (.mp4, .webm, .ogg)
      </div>
    </div>
  );
};

export default VideoUpload;
