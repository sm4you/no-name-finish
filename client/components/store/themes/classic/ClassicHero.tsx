import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/components/store/StoreLayout";

export function ClassicHero() {
  const { siteSettings, sections, language } = useStore();
  const isEnglish = language === "en";
  const navigate = useNavigate();

  const heroImage =
    sections.arrivals?.image ||
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1900&q=85";

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1c2822] text-white">
      <img
        src={heroImage}
        alt="No Name Modest Wear"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-24 text-center lg:px-8">
        <span className="mb-4 inline-block font-sans text-xs tracking-[0.3em] uppercase text-[#e6b980] font-semibold">
          {siteSettings.heroTitle || (isEnglish ? "New for Summer 2026" : "تشكيلة صيف 2026")}
        </span>
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.08em] leading-tight text-white"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {siteSettings.storeName || "No Name"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-white/80 font-light">
          {siteSettings.heroDescription ||
            (isEnglish
              ? "Modest styles designed for everyday comfort and refined elegance."
              : "أزياء محتشمة مصممة لراحتكِ اليومية وأناقتكِ الطبيعية.")}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/shop?collection=new")}
            className="border border-white/60 bg-white/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-xs transition hover:bg-white hover:text-black cursor-pointer"
            style={{ borderColor: siteSettings.accent || "#d4775c" }}
          >
            {isEnglish ? "Explore Collection" : "استكشفي التشكيلة"}
          </button>
          <button
            onClick={() => navigate("/shop?category=Sets")}
            className="bg-white text-black px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-[#eeece1] cursor-pointer"
          >
            {isEnglish ? "Shop Sets" : "تسوقي الأطقم"}
          </button>
        </div>
      </div>
    </section>
  );
}
