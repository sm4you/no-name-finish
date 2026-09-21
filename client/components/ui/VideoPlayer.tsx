import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { parseVideoUrl, ParsedVideo } from "@shared/api";

interface VideoPlayerProps {
  url?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  showSoundToggle?: boolean;
  isEnglish?: boolean;
  onClick?: () => void;
}

export function VideoPlayer({
  url,
  poster,
  className = "w-full h-full",
  autoPlay = true,
  loop = true,
  muted: defaultMuted = true,
  controls = false,
  showSoundToggle = true,
  isEnglish = false,
  onClick,
}: VideoPlayerProps) {
  const [parsed, setParsed] = useState<ParsedVideo>(() => parseVideoUrl(url));
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParsed(parseVideoUrl(url));
  }, [url]);

  const effectivePoster = poster || parsed.thumbnailUrl;

  // For direct HTML5 video autoplay & mute handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video || parsed.type !== "direct") return;

    video.muted = isMuted;
    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay may be blocked if unmuted
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && autoPlay) {
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [parsed, autoPlay, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (parsed.type === "direct" && videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      setIsMuted(next);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  if (!url || parsed.type === "empty") {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 text-neutral-400 text-xs ${className}`}>
        {effectivePoster ? (
          <img src={effectivePoster} alt="Video thumbnail" className="w-full h-full object-cover" />
        ) : (
          <span>لا يوجد فيديو</span>
        )}
      </div>
    );
  }

  // YouTube / YouTube Shorts
  if (parsed.type === "youtube" && parsed.videoId) {
    const muteParam = isMuted ? "1" : "0";
    const ytEmbedUrl = `https://www.youtube-nocookie.com/embed/${parsed.videoId}?autoplay=1&mute=${muteParam}&loop=1&playlist=${parsed.videoId}&controls=${
      controls ? "1" : "0"
    }&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;

    return (
      <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`} onClick={onClick}>
        <iframe
          key={`${parsed.videoId}-${isMuted}`}
          src={ytEmbedUrl}
          title="YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 object-cover scale-[1.03]"
        />

        {showSoundToggle && (
          <button
            type="button"
            onClick={toggleMute}
            className={`absolute bottom-3 ${
              isEnglish ? "right-3" : "left-3"
            } w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition shadow-lg border border-white/20 z-20 cursor-pointer`}
            aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>
        )}
      </div>
    );
  }

  // Vimeo
  if (parsed.type === "vimeo" && parsed.embedUrl) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`} onClick={onClick}>
        <iframe
          src={`${parsed.embedUrl}&muted=${isMuted ? "1" : "0"}`}
          title="Vimeo Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
        {showSoundToggle && (
          <button
            type="button"
            onClick={toggleMute}
            className={`absolute bottom-3 ${
              isEnglish ? "right-3" : "left-3"
            } w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition shadow-lg border border-white/20 z-20 cursor-pointer`}
            aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>
        )}
      </div>
    );
  }

  // Direct MP4 / WebM / Blob
  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`} onClick={onClick}>
      <video
        ref={videoRef}
        src={parsed.directUrl}
        poster={effectivePoster}
        autoPlay={autoPlay}
        playsInline
        muted={isMuted}
        loop={loop}
        controls={controls}
        preload="auto"
        className="w-full h-full object-cover"
      />
      {showSoundToggle && !controls && (
        <button
          type="button"
          onClick={toggleMute}
          className={`absolute bottom-3 ${
            isEnglish ? "right-3" : "left-3"
          } w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition shadow-lg border border-white/20 z-20 cursor-pointer`}
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
        </button>
      )}
    </div>
  );
}
