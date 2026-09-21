import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Heart, Award, Scissors } from "lucide-react";
import { StoreLayout, useStore } from "@/components/store/StoreLayout";

export default function About() {
  const { pageSettings, language } = useStore();
  const isEnglish = language === "en";
  const about = pageSettings.about;

  const heroImage =
    about.image1 ||
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=85";

  const secondaryImage =
    about.image2 ||
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85";

  return (
    <StoreLayout>
      {/* 1. Full-width Hero Banner with text directly on top */}
      <div className="relative w-full min-h-[480px] sm:min-h-[560px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Our Story"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/75" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-5">
            <Sparkles size={14} className="text-[#e6b980]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#e6b980] font-bold">
              {isEnglish ? "Our Story" : "قصتنا"}
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl leading-tight drop-shadow-md">
            {isEnglish
              ? about.titleEn || "When you are truly yourself."
              : about.titleAr || "لما تكوني على طبيعتك."}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light drop-shadow">
            {isEnglish
              ? about.introEn ||
                "no name began with a simple question: why should we choose between feeling comfortable and looking beautiful?"
              : about.introAr ||
                "بدأت no name من سؤال بسيط: ليه لازم نختار بين إننا نكون مرتاحين وإننا نكون أنيقين؟"}
          </p>
        </div>
      </div>

      {/* 2. Full-width Story Narrative Card */}
      <div className="bg-[#faf8f5] py-20 px-6 lg:px-12 border-b border-[#ece6df]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1c1817] mb-6">
            {isEnglish
              ? about.beliefTitleEn || "Good clothes start with a feeling."
              : about.beliefTitleAr || "اللبس الحلو بيبدأ من الإحساس."}
          </h2>

          <div className="space-y-6 text-[#554e4a] text-base sm:text-lg leading-relaxed font-normal">
            <p>
              {isEnglish
                ? about.bodyEn ||
                  "We are an independent Egyptian label designing for women who know themselves well. We choose comfortable fabrics, considered cuts, and colors that live beyond one season."
                : about.bodyAr ||
                  "نحن علامة مصرية مستقلة نصمم للمرأة التي تعرف نفسها جيداً. نختار خامات مريحة، قصّات ذكية، وألواناً تعيش أبعد من موسم واحد وتمنحكِ الثقة في كل خطوة."}
            </p>
            <p>
              {isEnglish
                ? about.body2En ||
                  "Every piece is made with local artisans in Cairo. The smallest details, from the first stitch to the last button, are what make a piece special."
                : about.body2Ar ||
                  "كل قطعة تُصنع بالتعاون مع حرفيين محليين في القاهرة بأعلى معايير الجودة، لأن التفاصيل الدقيقة من أول غرزة لآخر زر هي سر تميز كل إطلالة."}
            </p>
          </div>

          {/* Core Values Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#ece6df]">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#ece6df] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#faf4ef] text-[#d4775c] flex items-center justify-center mb-4">
                <Heart size={22} />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1817] mb-1">
                {isEnglish ? "Comfort First" : "راحة طبيعية"}
              </h3>
              <p className="text-xs text-[#554e4a]">
                {isEnglish ? "Finest breathable fabrics" : "أقمشة طبيعية منتقاة لتنفس البشرة"}
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#ece6df] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#faf4ef] text-[#d4775c] flex items-center justify-center mb-4">
                <Scissors size={22} />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1817] mb-1">
                {isEnglish ? "Egyptian Craftsmanship" : "صناعة مصرية راقية"}
              </h3>
              <p className="text-xs text-[#554e4a]">
                {isEnglish ? "Handcrafted with local artisans" : "بأيادي حرفيين محليين في القاهرة"}
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#ece6df] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#faf4ef] text-[#d4775c] flex items-center justify-center mb-4">
                <Award size={22} />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c1817] mb-1">
                {isEnglish ? "Timeless Design" : "تصاميم تدوم"}
              </h3>
              <p className="text-xs text-[#554e4a]">
                {isEnglish ? "Cuts that stay elegant across seasons" : "قصات متجددة تتخطى المواسم"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Full-width Secondary Visual with CTA */}
      <div className="relative w-full min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={secondaryImage}
          alt="Explore Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

        <div className="relative z-10 text-center px-6 py-16 text-white max-w-xl mx-auto">
          <h3 className="font-serif font-bold text-2xl sm:text-4xl mb-4 drop-shadow">
            {isEnglish ? "Ready to find your piece?" : "جاهزة لتجديد خزانتكِ؟"}
          </h3>
          <p className="text-sm sm:text-base text-white/85 mb-8 font-light drop-shadow">
            {isEnglish
              ? "Explore our newly released collection designed for your unique everyday elegance."
              : "استكشفي أحدث تشكيلاتنا المصممة لتمنحكِ الأناقة والراحة كل يوم."}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 bg-white text-[#1c1817] hover:bg-[#d4775c] hover:text-white px-8 py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>{isEnglish ? "Explore Collection" : "استكشفي التشكيلة الآن"}</span>
            {isEnglish ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}

