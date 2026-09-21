import React from "react";
import { Link } from "react-router-dom";
import { Truck, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { StoreLayout, useStore } from "@/components/store/StoreLayout";

export default function Shipping() {
  const { pageSettings, siteSettings, language } = useStore();
  const isEnglish = language === "en";
  const shipping = pageSettings.shipping;

  return (
    <StoreLayout>
      <div className="bg-[#faf8f5] py-16 px-5 lg:px-8">
        <div className="mx-auto max-w-[800px] space-y-10">
          <div className="text-center">
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#8a5d3b] font-bold">
              {isEnglish ? "Policies & Care" : "سياسات التوصيل والخدمة"}
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1c1817] mt-2">
              {isEnglish ? shipping.titleEn || "Shipping & Returns" : shipping.titleAr || "الشحن والاستبدال"}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#ece6df] text-center shadow-xs">
              <Truck className="w-6 h-6 mx-auto text-[#8a5d3b] mb-2" />
              <h3 className="font-bold text-sm text-[#1c1817] mb-1">
                {isEnglish ? "Fast Shipping" : "شحن سريع"}
              </h3>
              <p className="text-xs text-[#7e746c]">
                {isEnglish ? "Within 2-4 business days across all Egypt" : "خلال ٢-٤ أيام عمل لجميع المحافظات"}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ece6df] text-center shadow-xs">
              <ShieldCheck className="w-6 h-6 mx-auto text-[#8a5d3b] mb-2" />
              <h3 className="font-bold text-sm text-[#1c1817] mb-1">
                {isEnglish ? "Inspection on Delivery" : "حق المعاينة"}
              </h3>
              <p className="text-xs text-[#7e746c]">
                {isEnglish ? "Check pieces upon delivery before paying" : "إمكانية معاينة القطع في وجود المندوب"}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#ece6df] text-center shadow-xs">
              <RotateCcw className="w-6 h-6 mx-auto text-[#8a5d3b] mb-2" />
              <h3 className="font-bold text-sm text-[#1c1817] mb-1">
                {isEnglish ? "Easy Exchange" : "استبدال مرن"}
              </h3>
              <p className="text-xs text-[#7e746c]">
                {isEnglish ? "Within 14 days of receiving order" : "خلال ١٤ يوماً من استلام الطلب بكل سهولة"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece6df] shadow-xs space-y-4 text-xs sm:text-sm text-[#554e4a] leading-relaxed">
            <p>{isEnglish ? shipping.contentEn : shipping.contentAr}</p>

            <div className="pt-4 border-t border-[#f4f0eb] space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isEnglish
                    ? `Free shipping on all orders over ${siteSettings.freeShippingThreshold || 2500} EGP.`
                    : `شحن مجاني لجميع الطلبات التي تتجاوز قيمتها ${siteSettings.freeShippingThreshold || 2500} جنيه.`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isEnglish
                    ? `Standard delivery fee: ${siteSettings.standardShippingCost || 80} EGP across Cairo & Giza.`
                    : `تكلفة الشحن الثابتة: ${siteSettings.standardShippingCost || 80} جنيه لمعظم المحافظات.`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/contact"
              className="text-xs text-[#8a5d3b] hover:underline font-bold"
            >
              {isEnglish ? "Have questions about your order? Contact us →" : "هل لديكِ استفسار عن شحنتكِ؟ تواصلي معنا الآن ←"}
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
