import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Product, Category } from "@shared/api";
import { Filter, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchFilter = searchParams.get("search") || "";
  const sortFilter = searchParams.get("sort") || "default";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?`;
    if (activeCategory && activeCategory !== "all") {
      url += `category=${encodeURIComponent(activeCategory)}&`;
    }
    if (searchFilter) {
      url += `search=${encodeURIComponent(searchFilter)}&`;
    }
    if (sortFilter && sortFilter !== "default") {
      url += `sort=${encodeURIComponent(sortFilter)}&`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, [activeCategory, searchFilter, sortFilter]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleCategoryChange = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", slug);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextParams = new URLSearchParams(searchParams);
    if (e.target.value === "default") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", e.target.value);
    }
    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1817]">
            متجر No Name
          </h1>
          <p className="text-sm text-[#786e66] mt-1">
            استعرضي تشكيلتنا الكاملة من الأزياء المحتشمة العصرية
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-[#ece4da]">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === "all"
                ? "bg-[#1c1817] text-white shadow-sm"
                : "bg-white text-[#554e4a] border border-[#ded5cb] hover:border-[#8a5d3b]"
            }`}
          >
            جميع الأقسام ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat.slug
                  ? "bg-[#1c1817] text-white shadow-sm"
                  : "bg-white text-[#554e4a] border border-[#ded5cb] hover:border-[#8a5d3b]"
              }`}
            >
              {cat.name_ar}
            </button>
          ))}
        </div>

        {/* Filter bar & Sorting controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-[#ece4da]">
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#665e58]">
            {searchFilter && (
              <span className="inline-flex items-center gap-1 bg-[#f3ece4] text-[#1c1817] px-3 py-1 rounded-full font-medium">
                بحث: "{searchFilter}"
                <button onClick={clearSearch} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <span className="font-medium text-[#1c1817]">
              عرض {products.length} قطعة
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a817c]" />
            <label htmlFor="sort-select" className="text-xs text-[#706760]">الترتيب حسب:</label>
            <select
              id="sort-select"
              value={sortFilter}
              onChange={handleSortChange}
              className="text-xs bg-[#faf8f5] border border-[#d8cfc5] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#8a5d3b] text-[#1c1817]"
            >
              <option value="default">الافتراضي</option>
              <option value="newest">الأحدث وصولاً</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#efe8e0] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#ede5db] p-8">
            <div className="w-16 h-16 bg-[#f5ede4] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8a5d3b]">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1c1817] mb-2">
              لم نجد قطعاً تطابق بحثكِ
            </h3>
            <p className="text-xs text-[#786e66] mb-6">
              جربي تغيير خيارات البحث أو اختيار قسم آخر.
            </p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="bg-[#1c1817] hover:bg-[#38312e] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
