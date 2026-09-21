import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Upload,
  Check,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useCart } from "@/context/CartContext";
import { PaymentMethod, SiteSettings } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Transfer verification state
  const [transferNumber, setTransferNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptFileLoading, setReceiptFileLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/site/public-settings")
      .then((r) => r.json())
      .then((s) => setSettings(s))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 bg-[#f5ede4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8a5d3b]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1c1817] mb-2">سلة الشراء فارغة</h2>
          <p className="text-sm text-[#786e66] mb-8">يجب اختيار منتجات أولاً قبل التوجه لصفحة إتمام الطلب.</p>
          <Button asChild className="bg-[#1c1817] text-white">
            <Link to="/shop">الذهاب للمتجر</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  // Calculations
  const freeThreshold = settings?.freeShippingThreshold || 2500;
  const standardShipping = settings?.standardShippingCost || 60;
  const shippingCost = subtotal >= freeThreshold ? 0 : standardShipping;

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Coupon application
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "كود الخصم غير صالح");
      }
      setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
      setCouponError("");
    } catch (err: any) {
      setCouponError(err.message || "حدث خطأ أثناء فحص الكود");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Receipt image upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: base64Data, filename: file.name }),
        });
        const data = await res.json();
        if (data.url) {
          setReceiptUrl(data.url);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setReceiptFileLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("يرجى ملء جميع الحقول الإلزامية (الاسم، رقم الهاتف، العنوان).");
      return;
    }

    if ((paymentMethod === "instapay" || paymentMethod === "wallet") && !transferNumber.trim() && !receiptUrl) {
      setErrorMsg("يرجى إدخال رقم التحويل أو إرفاق صورة إيصال الدفع للتأكيد.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        paymentMethod,
        couponCode: appliedCoupon?.code,
        transferNumber: transferNumber.trim() || undefined,
        receiptUrl: receiptUrl || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل في تسجيل الطلب");
      }

      // Success: clear cart and redirect to order summary page
      clearCart();
      navigate(`/order-summary/${data.order.id}`, { state: { order: data.order, whatsappUrl: data.whatsappUrl } });
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع أثناء حفظ الطلب.");
      setSubmitting(false);
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-serif font-bold text-[#1c1817] mb-2">
          إتمام الطلب
        </h1>
        <p className="text-sm text-[#786e66] mb-8">
          أدخلي بيانات الشحن واختاري طريقة الدفع المفضلة لديكِ
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Left/Main: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customer & Address */}
            <div className="bg-white p-6 rounded-2xl border border-[#ece4da] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1c1817] flex items-center gap-2 border-b border-[#f2ebe2] pb-3">
                <Truck className="w-5 h-5 text-[#8a5d3b]" />
                <span>بيانات التوصيل والاستلام</span>
              </h2>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#1c1817] mb-1.5">
                    الاسم بالكامل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: سارة محمد أحمد"
                    className="w-full px-4 py-2.5 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b] text-[#1c1817]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1817] mb-1.5">
                    رقم الهاتف المحمول (واتساب) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-4 py-2.5 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b] text-[#1c1817] text-left"
                    dir="ltr"
                  />
                  <span className="text-[11px] text-[#8a817c] mt-1 block">
                    سيتم إرسال تأكيد الطلب وتفاصيل الشحنة على هذا الرقم
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1817] mb-1.5">
                    العنوان بالتفصيل <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="المحافظة، المدينة / المنطقة، اسم الشارع، رقم العمارة والشقة..."
                    className="w-full px-4 py-2.5 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b] text-[#1c1817]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1817] mb-1.5">
                    ملاحظات التوصيل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي تعليمات للمندوب، مثل موعد التسليم المفضل"
                    className="w-full px-4 py-2.5 text-sm bg-[#faf8f5] border border-[#d8cfc5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a5d3b] text-[#1c1817]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-[#ece4da] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1c1817] flex items-center gap-2 border-b border-[#f2ebe2] pb-3">
                <CreditCard className="w-5 h-5 text-[#8a5d3b]" />
                <span>طريقة الدفع</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Option 1: COD */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#8a5d3b] bg-[#fbf8f5]"
                      : "border-[#e5dcce] hover:border-[#8a5d3b]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-[#8a5d3b]"
                    />
                    <Banknote className="w-5 h-5 text-[#8a5d3b]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#1c1817]">الدفع عند الاستلام</span>
                    <span className="text-[10px] text-[#7a716a]">معاينة وتجربة قبل الدفع</span>
                  </div>
                </label>

                {/* Option 2: InstaPay */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === "instapay"
                      ? "border-[#8a5d3b] bg-[#fbf8f5]"
                      : "border-[#e5dcce] hover:border-[#8a5d3b]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={paymentMethod === "instapay"}
                      onChange={() => setPaymentMethod("instapay")}
                      className="accent-[#8a5d3b]"
                    />
                    <Smartphone className="w-5 h-5 text-[#8a5d3b]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#1c1817]">إنستاباي (InstaPay)</span>
                    <span className="text-[10px] text-[#7a716a]">تحويل بنكي فوري</span>
                  </div>
                </label>

                {/* Option 3: Electronic Wallet */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === "wallet"
                      ? "border-[#8a5d3b] bg-[#fbf8f5]"
                      : "border-[#e5dcce] hover:border-[#8a5d3b]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={() => setPaymentMethod("wallet")}
                      className="accent-[#8a5d3b]"
                    />
                    <CreditCard className="w-5 h-5 text-[#8a5d3b]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#1c1817]">محفظة إلكترونية</span>
                    <span className="text-[10px] text-[#7a716a]">فودافون كاش / أورنج / إتصالات</span>
                  </div>
                </label>
              </div>

              {/* Conditional Transfer Verification Details */}
              {paymentMethod === "instapay" && (
                <div className="mt-4 p-4 rounded-xl bg-[#f8f4ee] border border-[#e8ded1] space-y-3 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span>عنوان إنستاباي للدفع (InstaPay Address):</span>
                    <span className="font-bold text-[#1c1817] font-mono select-all bg-white px-2 py-1 rounded border">
                      {settings?.instapayNumber || "noname@instapay"}
                    </span>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1c1817] mb-1">
                      رقم العملية / الحساب المحول منه:
                    </label>
                    <input
                      type="text"
                      value={transferNumber}
                      onChange={(e) => setTransferNumber(e.target.value)}
                      placeholder="مثال: رقم الحساب أو كود التحويل"
                      className="w-full px-3 py-2 bg-white border border-[#d8cfc5] rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1c1817] mb-1">
                      إرفاق سكرين شوت أو إيصال التحويل:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="receipt-upload"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer bg-white px-3 py-2 border border-[#d8cfc5] rounded-md hover:bg-[#f2ebe2] text-[#1c1817] flex items-center gap-1.5 font-medium"
                      >
                        <Upload className="w-4 h-4 text-[#8a5d3b]" />
                        <span>{receiptFileLoading ? "جاري الرفع..." : receiptUrl ? "تغيير الإيصال" : "اختر صورة الإيصال"}</span>
                      </label>
                      {receiptUrl && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> تم إرفاق الإيصال
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="mt-4 p-4 rounded-xl bg-[#f8f4ee] border border-[#e8ded1] space-y-3 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span>رقم المحفظة الإلكترونية للتحويل:</span>
                    <span className="font-bold text-[#1c1817] font-mono select-all bg-white px-2 py-1 rounded border">
                      {settings?.walletNumber || "01068568250"}
                    </span>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1c1817] mb-1">
                      رقم المحفظة التي قمتِ بالتحويل منها:
                    </label>
                    <input
                      type="text"
                      value={transferNumber}
                      onChange={(e) => setTransferNumber(e.target.value)}
                      placeholder="مثال: 010xxxxxxxx"
                      className="w-full px-3 py-2 bg-white border border-[#d8cfc5] rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1c1817] mb-1">
                      إرفاق سكرين شوت أو إيصال التحويل:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="receipt-upload-wallet"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="receipt-upload-wallet"
                        className="cursor-pointer bg-white px-3 py-2 border border-[#d8cfc5] rounded-md hover:bg-[#f2ebe2] text-[#1c1817] flex items-center gap-1.5 font-medium"
                      >
                        <Upload className="w-4 h-4 text-[#8a5d3b]" />
                        <span>{receiptFileLoading ? "جاري الرفع..." : receiptUrl ? "تغيير الإيصال" : "اختر صورة الإيصال"}</span>
                      </label>
                      {receiptUrl && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> تم إرفاق الإيصال
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#ece4da] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1c1817] border-b border-[#f2ebe2] pb-3">
                ملخص الطلب ({items.length} قطع)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-[#f2ece5] max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name_ar}
                      className="w-14 h-16 object-cover rounded-md bg-[#f0eae2]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1c1817] truncate">{item.name_ar}</h4>
                      <p className="text-[11px] text-[#7a716a]">
                        مقاس: {item.size} • لون: {item.color} • كمية: {item.quantity}
                      </p>
                      <span className="text-xs font-bold text-[#8a5d3b]">
                        {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="pt-2 border-t border-[#f2ece5]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="كود الخصم (مثال: WELCOME10)"
                    className="flex-1 px-3 py-2 text-xs bg-[#faf8f5] border border-[#d8cfc5] rounded-md focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-[#8a5d3b] hover:bg-[#a06e47] text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "فحص..." : "تطبيق"}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>تم تطبيق كود {appliedCoupon.code} (خصم {appliedCoupon.discountPercent}%)</span>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{couponError}</p>
                )}
              </div>

              {/* Financial calculations */}
              <div className="pt-4 border-t border-[#f2ece5] space-y-2 text-xs">
                <div className="flex justify-between text-[#6e655e]">
                  <span>إجمالي المنتجات:</span>
                  <span className="font-semibold text-[#1c1817]">
                    {subtotal.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>الخصم ({appliedCoupon.code}):</span>
                    <span>- {discountAmount.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6e655e]">
                  <span>الشحن والتوصيل:</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">مجاني</span>
                    ) : (
                      `${shippingCost} ج.م`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#1c1817] pt-2 border-t border-[#f2ece5]">
                  <span>المبلغ الإجمالي:</span>
                  <span className="text-[#8a5d3b] font-serif text-lg">
                    {finalTotal.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full h-12 bg-[#1c1817] hover:bg-[#38312e] text-white font-bold text-sm rounded-xl shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>جاري تسجيل الطلب...</span>
                ) : (
                  <>
                    <span>تأكيد وتسجيل الطلب</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-center text-[#8a817c]">
                بالضغط على "تأكيد الطلب"، فأنتِ توافقين على شروط المعاينة والتسليم الخاصة بـ No Name.
              </p>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
