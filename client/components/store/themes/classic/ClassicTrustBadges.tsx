import React from "react";
import { useStore } from "@/components/store/StoreLayout";

export function ClassicTrustBadges() {
  const { language } = useStore();
  const isEnglish = language === "en";

  return (
    <section className="bg-[#eeece1] py-8 px-5 lg:px-8 border-t border-[#1c2822]/10">
      <div className="mx-auto max-w-[1240px] grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
        <div>
          <span className="block font-bold text-[#1c1817] text-sm">+10,000</span>
          <span className="text-[#554e4a]">
            {isEnglish ? "Happy women across Egypt" : "عميلة سعيدة في كل المحافظات"}
          </span>
        </div>
        <div>
          <span className="block font-bold text-[#1c1817] text-sm">100%</span>
          <span className="text-[#554e4a]">
            {isEnglish ? "Premium natural fabrics" : "أقمشة طبيعية مختارة بعناية"}
          </span>
        </div>
        <div>
          <span className="block font-bold text-[#1c1817] text-sm">
            {isEnglish ? "Inspection" : "المعاينة"}
          </span>
          <span className="text-[#554e4a]">
            {isEnglish ? "Try before pay on delivery" : "حق المعاينة والاستلام الآمن"}
          </span>
        </div>
        <div>
          <span className="block font-bold text-[#1c1817] text-sm">
            {isEnglish ? "Free Shipping" : "شحن مجاني"}
          </span>
          <span className="text-[#554e4a]">
            {isEnglish ? "On orders above 2,500 EGP" : "للطلبات فوق ٢٥٠٠ جنيه"}
          </span>
        </div>
      </div>
    </section>
  );
}
