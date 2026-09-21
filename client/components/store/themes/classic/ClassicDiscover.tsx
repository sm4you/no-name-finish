import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Volume2, VolumeX, ShoppingBag, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/components/store/StoreLayout";
import { DiscoverVideoItem } from "@shared/api";

const defaultDiscoverVideos: DiscoverVideoItem[] = [
  {
    id: "v1",
    title: "Daytime Linen Collection",
    titleAr: "إطلالات الكتان النهاري",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    link: "/shop?category=Sets",
  },
  {
    id: "v2",
    title: "City Walks & Flowy Dresses",
    titleAr: "فساتين المشاوير اليومية",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    link: "/shop?category=Dresses",
  },
  {
    id: "v3",
    title: "Evening Chic & Modest Looks",
    titleAr: "أناقة السهرات الراقية",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    link: "/shop?collection=new",
  },
  {
    id: "v4",
    title: "Relaxed Fit Sets & Pants",
    titleAr: "الأطقم الواسعة المريحة",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    link: "/shop?category=Skirts%20%2F%20pants",
  },
  {
    id: "v5",
    title: "Summer Breeze & Scarves",
    titleAr: "أناقة الصيف والشالات الخفيفة",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    link: "/shop?category=Scarves",
  },
  {
    id: "v6",
    title: "Classic Earth Tones",
    titleAr: "درجات الألوان الترابية الكلاسيكية",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Toggle video play / pause directly in the card without any popup modal
  const toggleInlinePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDragging) return;
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleInlineMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleShopThisLook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    navigate(item.link || "/shop");
  };

  const title = isEnglish ? item.title : item.titleAr || item.title;

  return (
    <div
      className="group relative w-[240px] sm:w-[270px] md:w-[290px] aspect-[9/16] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-neutral-900 shadow-md cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-black/10"
      onClick={toggleInlinePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inline Video Player */}
      <video
        ref={videoRef}
        poster={item.image}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      >
        <source src={item.video} type="video/mp4" />
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay gradients */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
          isPlaying
            ? "bg-gradient-to-t from-black/85 via-black/15 to-black/30"
            : "bg-gradient-to-t from-black/80 via-black/20 to-black/40"
        }`}
      />

      {/* Center Play / Pause Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/95 text-[#1c1817] flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all duration-300 ${
            isPlaying
              ? isHovered
                ? "opacity-90 scale-100"
                : "opacity-0 scale-75"
              : "opacity-95 scale-100 shadow-black/40 animate-pulse"
          }`}
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-1 text-[#1c1817]" />
          )}
        </div>
      </div>

      {/* Top Bar: Reel Tag & Mute Button */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium flex items-center gap-1.5 shadow-sm border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-[#d4775c]"}`} />
          <span className="tracking-wider">REEL</span>
        </div>

        {isPlaying && (
          <button
            type="button"
            onClick={toggleInlineMute}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition shadow-sm border border-white/10"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
      </div>

      {/* Bottom Information & Shop This Look Button */}
      <div className="absolute bottom-3.5 inset-x-3.5 z-10 flex flex-col gap-2">
        <div className="text-center">
          <span className="block text-white font-serif font-bold text-sm sm:text-base drop-shadow line-clamp-1">
            {title}
          </span>
          <span className="text-[10px] text-white/70 block mt-0.5">
            {isPlaying
              ? isEnglish
                ? "Click to pause"
                : "انقري لإيقاف الفيديو"
              : isEnglish
              ? "Click to play"
              : "انقري لتشغيل الفيديو"}
          </span>
        </div>

        {/* Shop This Look Button (Navigates directly to product) */}
        <button
          type="button"
          onClick={handleShopThisLook}
          className="w-full py-2 px-3 rounded-xl bg-white text-[#1c1817] hover:bg-[#d4775c] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
          title={isEnglish ? "Shop this look" : "تسوقي الإطلالة"}
        >
          <ShoppingBag size={13} />
          <span>{isEnglish ? "Shop this look" : "تسوقي الإطلالة"}</span>
        </button>
      </div>
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

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items: DiscoverVideoItem[] =
    siteSettings.discoverItems && siteSettings.discoverItems.length > 0
      ? siteSettings.discoverItems
      : defaultDiscoverVideos;

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // In RTL mode, scrollLeft can be negative or 0 depending on browser
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);

    setCanScrollLeft(absScroll > 10);
    setCanScrollRight(absScroll < maxScroll - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 320;
    
    // Check direction based on RTL vs LTR
    const isRtl = !isEnglish;
    let delta = direction === "right" ? scrollAmount : -scrollAmount;
    if (isRtl) {
      // In RTL, left arrow moves visually left, right arrow moves visually right
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
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
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
    <section className="bg-white py-16 border-b border-[#1c2822]/10 overflow-hidden">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#8a5d3b] font-bold mb-1">
              <Sparkles size={14} />
              <span>{isEnglish ? "Video Lookbook" : "فيديوهات الإطلالات"}</span>
            </div>
            <h2 className="font-times text-2xl sm:text-3xl font-bold tracking-wider text-[#1c1817]">
              {sections.discover?.title || (isEnglish ? "Discover your style" : "اكتشفي أسلوبكِ")}
            </h2>
            <p className="text-xs text-[#1c2822]/60 mt-1 max-w-md">
              {sections.discover?.description ||
                (isEnglish
                  ? "Swipe or drag horizontally. Tap any video to play directly and shop the look."
                  : "مرري يميناً ويساراً بالماوس أو اللمس. انقري على أي فيديو لتشغيله وتسوق الإطلالة.")}
            </p>
          </div>

          {/* Desktop / Tablet Scroll Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="w-10 h-10 rounded-full border border-[#1c1817]/20 bg-white hover:bg-[#1c1817] hover:text-white text-[#1c1817] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer disabled:opacity-40"
              aria-label={isEnglish ? "Previous videos" : "الفيديوهات السابقة"}
              title={isEnglish ? "Scroll Left" : "تمرير لليسار"}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="w-10 h-10 rounded-full border border-[#1c1817]/20 bg-white hover:bg-[#1c1817] hover:text-white text-[#1c1817] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95 cursor-pointer disabled:opacity-40"
              aria-label={isEnglish ? "Next videos" : "الفيديوهات التالية"}
              title={isEnglish ? "Scroll Right" : "تمرير لليمين"}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Reel Track (Touch Swipe + Mouse Drag) */}
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


