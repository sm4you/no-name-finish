import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useStore, ProductCard } from "@/components/store/StoreLayout";

export function ModernShelves() {
  const { catalog, language } = useStore();
  const isEnglish = language === "en";

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: isEnglish ? "All Products" : "جميع المنتجات" },
    { id: "Sets", label: isEnglish ? "Sets" : "الأطقم", arKey: "أطقم" },
    { id: "Blouses / shirts", label: isEnglish ? "Blouses / shirts" : "البلوزات والقمصان", arKey: "توبس" },
    { id: "Skirts / pants", label: isEnglish ? "Skirts / pants" : "التنانير والبناطيل", arKey: "بنطال" },
    { id: "Dresses", label: isEnglish ? "Dresses" : "الفساتين", arKey: "فساتين" },
    { id: "Denims", label: isEnglish ? "Denims" : "الجينز", arKey: "جينز" },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? catalog
      : catalog.filter(
          (p) =>
            p.category === activeCategory ||
            (categories.find((c) => c.id === activeCategory)?.arKey &&
              p.category === categories.find((c) => c.id === activeCategory)?.arKey)
        );

  return (
    <section className="bg-[#f9f7f4] py-16 px-4 sm:px-6 lg:px-8 border-t border-[#ded5cb]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8a5d3b] font-semibold">
              {isEnglish ? "Curated Collections" : "مجموعات مختارة"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1817] mt-1">
              {isEnglish ? "Shop By Category" : "تسوقي حسب الفئة"}
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#1c1817] text-white shadow-sm"
                    : "bg-white border border-[#ded5cb] text-[#554e4a] hover:bg-[#ece6de]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.slice(0, 8).map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-[#1c1817] text-[#1c1817] hover:bg-[#1c1817] hover:text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            {isEnglish ? "Explore All Items" : "استكشفي كافة المنتجات"}
          </Link>
        </div>
      </div>
    </section>
  );
}
