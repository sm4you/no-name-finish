import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/components/store/StoreLayout";
import { DiscoverVideoItem } from "@shared/api";

export const defaultDiscoverVideos: DiscoverVideoItem[] = [
  {
    id: "v1",
    title: "Daytime Linen Collection",
    titleAr: "إطلالات الكتان النهاري",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-42289-large.mp4",
    link: "/shop?category=Sets",
  },
  {
    id: "v2",
    title: "Flowy Dresses & Movement",
    titleAr: "حركة وأناقة الفساتين",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-woman-turning-while-wearing-a-dress-41870-large.mp4",
    link: "/shop?category=Dresses",
  },
  {
    id: "v3",
    title: "Summer Walk Lookbook",
    titleAr: "إطلالة الصيف العصرية",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-summer-dress-41871-large.mp4",
    link: "/shop?collection=new",
  },
  {
    id: "v4",
    title: "Minimal Chic & Modest Wear",
    titleAr: "أناقة بسيطة ومحتشمة",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-turtleneck-sweater-posing-for-the-camera-42790-large.mp4",
    link: "/shop?category=Blouses%20%2F%20shirts",
  },
  {
    id: "v5",
    title: "Everyday Modest Elegance",
    titleAr: "أناقة الإطلالات اليومية",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-a-stylish-woman-in-an-autumn-outfit-posing-in-a-park-42784-large.mp4",
    link: "/shop?category=Skirts%20%2F%20pants",
  },
  {
    id: "v6",
    title: "Studio Editorial Reel",
    titleAr: "جلسة تصوير حصرية",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
    video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-neon-lights-42290-large.mp4",
    link: "/shop?collection=bestsellers",
  },
];

function DiscoverCard({
  item,
  isEnglish,
  isDragging,
}: {
  item: DiscoverVideoItem;
  isEnglish: boolean;
  isDragging: boolean;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-play the video continuously on load and when entering viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay policy fallback: keep muted and retry on interaction
      });
    };

    tryPlay();

    // IntersectionObserver to ensure playback when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Toggle Mute / Sound Only
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleCardClick = () => {
    if (isDragging) return;
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative w-[230px] sm:w-[260px] md:w-[280px] aspect-[9/16] flex-shrink-0 snap-start rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 shadow-md cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-black/10"
      onClick={handleCardClick}
    >
      {/* Continuous Auto-Playing Promotional Video */}
      <video
        ref={videoRef}
        src={item.video}
        poster={item.image}
        autoPlay
        playsInline
        muted={isMuted}
        loop
        preload="auto"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Subtle bottom shadow gradient to elevate the look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Only Sound / Mute Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        className={`absolute bottom-3.5 ${
          isEnglish ? "right-3.5" : "left-3.5"
        } w-10 h-10 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-lg border border-white/20 hover:scale-110 active:scale-95 cursor-pointer z-20`}
        aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        title={isMuted ? (isEnglish ? "Unmute" : "تشغيل الصوت") : (isEnglish ? "Mute" : "كتم الصوت")}
      >
        {isMuted ? (
          <VolumeX size={17} className="text-white/90" />
        ) : (
          <Volume2 size={17} className="text-white animate-pulse" />
        )}
      </button>
    </div>
  );
}

export function ClassicDiscover() {
  const { siteSettings, sections, language } = useStore();
  const isEnglish = language === "en";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const items: DiscoverVideoItem[] =
    siteSettings.discoverItems && siteSettings.discoverItems.length > 0
      ? siteSettings.discoverItems
      : defaultDiscoverVideos;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 300;

    const isRtl = !isEnglish;
    let delta = direction === "right" ? scrollAmount : -scrollAmount;
    if (isRtl) {
      delta = direction === "left" ? -scrollAmount : scrollAmount;
    }

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  return (
    <section className="bg-white py-14 sm:py-18 border-b border-[#1c2822]/10 overflow-hidden">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#8a5d3b] font-bold mb-1">
              <Sparkles size={14} />
              <span>VIDEO LOOKBOOK</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-wider text-[#1c1817]"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {sections.discover?.title || (isEnglish ? "Discover your style" : "Discover your style")}
            </h2>
            <p className="text-xs text-[#1c2822]/60 mt-1 max-w-md">
              {sections.discover?.description || (isEnglish ? "Explore the latest looks." : "Explore the latest looks.")}
            </p>
          </div>

          {/* Desktop / Tablet Scroll Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="w-10 h-10 rounded-full border border-[#1c1817]/20 bg-white hover:bg-[#1c1817] hover:text-white text-[#1c1817] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              aria-label={isEnglish ? "Previous videos" : "الفيديوهات السابقة"}
              title={isEnglish ? "Scroll Left" : "تمرير لليسار"}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="w-10 h-10 rounded-full border border-[#1c1817]/20 bg-white hover:bg-[#1c1817] hover:text-white text-[#1c1817] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              aria-label={isEnglish ? "Next videos" : "الفيديوهات التالية"}
              title={isEnglish ? "Scroll Right" : "تمرير لليمين"}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Reel Track */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth touch-pan-x cursor-grab ${
            isMouseDown ? "cursor-grabbing select-none" : ""
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item, idx) => (
            <DiscoverCard
              key={item.id || idx}
              item={item}
              isEnglish={isEnglish}
              isDragging={isDragging}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
