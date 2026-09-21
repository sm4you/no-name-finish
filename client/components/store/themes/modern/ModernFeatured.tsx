import React from "react";
import { Link } from "react-router-dom";
import { useStore, ProductCard } from "@/components/store/StoreLayout";

export function ModernFeatured() {
  const { catalog, sections, language } = useStore();
  const isEnglish = language === "en";

  // Products available to modern or all
  const modernProducts = catalog.filter(
    (p) => !p.template || p.template === "all" || p.template === "modern"
  );
  const displayProducts = (modernProducts.length ? modernProducts : catalog).slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1c1817]">
            {sections.arrivals?.title || (isEnglish ? "New Drops" : "أحدث الإضافات")}
          </h2>
          <p className="text-xs text-[#7e746c] mt-1">
            {sections.arrivals?.description ||
              (isEnglish ? "Discover our newest styles" : "اكتشفي جديد أزياء الموسم")}
          </p>
        </div>
        <Link to="/shop" className="text-xs font-bold text-[#8a5d3b] hover:underline">
          {isEnglish ? "View all catalog →" : "عرض كل الكتالوج ←"}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {displayProducts.map((p, idx) => (
          <ProductCard key={p.id} product={p} index={idx} />
        ))}
      </div>
    </section>
  );
}
