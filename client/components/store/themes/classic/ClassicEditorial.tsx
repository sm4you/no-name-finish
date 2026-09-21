import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "@/components/store/StoreLayout";

export function ClassicEditorial() {
  const { sections, language } = useStore();
  const isEnglish = language === "en";

  const editorialImage =
    sections.editorial?.image ||
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=85";

  return (
    <section className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-[#1c2822]/10">
      {/* Full-width background image */}
      <img
        src={editorialImage}
        alt="Editorial Vision & Story"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark luxury overlay for high readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/70" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

      {/* Content directly overlaid on the full-width image */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center text-white">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-5">
          <Sparkles size={14} className="text-[#e6b980]" />
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#e6b980] font-bold">
            {isEnglish ? "Our Philosophy & Story" : "رؤيتنا وقصتنا"}
          </span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wide text-white leading-tight sm:leading-tight drop-shadow-md max-w-3xl mx-auto">
          {sections.editorial?.title || (isEnglish ? "Effortless style & Timeless Grace" : "أناقة عفوية.. وجمال يدوم")}
        </h2>

        <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow font-light">
          {sections.editorial?.description ||
            (isEnglish
              ? "Thoughtful designs created for your everyday moments. Natural breathable fabrics tailored with Egyptian craftsmanship, precision, and passion."
              : "تصاميم مدروسة لتلائم كل لحظة في يومكِ، بأقمشة طبيعية منتقاة بعناية وخياطة مصرية راقية تعكس هويتكِ وأناقتكِ.")}
        </p>

        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4">
          <Link
            to="/about"
            className="inline-flex items-center gap-2.5 bg-white text-[#1c1817] hover:bg-[#d4775c] hover:text-white px-8 py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>{isEnglish ? "Discover Our Story" : "اكتشفي قصتنا"}</span>
            {isEnglish ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </Link>
        </div>
      </div>
    </section>
  );
}

