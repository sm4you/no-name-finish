import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, Tag, ShieldCheck, Truck } from "lucide-react";
import {
  StoreLayout,
  useStore,
  formatProductAmount,
} from "@/components/store/StoreLayout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const {
    coupons,
    appliedCouponCode,
    setAppliedCouponCode,
    siteSettings,
    language,
  } = useStore();
  const { items, removeFromCart, updateQuantity, subtotal, totalCount } = useCart();
  const navigate = useNavigate();
  const isEnglish = language === "en";

  const [couponInput, setCouponInput] = useState(appliedCouponCode);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const matchedCoupon = coupons.find(
    (c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase()
  );
  const discountPercent = matchedCoupon ? matchedCoupon.discount || (matchedCoupon as any).discountPercent || 0 : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  const freeThreshold = siteSettings.freeShippingThreshold || 2500;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingAmount = isFreeShipping ? 0 : siteSettings.standardShippingCost || 60;
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (found) {
      setAppliedCouponCode(clean);
      setCouponSuccess(
        isEnglish
          ? `Coupon applied! You got ${found.discount || (found as any).discountPercent}% off.`
          : `تم تطبيق الكوبون! خصم ${found.discount || (found as any).discountPercent}٪ على طلبكِ.`
      );
    } else {
      setCouponError(isEnglish ? "Invalid coupon code." : "كود الخصم غير صحيح أو منتهي الصلاحية.");
    }
  };

  return (
    <StoreLayout>
      <div className="bg-[#faf8f5] py-12 px-5 lg:px-8 min-h-[75vh]">
        <div className="mx-auto max-w-[1020px]">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1c1817] mb-2">
            {isEnglish ? "Shopping Bag" : "حقيبة التسوق"}
          </h1>
          <p className="text-xs text-[#7e746c] mb-8">
            {items.length > 0
              ? isEnglish
                ? `You have ${totalCount} piece(s) in your bag.`
                : `لديكِ ${totalCount} قطعة في حقيبتكِ.`
              : isEnglish
              ? "Your shopping bag is empty."
              : "حقيبة التسوق فارغة حالياً."}
          </p>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#ece6df] space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#faf8f5] text-[#8a5d3b] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#1c1817]">
                {isEnglish ? "No pieces in your bag yet" : "لم تقومي بإضافة أي قطع بعد"}
              </h2>
              <p className="text-xs text-[#7e746c] max-w-sm mx-auto">
                {isEnglish
                  ? "Explore our curated new collection and find timeless modest essentials."
                  : "تصفحي أحدث تشكيلاتنا واكتشفي قطع الكتان والتصاميم المريحة التي تلائم يومكِ."}
              </p>
              <Button
                onClick={() => navigate("/shop")}
                className="bg-[#1c1817] hover:bg-[#38312e] text-white text-xs px-8 h-10 rounded-xl"
              >
                {isEnglish ? "Start Shopping" : "ابدئي التسوق الآن"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ece6df] shadow-xs divide-y divide-[#f4f0eb]">
                {items.map((item) => {
                  const itemTitle = isEnglish
                    ? item.name_en || item.name_ar
                    : item.name_ar || item.name_en;
                  const itemTotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={itemTitle}
                        className="w-20 h-24 rounded-2xl object-cover border border-[#ece6df] bg-[#faf8f5] shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-bold text-sm text-[#1c1817] hover:underline line-clamp-1 block"
                        >
                          {itemTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7e746c]">
                          <span>{isEnglish ? "Size: " : "المقاس: "}<b className="text-[#1c1817]">{item.size}</b></span>
                          <span>•</span>
                          <span>{isEnglish ? "Color: " : "اللون: "}<b className="text-[#1c1817]">{getColorName(item.color)}</b></span>
                        </div>
                        <span className="text-xs text-[#8a5d3b] font-bold block mt-1">
                          {formatProductAmount(item.price, language)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-[#e4ded6] rounded-lg bg-[#faf8f5] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2.5 py-1 text-xs hover:bg-[#f0eae1] transition font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2.5 py-1 text-xs hover:bg-[#f0eae1] transition font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title={isEnglish ? "Remove piece" : "حذف القطعة"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-left font-bold text-sm text-[#1c1817] shrink-0">
                        {formatProductAmount(itemTotal, language)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary & Coupon */}
              <div className="lg:col-span-5 space-y-4">
                {/* Coupon Box */}
                <div className="bg-white rounded-3xl p-5 border border-[#ece6df] shadow-xs">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isEnglish ? "Coupon code" : "كود الخصم (مثال: EID10)"}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#8a5d3b]"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="text-xs h-9 px-4 rounded-xl border-[#1c1817] text-[#1c1817] hover:bg-[#1c1817] hover:text-white"
                    >
                      {isEnglish ? "Apply" : "تطبيق"}
                    </Button>
                  </form>
                  {couponError && <p className="text-[11px] text-red-600 mt-2 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-600 mt-2 font-medium">{couponSuccess}</p>}
                </div>

                {/* Totals Box */}
                <div className="bg-white rounded-3xl p-6 border border-[#ece6df] shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-sm text-[#1c1817] pb-2 border-b border-[#f4f0eb]">
                    {isEnglish ? "Order Summary" : "ملخص الحساب"}
                  </h3>

                  <div className="flex justify-between text-[#554e4a]">
                    <span>{isEnglish ? "Subtotal:" : "المجموع الفرعي:"}</span>
                    <span className="font-bold">{formatProductAmount(subtotal, language)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#d4775c] font-bold">
                      <span>{isEnglish ? `Discount (${discountPercent}%):` : `خصم الكوبون (${discountPercent}٪):`}</span>
                      <span>-{formatProductAmount(discountAmount, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#554e4a]">
                    <span>{isEnglish ? "Shipping:" : "الشحن والتوصيل:"}</span>
                    <span>
                      {isFreeShipping
                        ? isEnglish
                          ? "FREE"
                          : "مجاني"
                        : formatProductAmount(shippingAmount, language)}
                    </span>
                  </div>

                  {subtotal < freeThreshold && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                      {isEnglish
                        ? `Add ${formatProductAmount(freeThreshold - subtotal, language)} more to get FREE shipping!`
                        : `أضيفي قطع بقيمة ${formatProductAmount(freeThreshold - subtotal, language)} للحصول على شحن مجاني!`}
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-base text-[#1c1817] pt-3 border-t border-[#e4ded6]">
                    <span>{isEnglish ? "Total:" : "المبلغ الإجمالي:"}</span>
                    <span className="text-[#8a5d3b]">{formatProductAmount(total, language)}</span>
                  </div>

                  <Button
                    onClick={() => navigate("/checkout")}
                    className="w-full mt-4 bg-[#1c1817] hover:bg-[#38312e] text-white py-3 h-12 text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{isEnglish ? "Proceed to Checkout" : "متابعة لإتمام الطلب"}</span>
                    <ArrowLeft className={`w-4 h-4 ${isEnglish ? "rotate-180" : ""}`} />
                  </Button>

                  <div className="pt-3 text-center">
                    <Link to="/shop" className="text-[11px] text-[#7e746c] hover:underline">
                      {isEnglish ? "← Continue shopping" : "← العودة لمواصلة التسوق"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
