import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useStore, ProductCard, StoreProduct } from "@/components/store/StoreLayout";

function CollectionShelf({
  title,
  category,
  products,
  isEnglish,
}: {
  title: string;
  category: string;
  products: StoreProduct[];
  isEnglish: boolean;
}) {
  const shelfRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (shelfRef.current) {
      const scrollAmount = 320;
      shelfRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filtered = products.filter(
    (p) =>
      p.category === category ||
      p.category === title ||
      (p.category_slug && (p.category_slug === category || p.category_slug === title.toLowerCase()))
  );
  if (!filtered.length) return null;

  return (
    <section className="py-12 border-b border-[#1c2822]/10 bg-white">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1c1817] tracking-wider" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>{title}</h2>
            <Link
              to={`/shop?category=${encodeURIComponent(category)}`}
              className="text-xs text-[#8a5d3b] hover:underline font-medium mt-1 inline-block"
            >
              {isEnglish ? `View all (${filtered.length}) →` : `عرض الكل (${filtered.length}) ←`}
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-[#1c1817] hover:bg-black hover:text-white transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-[#1c1817] hover:bg-black hover:text-white transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ArrowLeft size={14} />
            </button>
          </div>
        </div>

        <div
          ref={shelfRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filtered.map((product, idx) => (
            <div key={product.id} className="min-w-[220px] sm:min-w-[260px] snap-start shrink-0">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClassicShelves() {
  const { catalog, language } = useStore();
  const isEnglish = language === "en";

  const sets = catalog.filter((p) => p.category === "أطقم" || p.category === "Sets");
  const tops = catalog.filter(
    (p) => p.category === "توبس" || p.category === "Blouses / shirts" || p.category === "قمصان"
  );
  const pants = catalog.filter(
    (p) => p.category === "بنطال" || p.category === "Skirts / pants" || p.category === "تنانير"
  );
  const dresses = catalog.filter((p) => p.category === "فساتين" || p.category === "Dresses");
  const denims = catalog.filter((p) => p.category === "جينز" || p.category === "Denims");

  return (
    <>
      <CollectionShelf
        title="Sets"
        category="sets"
        products={sets}
        isEnglish={isEnglish}
      />
      <CollectionShelf
        title="Blouses / shirts"
        category="blouses-shirts"
        products={tops}
        isEnglish={isEnglish}
      />
      <CollectionShelf
        title="Skirts / pants"
        category="skirts-pants"
        products={pants}
        isEnglish={isEnglish}
      />
      <CollectionShelf
        title="Dresses"
        category="dresses"
        products={dresses}
        isEnglish={isEnglish}
      />
      {denims.length > 0 && (
        <CollectionShelf
          title="Denims"
          category="denims"
          products={denims}
          isEnglish={isEnglish}
        />
      )}
    </>
  );
}
