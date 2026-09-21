import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { Product } from "@shared/api";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const hasDiscount = product.original_price && product.price < product.original_price;
  const primaryImage =
    product.images?.[0] || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || "M";
    const defaultColor = product.colors?.[0] || "Default";
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const badgeText =
    product.badge ||
    (hasDiscount
      ? `خصم ${Math.round(((product.original_price! - product.price) / product.original_price!) * 100)}%`
      : product.is_new
      ? "جديد"
      : "");

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#eee7df] hover:shadow-lg transition-all duration-300">
      {/* Image & Badges */}
      <Link to={`/product/${product.slug || product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f4eee6]">
        <img
          src={primaryImage}
          alt={product.name_ar}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

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
            <span>إضافة للسلة</span>
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
            {product.category_slug}
          </div>
          <Link to={`/product/${product.slug || product.id}`}>
            <h3 className="text-sm font-bold text-[#1c1817] hover:text-[#8a5d3b] transition-colors line-clamp-1">
              {product.name_ar}
            </h3>
          </Link>
          <p className="text-[11px] text-[#8a817c] line-clamp-1 mt-0.5">{product.name_en}</p>
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
              {(product.sale_price || product.price).toLocaleString("en-US")} ج.م
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#a89d94] line-through font-normal">
                {product.original_price?.toLocaleString("en-US")} ج.م
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
