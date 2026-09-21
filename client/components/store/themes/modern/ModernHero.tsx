import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { useStore } from "@/components/store/StoreLayout";

export function ModernHero() {
  const { siteSettings, sections, language } = useStore();
  const isEnglish = language === "en";
  const navigate = useNavigate();

  const heroImage =
    sections.arrivals?.image ||
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85";

  return (
    <section className="relative overflow-hidden bg-[#f3ede5] border-b border-[#e5dcce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#ded5cb] text-xs font-semibold text-[#8a5d3b]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{siteSettings.heroTitle || (isEnglish ? "Summer Collection 2026" : "تشكيلة صيف 2026")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1c1817] leading-[1.15]">
              {isEnglish ? (
                <>
                  Modest Elegance <br />
                  <span className="text-[#8a5d3b] font-normal italic font-serif">Tailored for Every Moment</span>
                </>
              ) : (
                <>
                  أناقة محتشمة <br />
                  <span className="text-[#8a5d3b] font-normal italic font-serif">تلائم تفاصيل يومكِ</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#615852] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {siteSettings.heroDescription ||
                (isEnglish
                  ? "Exclusive designs blending modest relaxed cuts with breathable natural fabrics."
                  : "تصاميم حصرية تمزج بين القصات الفضفاضة الراقية والخامات الطبيعية المريحة، لتمنحكِ الثقة في كل خطوة.")}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/shop")}
                className="w-full sm:w-auto bg-[#1c1817] hover:bg-[#38312e] text-white px-8 h-12 text-sm font-bold shadow-md rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>{isEnglish ? "Shop Full Collection" : "تسوقي التشكيلة الكاملة"}</span>
                {isEnglish ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate("/shop?category=Sets")}
                className="w-full sm:w-auto border border-[#bfae9e] text-[#1c1817] hover:bg-white/60 h-12 px-8 text-sm font-medium rounded-xl cursor-pointer transition"
              >
                {isEnglish ? "Linen Sets" : "أطقم الكتان واليومي"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#ece5dc]">
              <img
                src={heroImage}
                alt="No Name Modest Wear"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
