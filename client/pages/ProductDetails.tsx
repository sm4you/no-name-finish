import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Play,
  Video,
  AlertTriangle,
  X,
} from "lucide-react";
import { StoreLayout, useStore } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Product, SiteSettings, ProductVariant } from "@shared/api";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useStore();
  const isEnglish = language === "en";

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    if (!slug) return;

    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        const images = data.images && data.images.length > 0 ? data.images : [data.image || ""];
        setSelectedImage(images[0] || "");
        setSelectedSize(data.sizes?.[0] || "M");
        setSelectedColor(data.colors?.[0] || "Default");
        setLoading(false);

        // Fetch related products in the same category
        if (data.category_slug) {
          fetch(`/api/products?category=${encodeURIComponent(data.category_slug)}`)
            .then((r) => r.json())
            .then((list: Product[]) => {
              setRelated(list.filter((p) => p.id !== data.id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    fetch("/api/site/public-settings")
      .then((r) => r.json())
      .then((s) => setSettings(s))
      .catch(() => {});
  }, [slug]);

  // Helper for color name in Arabic or English
  const getColorName = (hex: string) => {
    const h = hex?.toLowerCase() || "";
    if (isEnglish) {
      if (h === "#1a1a1a" || h === "#000000" || h === "#222222" || h === "#1c1817" || h === "black") return "Black";
      if (h === "#b29d89" || h === "#d4775c" || h === "#8a5d3b" || h === "#a77b5a" || h === "camel") return "Camel / Tan";
      if (h === "#d8d1c2" || h === "#f0eae2" || h === "#f5ede6" || h === "#e6dfd5" || h === "beige" || h === "cream") return "Beige / Cream";
      if (h === "#4a5d4e" || h === "#7d8a76" || h === "#556b2f" || h === "#2e4a3e" || h === "olive") return "Olive / Green";
      if (h === "#1b2a4a" || h === "#2c3e50" || h === "#0f172a" || h === "navy") return "Navy Blue";
      if (h === "#ffffff" || h === "#fafafa" || h === "white") return "White";
      if (h === "#91b6d6" || h === "#45627a" || h === "denim" || h === "blue") return "Denim Blue";
      return hex;
    } else {
      if (h === "#1a1a1a" || h === "#000000" || h === "#222222" || h === "#1c1817" || h === "black") return "أسود";
      if (h === "#b29d89" || h === "#d4775c" || h === "#8a5d3b" || h === "#a77b5a" || h === "camel") return "جملي / هافان";
      if (h === "#d8d1c2" || h === "#f0eae2" || h === "#f5ede6" || h === "#e6dfd5" || h === "beige" || h === "cream") return "بيج / نود";
      if (h === "#4a5d4e" || h === "#7d8a76" || h === "#556b2f" || h === "#2e4a3e" || h === "olive") return "زيتي / أخضر";
      if (h === "#1b2a4a" || h === "#2c3e50" || h === "#0f172a" || h === "navy") return "كحلي";
      if (h === "#ffffff" || h === "#fafafa" || h === "white") return "أبيض";
      if (h === "#91b6d6" || h === "#45627a" || h === "denim" || h === "blue") return "أزرق دنيم";
      return hex;
    }
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-[#f0eae2] rounded-2xl" />
            <div className="space-y-6">
              <div className="h-8 bg-[#f0eae2] rounded w-3/4" />
              <div className="h-6 bg-[#f0eae2] rounded w-1/3" />
              <div className="h-24 bg-[#f0eae2] rounded" />
              <div className="h-12 bg-[#f0eae2] rounded" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-[#1c1817] mb-4">
            {isEnglish ? "Product currently unavailable" : "المنتج غير متوفر حالياً"}
          </h2>
          <p className="text-sm text-[#786e66] mb-8">
            {isEnglish ? "This piece may have been removed or relocated." : "ربما تم حذف هذا المنتج أو نقله إلى قسم آخر."}
          </p>
          <Button asChild className="bg-[#1c1817] text-white">
            <Link to="/shop">{isEnglish ? "Return to Store" : "العودة إلى المتجر"}</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image || ""];
  const hasDiscount = product.original_price && product.price < product.original_price;
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const colors = product.colors && product.colors.length > 0 ? product.colors : ["#222222", "#d8d1c2"];

  // Find variant stock for current color + size combination
  const variants = product.variants || [];
  const currentVariant = variants.find(
    (v) => (v.color?.toLowerCase() === selectedColor?.toLowerCase() || v.colorName === selectedColor) &&
           v.size?.toUpperCase() === selectedSize?.toUpperCase()
  );

  // If variants array exists and has entries, use matching variant stock; otherwise fallback to product.stock
  const availableStock = variants.length > 0
    ? (currentVariant ? Number(currentVariant.stock) || 0 : 0)
    : (typeof product.stock === "number" ? product.stock : 10);

  const isOutOfStock = availableStock <= 0 || product.in_stock === false;
  const isLowStock = !isOutOfStock && availableStock <= (product.low_stock_threshold || 3);

  // Optional video check
  const hasVideo = Boolean(product.video && product.video.trim() !== "");
  const videoUrl = product.video || "";

  // Check stock availability per size for the currently selected color
  const getStockForSize = (sz: string) => {
    if (variants.length === 0) return 10;
    const found = variants.find(
      (v) => (v.color?.toLowerCase() === selectedColor?.toLowerCase() || v.colorName === selectedColor) &&
             v.size?.toUpperCase() === sz.toUpperCase()
    );
    return found ? Number(found.stock) || 0 : 0;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate("/checkout");
  };

  const currentProductName = isEnglish
    ? product.name_en || product.name_ar
    : product.name_ar || product.name_en;

  const whatsappMessage = isEnglish
    ? `Hello No Name ✨\nI'd like to inquire about or order this piece:\n- Product: ${product.name_en || product.name_ar}\n- Price: ${product.price} EGP\n- Size: ${selectedSize}\n- Color: ${getColorName(selectedColor)}\n- Quantity: ${quantity}\n- Stock Availability: ${availableStock} pieces available\n- Link: ${window.location.href}`
    : `مرحباً No Name ✨\nأود الاستفسار عن أو طلب هذا المنتج:\n- اسم المنتج: ${product.name_ar} (${product.name_en})\n- السعر: ${product.price} ج.م\n- المقاس المختار: ${selectedSize}\n- اللون المختار: ${getColorName(selectedColor)}\n- الكمية: ${quantity}\n- حالة التوفر بالمخزون: ${availableStock} قطع متاحة\n- الرابط: ${window.location.href}`;

  const whatsappUrl = `https://wa.me/${settings?.salesWhatsappNumber || "201068568250"}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#80766e] mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#1c1817]">{isEnglish ? "Home" : "الرئيسية"}</Link>
          <ChevronRight className={`w-3.5 h-3.5 text-[#b5aba0] ${isEnglish ? "" : "rotate-180"}`} />
          <Link to="/shop" className="hover:text-[#1c1817]">{isEnglish ? "Shop" : "المتجر"}</Link>
          <ChevronRight className={`w-3.5 h-3.5 text-[#b5aba0] ${isEnglish ? "" : "rotate-180"}`} />
          <Link to={`/shop?category=${encodeURIComponent(product.category_slug)}`} className="hover:text-[#1c1817]">
            {product.category_slug}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 text-[#b5aba0] ${isEnglish ? "" : "rotate-180"}`} />
          <span className="text-[#1c1817] font-semibold">{currentProductName}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Images Section */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#f0eae2] border border-[#e8dfd5] shadow-md group">
              <img
                src={selectedImage || images[0]}
                alt={currentProductName}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {hasDiscount && (
                <span className={`absolute top-4 ${isEnglish ? "left-4" : "right-4"} bg-[#d4775c] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md`}>
                  {isEnglish
                    ? `SALE ${Math.round(((product.original_price - product.price) / product.original_price) * 100)}%`
                    : `خصم ${Math.round(((product.original_price - product.price) / product.original_price) * 100)}%`}
                </span>
              )}

              {/* Video Play Button on Product Image (Only if video is provided) */}
              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className={`absolute bottom-4 ${isEnglish ? "left-4" : "right-4"} bg-white/95 hover:bg-white text-[#1c1817] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-xs transition-all hover:scale-105 active:scale-95 border border-black/10 cursor-pointer`}
                  title={isEnglish ? "Watch Lookbook Video" : "مشاهدة فيديو القطعة والإطلالة"}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1c1817] text-white flex items-center justify-center">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </div>
                  <span>{isEnglish ? "Lookbook Video" : "فيديو الإطلالة (Lookbook)"}</span>
                </button>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img
                      ? "border-[#8a5d3b] shadow-sm scale-105"
                      : "border-[#e0d6cb] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}

              {/* Video Thumbnail Button (Only if video is provided) */}
              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#8a5d3b]/40 bg-[#1c1817] flex flex-col items-center justify-center text-white flex-shrink-0 hover:border-[#8a5d3b] transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#8a5d3b] flex items-center justify-center mb-1 transition">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold">{isEnglish ? "Video" : "فيديو القطعة"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#8a5d3b] uppercase">
                {product.category_slug}
              </span>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#1c1817] mt-1"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                {currentProductName}
              </h1>
              {!isEnglish && product.name_en && (
                <p className="text-sm text-[#7e746d] font-sans mt-0.5">
                  {product.name_en}
                </p>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 p-4 rounded-xl bg-[#f7f2eb] border border-[#ebe1d5]">
              <span className="text-2xl sm:text-3xl font-bold text-[#1c1817]">
                {product.price.toLocaleString(isEnglish ? "en-US" : "ar-EG")} {isEnglish ? "EGP" : "ج.م"}
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-base text-[#a0948a] line-through font-medium">
                  {product.original_price.toLocaleString(isEnglish ? "en-US" : "ar-EG")} {isEnglish ? "EGP" : "ج.م"}
                </span>
              )}
              <span className={`text-xs text-[#2e7d32] font-semibold ${isEnglish ? "ml-auto" : "mr-auto"}`}>
                {isEnglish ? "VAT Included" : "شامل ضريبة القيمة المضافة"}
              </span>
            </div>

            {/* Color Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1c1817]">
                  {isEnglish ? "Selected Color: " : "اللون المختار: "}
                  <span className="font-semibold text-[#8a5d3b]">{getColorName(selectedColor)}</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      setQuantity(1);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedColor === c
                        ? "bg-[#1c1817] text-white shadow-md font-bold ring-2 ring-[#8a5d3b]/50"
                        : "bg-white text-[#524b45] border border-[#d8cfc4] hover:border-[#8a5d3b]"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block shrink-0"
                      style={{ backgroundColor: c.startsWith("#") ? c : "#8a5d3b" }}
                    />
                    <span>{getColorName(c)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with variant stock indicator */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1c1817]">
                  {isEnglish ? "Select Size:" : "اختاري المقاس:"}
                </label>
                <span className="text-[11px] text-[#8a5d3b] font-medium">
                  {isEnglish ? "True to regular sizing" : "المقاسات تلائم القياس المعتاد"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((s) => {
                  const sizeStock = getStockForSize(s);
                  const isSizeEmpty = sizeStock === 0 && variants.length > 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSize(s);
                        setQuantity(1);
                      }}
                      className={`min-w-[54px] h-10 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        selectedSize === s
                          ? "bg-[#8a5d3b] text-white shadow-md font-bold"
                          : isSizeEmpty
                          ? "bg-[#f5f2ee] text-[#b0a79e] border border-[#e4ded6] line-through opacity-70"
                          : "bg-white text-[#524b45] border border-[#d8cfc4] hover:border-[#8a5d3b]"
                      }`}
                    >
                      <span>{s}</span>
                      {isSizeEmpty && <span className="text-[9px] font-normal">{isEnglish ? "(Sold out)" : "(نفد)"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Availability Live Alert */}
            <div className="p-3 rounded-xl transition-all">
              {isOutOfStock ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    {isEnglish
                      ? "Sorry, this size in the selected color is currently out of stock. You can pick another color or size."
                      : "عذراً، هذا المقاس باللون المختار نفد من المخزون حالياً. يمكنكِ اختيار لون أو مقاس آخر."}
                  </span>
                </div>
              ) : isLowStock ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                  <span>
                    {isEnglish
                      ? `Hurry up! Only ${availableStock} piece(s) left in stock for this color & size.`
                      : `سارعي بالطلب! متبقي ${availableStock} قطع فقط من هذا المقاس واللون بالمخزون.`}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isEnglish
                      ? `In stock & ready for immediate dispatch (${availableStock} items in stock)`
                      : `متوفر وجاهز للشحن الفوري (${availableStock} قطع متاحة بالمخزون)`}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1c1817]">
                {isEnglish ? "Quantity:" : "الكمية المطلوبة:"}
              </label>
              <div className="flex items-center border border-[#d8cfc4] rounded-xl bg-white w-36 overflow-hidden">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`p-2.5 text-[#524b45] hover:text-[#1c1817] hover:bg-[#f6eee4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isEnglish ? "rounded-l-lg" : "rounded-r-lg"
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-bold text-sm text-[#1c1817]">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= availableStock}
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className={`p-2.5 text-[#524b45] hover:text-[#1c1817] hover:bg-[#f6eee4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isEnglish ? "rounded-r-lg" : "rounded-l-lg"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className={`w-full h-12 text-white font-bold flex items-center justify-center gap-2 rounded-xl shadow-md text-sm ${
                  isOutOfStock
                    ? "bg-[#a89f97] cursor-not-allowed opacity-60"
                    : "bg-[#1c1817] hover:bg-[#38312e]"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#e6b980]" />
                <span>
                  {isOutOfStock
                    ? isEnglish ? "Out of Stock" : "نفد من المخزون"
                    : isEnglish ? "Add to Bag" : "إضافة إلى سلة المشتريات"}
                </span>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  variant="outline"
                  size="lg"
                  className="h-11 border-[#8a5d3b] text-[#8a5d3b] hover:bg-[#8a5d3b] hover:text-white font-bold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isEnglish ? "Buy Now" : "شراء فوري"}
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{isEnglish ? "WhatsApp Order" : "طلب واتساب مباشر"}</span>
                </a>
              </div>

              {addedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isEnglish ? "Piece successfully added to your bag!" : "تمت إضافة القطعة إلى سلتك بنجاح!"}
                  </span>
                </div>
              )}
            </div>

            {/* Description & Details Accordion/Box */}
            <div className="pt-4 border-t border-[#ede5db] space-y-3 text-xs text-[#6e655e] leading-relaxed">
              <h4 className="font-bold text-[#1c1817] text-sm">
                {isEnglish ? "Product Description & Details:" : "وصف القطعة والمميزات:"}
              </h4>
              <p>
                {isEnglish
                  ? product.description_en || product.description_ar
                  : product.description_ar || product.description_en}
              </p>
              {!isEnglish && product.description_en && (
                <p className="text-[11px] text-[#8c827a] font-sans">{product.description_en}</p>
              )}

              <div className="pt-4 grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#ece4da]">
                  <Truck className="w-4 h-4 text-[#8a5d3b]" />
                  <span>
                    {isEnglish
                      ? "Fast shipping across Egypt with free shipping over 2,500 EGP"
                      : "شحن سريع لجميع المحافظات مع شحن مجاني فوق 2500 ج.م"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#ece4da]">
                  <ShieldCheck className="w-4 h-4 text-[#8a5d3b]" />
                  <span>
                    {isEnglish
                      ? "Try before you buy on delivery with inspection before payment"
                      : "إمكانية معاينة القطعة وقياسها عند الاستلام قبل الدفع"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#ece4da]">
                  <RotateCcw className="w-4 h-4 text-[#8a5d3b]" />
                  <span>
                    {isEnglish
                      ? "Easy 14-day exchange & return policy"
                      : "سياسة استبدال ميسرة خلال 14 يوماً من الاستلام"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= VIDEO MODAL POPUP ================= */}
        {showVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className={`absolute top-4 ${isEnglish ? "right-4" : "left-4"} z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition`}
              >
                <X size={20} />
              </button>

              {/* Video Player */}
              <div className="relative aspect-[9/16] max-h-[75vh] w-full bg-black flex items-center justify-center">
                <video
                  autoPlay
                  controls
                  playsInline
                  loop
                  poster={selectedImage || images[0]}
                  onError={(e) => {
                    const videoEl = e.currentTarget;
                    if (videoEl && !videoEl.src.includes("ForBiggerBlazes")) {
                      videoEl.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
                      videoEl.play().catch(() => {});
                    }
                  }}
                  className="w-full h-full object-cover"
                >
                  <source src={videoUrl} type="video/mp4" />
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Modal Bottom Bar */}
              <div className="p-4 bg-[#1c1817] text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>{currentProductName}</h4>
                  <span className="text-xs text-[#e6b980]">
                    {product.price.toLocaleString(isEnglish ? "en-US" : "ar-EG")} {isEnglish ? "EGP" : "ج.م"}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setShowVideoModal(false);
                    handleAddToCart();
                  }}
                  disabled={isOutOfStock}
                  className="bg-[#8a5d3b] hover:bg-[#a7734c] text-white text-xs h-9 rounded-xl font-bold"
                >
                  <ShoppingBag size={14} className={isEnglish ? "mr-1" : "ml-1"} />
                  <span>{isEnglish ? "Add to Bag" : "إضافة للسلة"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#ece4da]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-[#1c1817]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                {isEnglish ? "You May Also Like" : "قطع قد تعجبكِ أيضاً"}
              </h3>
              <Link to={`/shop?category=${encodeURIComponent(product.category_slug)}`} className="text-xs font-bold text-[#8a5d3b] hover:text-[#1c1817]">
                {isEnglish ? "View more in this category →" : "مشاهدة المزيد في هذا القسم ←"}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {related.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
