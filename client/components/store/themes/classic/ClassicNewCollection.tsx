import React from "react";
import { Link } from "react-router-dom";
import { useStore, ProductCard } from "@/components/store/StoreLayout";

export function ClassicNewCollection() {
  const { catalog, sections, language } = useStore();
  const isEnglish = language === "en";

  // Display first 8 products or products assigned to classic/all
  const classicProducts = catalog.filter(
    (p) => !p.template || p.template === "all" || p.template === "classic"
  );
  const newCollection = (classicProducts.length ? classicProducts : catalog).slice(0, 8);

  return (
    <section className="bg-white py-16 px-5 lg:px-8 border-b border-[#1c2822]/10">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold tracking-wider text-[#1c1817]"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {sections.arrivals?.title || (isEnglish ? "New Collection" : "وصل حديثاً")}
            </h2>
            <p className="text-xs text-[#1c2822]/60 mt-1">
              {sections.arrivals?.description ||
                (isEnglish ? "New pieces have just arrived." : "قطع جديدة وصلت لتوها.")}
            </p>
          </div>
          <Link
            to="/shop?collection=new"
            className="text-xs text-[#8a5d3b] hover:underline font-bold"
          >
            {isEnglish ? "View all" : "عرض الكل"} {isEnglish ? "→" : "←"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {newCollection.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
