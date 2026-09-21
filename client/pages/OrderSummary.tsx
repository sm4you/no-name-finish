import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle2, MessageCircle, ArrowLeft, ShoppingBag, Truck, Calendar, CreditCard } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Order } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function OrderSummary() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateOrder = location.state?.order as Order | undefined;
  const stateWhatsappUrl = location.state?.whatsappUrl as string | undefined;

  const [order, setOrder] = useState<Order | null>(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder);

  useEffect(() => {
    if (!order && id) {
      fetch(`/api/orders/${encodeURIComponent(id)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Order not found");
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, order]);

  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
          <div className="w-16 h-16 bg-[#f0eae2] rounded-full mx-auto mb-4" />
          <div className="h-6 bg-[#f0eae2] rounded w-1/2 mx-auto mb-2" />
          <div className="h-4 bg-[#f0eae2] rounded w-1/3 mx-auto" />
        </div>
      </StoreLayout>
    );
  }

  if (!order) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#1c1817] mb-2">لم يتم العثور على الطلب</h2>
          <p className="text-sm text-[#7a716a] mb-6">يرجى التأكد من رابط الطلب أو مراجعة خدمة العملاء.</p>
          <Button asChild className="bg-[#1c1817] text-white">
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const whatsappMessage = order.whatsappMessage || `مرحباً No Name ✨
أود تأكيد طلبي رقم ${order.publicReference}
الاسم: ${order.customerName}
الإجمالي: ${order.total} ج.م`;

  const whatsappUrl = stateWhatsappUrl || `https://wa.me/201068568250?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Success Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1817]">
            شكراً لكِ! تم تسجيل طلبكِ بنجاح
          </h1>
          <p className="text-sm text-[#706760]">
            تم إرسال تفاصيل الطلب وسيتم التواصل معكِ هاتفياً لتأكيد الشحن.
          </p>
          <div className="inline-block bg-[#f3ede5] border border-[#ded4c7] px-4 py-1.5 rounded-full text-xs font-bold text-[#8a5d3b]">
            رقم الطلب المرجعي: {order.publicReference}
          </div>
        </div>

        {/* Action: WhatsApp Instant Confirmation Button */}
        <div className="bg-[#e8f8ee] border border-[#b2e5c4] rounded-2xl p-6 text-center space-y-3 mb-8 shadow-sm">
          <h3 className="text-base font-bold text-[#106535]">
            تأكيد الطلب الفوري عبر واتساب
          </h3>
          <p className="text-xs text-[#207545] max-w-md mx-auto">
            لتسريع عملية التجهيز والشحن، اضغطي على الزر أدناه لإرسال تفاصيل الفاتورة مباشرة لفريق المبيعات بنقرة واحدة:
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>إرسال تفاصيل الطلب عبر واتساب</span>
          </a>
        </div>

        {/* Order Invoice Details */}
        <div className="bg-white rounded-2xl border border-[#ece4da] shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-[#f2ebe2] flex flex-wrap items-center justify-between gap-4 bg-[#fbf9f6]">
            <div>
              <span className="text-xs text-[#8a817c]">تاريخ الطلب</span>
              <p className="text-sm font-bold text-[#1c1817] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-[#8a5d3b]" />
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#8a817c]">طريقة الدفع</span>
              <p className="text-sm font-bold text-[#1c1817] flex items-center gap-1.5 mt-0.5 capitalize">
                <CreditCard className="w-4 h-4 text-[#8a5d3b]" />
                {order.paymentMethod === "cod"
                  ? "الدفع عند الاستلام"
                  : order.paymentMethod === "instapay"
                  ? "إنستاباي (InstaPay)"
                  : "محفظة إلكترونية"}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#8a817c]">حالة الطلب</span>
              <span className="inline-block mt-0.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                قيد المراجعة والتجهيز
              </span>
            </div>
          </div>

          {/* Customer info */}
          <div className="p-6 border-b border-[#f2ebe2] space-y-1.5 text-xs text-[#6e655e]">
            <h4 className="font-bold text-[#1c1817] text-sm mb-2">بيانات العميل والشحن:</h4>
            <p><strong>الاسم:</strong> {order.customerName}</p>
            <p><strong>رقم الهاتف:</strong> <span dir="ltr">{order.phone}</span></p>
            <p><strong>عنوان التوصيل:</strong> {order.address}</p>
            {order.notes && <p><strong>ملاحظات:</strong> {order.notes}</p>}
            {order.transferNumber && (
              <p><strong>رقم التحويل البنكي:</strong> {order.transferNumber}</p>
            )}
          </div>

          {/* Items List */}
          <div className="p-6 space-y-4">
            <h4 className="font-bold text-[#1c1817] text-sm">المنتجات المطلوبة:</h4>
            <div className="divide-y divide-[#f2ebe2]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-[#1c1817]">{item.productName}</h5>
                    <span className="text-xs text-[#8a817c]">
                      مقاس: {item.size} • لون: {item.color} • كمية: {item.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#1c1817]">
                    {item.lineTotal.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="pt-4 border-t border-[#f2ebe2] space-y-2 text-xs">
              <div className="flex justify-between text-[#6e655e]">
                <span>إجمالي المنتجات</span>
                <span className="font-semibold text-[#1c1817]">
                  {order.subtotal.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>الخصم المطبق</span>
                  <span>- {order.discountAmount.toLocaleString("ar-EG")} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-[#6e655e]">
                <span>تكلفة الشحن</span>
                <span>
                  {order.shippingAmount === 0 ? (
                    <span className="text-emerald-700 font-bold">مجاني</span>
                  ) : (
                    `${order.shippingAmount} ج.م`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1c1817] pt-2 border-t border-[#f2ebe2]">
                <span>المبلغ المستحق</span>
                <span className="text-[#8a5d3b] text-lg font-serif">
                  {order.total.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#1c1817] hover:bg-[#38312e] text-white">
            <Link to="/shop">
              <span>متابعة التسوق</span>
              <ArrowLeft className="mr-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-[#d8cfc5]">
            <Link to="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}
