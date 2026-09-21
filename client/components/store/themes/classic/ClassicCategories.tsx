import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/components/store/StoreLayout";

const categoryBanners = [
  {
    name: "New Collection",
    nameAr: "وصل حديثاً",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
    link: "/shop?collection=new",
  },
  {
    name: "Sets",
    nameAr: "الأطقم",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85",
    link: "/shop?category=Sets",
  },
  {
    name: "Blouses / shirts",
    nameAr: "البلوزات والقمصان",
    image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=700&q=85",
    link: "/shop?category=Blouses%20%2F%20shirts",
  },
  {
    name: "Skirts / pants",
    nameAr: "التنانير والبناطيل",
    image: "https://images.unsplash.com/photo-1506629905607-d9b1c7d8b7d9?auto=format&fit=crop&w=700&q=85",
    link: "/shop?category=Skirts%20%2F%20pants",
  },
  {
    name: "Denims",
    nameAr: "الجينز والدنيم",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85",
    link: "/shop?category=Denims",
  },
  {
    name: "Dresses",
    nameAr: "الفساتين",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=85",
    link: "/shop?category=Dresses",
  },
];

export function ClassicCategories() {
  const { sections, language } = useStore();
  const isEnglish = language === "en";

  return (
    <section className="bg-[#f9f8f5] py-16 px-5 lg:px-8 border-b border-[#1c2822]/10">
      <div className="mx-auto max-w-[1240px]">
        <div className="text-center mb-10">
          <h2 className="font-times text-3xl font-bold tracking-wider text-[#1c1817]">
            {sections.categories?.title || (isEnglish ? "Shop by category" : "تسوقي بالأقسام")}
          </h2>
          <p className="text-xs text-[#1c2822]/60 mt-1">
            {sections.categories?.description ||
              (isEnglish ? "Find the section closest to your style." : "اختاري القسم الأقرب لأسلوبكِ.")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryBanners.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-black/10 shadow-2xs"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="block text-white text-xs font-bold tracking-wider">
                  {isEnglish ? cat.name : cat.nameAr}
                </span>
                <span className="mt-1 block h-0.5 w-6 mx-auto bg-[#d4775c] transition-all group-hover:w-12" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
