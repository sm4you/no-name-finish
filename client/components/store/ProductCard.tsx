import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { Product } from "@shared/api";
import { useCart } from "@/context/CartContext";
import { useStore, normalizeCategory } from "@/components/store/StoreLayout";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { language } = useStore();
  const isEnglish = language === "en";

  const hasDiscount = product.original_price && product.price < product.original_price;
  const primaryImage =
    product.images?.[0] || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85";
  const secondaryImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || "M";
    const defaultColor = product.colors?.[0] || "#1a1a1a";
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const badgeText =
    product.badge ||
    (hasDiscount
      ? isEnglish
        ? `${discountPercent}% OFF`
        : `خصم ${discountPercent}%`
      : product.is_new
      ? isEnglish
        ? "NEW"
        : "جديد"
      : "");

  const displayName = isEnglish
    ? product.name_en || product.name_ar
    : product.name_ar || product.name_en;

  const categoryName = normalizeCategory(product.category || product.category_slug || "");

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#eee7df] hover:shadow-lg transition-all duration-300">
      {/* Image & Badges */}
      <Link to={`/product/${product.slug || product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f4eee6] block">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={displayName}
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
          }`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Secondary Hover Image */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${displayName} - alternate view`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Badges container */}
        {badgeText && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <span
              className={`text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                hasDiscount ? "bg-[#d4775c]" : "bg-[#1c1817]"
              }`}
            >
              {badgeText}
            </span>
          </div>
        )}

        {/* Quick action buttons overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3 gap-2">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-white/95 hover:bg-white text-[#1c1817] font-semibold text-xs py-2.5 px-3 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#8a5d3b]" />
            <span>{isEnglish ? "Add to Bag" : "إضافة للسلة"}</span>
          </button>
          <span className="bg-white/95 hover:bg-white text-[#1c1817] p-2.5 rounded-xl shadow-md backdrop-blur-sm flex items-center justify-center transition-transform active:scale-95">
            <Eye className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-[#8a5d3b] uppercase tracking-wider mb-1">
            {categoryName}
          </div>
          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="text-sm font-bold text-[#1c1817] hover:text-[#8a5d3b] transition-colors line-clamp-1">
              {displayName}
            </h3>
          </Link>
          {!isEnglish && product.name_en && (
            <p className="text-[11px] text-[#8a817c] line-clamp-1 mt-0.5">{product.name_en}</p>
          )}
        </div>

        {/* Colors dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.slice(0, 5).map((color, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Price display */}
        <div className="mt-3 pt-2 border-t border-[#f2ece5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#1c1817]">
              {(product.sale_price || product.price).toLocaleString("en-US")} {isEnglish ? "L.E" : "ج.م"}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#a89d94] line-through font-normal">
                {product.original_price?.toLocaleString("en-US")} {isEnglish ? "L.E" : "ج.م"}
              </span>
            )}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-[10px] text-[#8a817c] font-mono">
              {product.sizes.slice(0, 3).join("/")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
