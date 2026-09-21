import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Tag,
  Save,
  Palette,
  Layout,
  FileText,
  UploadCloud,
  Percent,
  Video,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  X,
  Layers,
} from "lucide-react";
import { Order, Product, Category, SiteSettings, Coupon, SectionSettings, PageSettings, ProductVariant } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "products" | "sections" | "pages" | "theme" | "coupons"
  >("overview");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [sections, setSections] = useState<Record<string, SectionSettings>>({});
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("arrivals");
  const [selectedPageKey, setSelectedPageKey] = useState<"about" | "shipping" | "contact">("about");

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10");

  const [saveNotice, setSaveNotice] = useState("");
  const [uploading, setUploading] = useState(false);

  // New color and variant input helpers
  const [currentColorHex, setCurrentColorHex] = useState("#d4775c");
  const [manualVariantColor, setManualVariantColor] = useState("#222222");
  const [manualVariantSize, setManualVariantSize] = useState("M");
  const [manualVariantStock, setManualVariantStock] = useState("5");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/admin/coupons").then((r) => r.json()),
    ])
      .then(([ords, prods, cats, setsData, coups]) => {
        setOrders(ords || []);
        setProducts(prods || []);
        setCategories(cats || []);
        if (setsData) {
          setSettings(setsData.siteSettings || null);
          setSections(setsData.sections || {});
          setPageSettings(setsData.pageSettings || null);
        }
        setCoupons(coups || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(""), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("no_name_admin_token");
    navigate("/admin/login");
  };

  // Upload helper using File Reader -> /api/uploads
  const handleFileUpload = async (file: File, onDone: (url: string) => void) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const res = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const json = await res.json();
        if (json.url) {
          onDone(json.url);
          showToast("تم رفع الملف بنجاح!");
        } else {
          onDone(dataUrl);
        }
      } catch {
        onDone(dataUrl);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, updates: { paymentStatus?: any; fulfillmentStatus?: any }) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? ({ ...o, ...updates } as Order) : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? ({ ...prev, ...updates } as Order) : null));
        }
        showToast("تم تحديث حالة الطلب");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Variant & Stock Matrix Helpers
  const getColorName = (hex: string) => {
    const h = hex.toLowerCase();
    if (h === "#1a1a1a" || h === "#000000" || h === "#222222" || h === "#1c1817") return "أسود";
    if (h === "#b29d89" || h === "#d4775c" || h === "#8a5d3b" || h === "#a77b5a") return "جملي / هافان";
    if (h === "#d8d1c2" || h === "#f0eae2" || h === "#f5ede6" || h === "#e6dfd5") return "بيج / نود";
    if (h === "#4a5d4e" || h === "#7d8a76" || h === "#556b2f" || h === "#2e4a3e") return "زيتي / أخضر";
    if (h === "#1b2a4a" || h === "#2c3e50" || h === "#0f172a") return "كحلي";
    if (h === "#ffffff" || h === "#fafafa") return "أبيض";
    return hex;
  };

  const handleGenerateVariantMatrix = () => {
    if (!editingProduct) return;
    const colors = editingProduct.colors && editingProduct.colors.length > 0 ? editingProduct.colors : ["#222222", "#d8d1c2"];
    const sizes = editingProduct.sizes && editingProduct.sizes.length > 0 ? editingProduct.sizes : ["S", "M", "L", "XL"];
    const existing = editingProduct.variants || [];
    const matrix: ProductVariant[] = [];

    colors.forEach((col, cIdx) => {
      sizes.forEach((sz, sIdx) => {
        const found = existing.find(
          (v) => (v.color?.toLowerCase() === col.toLowerCase() || (v as any).colorName === col) && v.size?.toUpperCase() === sz.toUpperCase()
        );
        if (found) {
          matrix.push(found);
        } else {
          matrix.push({
            id: `var-${Date.now()}-${cIdx}-${sIdx}-${Math.random().toString(36).substring(2, 5)}`,
            size: sz,
            color: col,
            colorName: getColorName(col),
            sku: `NN-${(editingProduct.category_slug || "SET").toUpperCase().slice(0, 3)}-${sz}-${cIdx + 1}`,
            stock: 5,
          });
        }
      });
    });

    const totalStock = matrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    setEditingProduct({
      ...editingProduct,
      variants: matrix,
      stock: totalStock,
    });
    showToast(`تم توليد مصفوفة المقاسات والألوان (${matrix.length} تركيبة متوفرة) بنجاح!`);
  };

  const handleUpdateVariantStock = (varId: string, newStock: number) => {
    if (!editingProduct) return;
    const currentVars = editingProduct.variants || [];
    const updated = currentVars.map((v) => (v.id === varId ? { ...v, stock: Math.max(0, newStock) } : v));
    const totalStock = updated.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    setEditingProduct({
      ...editingProduct,
      variants: updated,
      stock: totalStock,
    });
  };

  const handleRemoveVariant = (varId: string) => {
    if (!editingProduct) return;
    const currentVars = editingProduct.variants || [];
    const updated = currentVars.filter((v) => v.id !== varId);
    const totalStock = updated.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    setEditingProduct({
      ...editingProduct,
      variants: updated,
      stock: totalStock,
    });
  };

  const handleAddManualVariant = () => {
    if (!editingProduct) return;
    const currentVars = editingProduct.variants || [];
    const newVar: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      size: manualVariantSize || "M",
      color: manualVariantColor || "#222222",
      colorName: getColorName(manualVariantColor || "#222222"),
      sku: `NN-${(editingProduct.category_slug || "SET").toUpperCase().slice(0, 3)}-${manualVariantSize}-${currentVars.length + 1}`,
      stock: Number(manualVariantStock) || 5,
    };
    const updated = [...currentVars, newVar];
    const totalStock = updated.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    
    // Ensure colors and sizes arrays contain the new entry
    const colors = Array.from(new Set([...(editingProduct.colors || []), manualVariantColor]));
    const sizes = Array.from(new Set([...(editingProduct.sizes || []), manualVariantSize]));

    setEditingProduct({
      ...editingProduct,
      colors,
      sizes,
      variants: updated,
      stock: totalStock,
    });
    showToast("تم إضافة المتغير بنجاح!");
  };

  // Product Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isCreate = isNewProduct;
      const url = isCreate ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;
      const method = isCreate ? "POST" : "PUT";

      const variants = editingProduct.variants && editingProduct.variants.length > 0 ? editingProduct.variants : [];
      const computedTotalStock = variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : (typeof editingProduct.stock === "number" ? editingProduct.stock : 10);
      const lowStockAlert = typeof editingProduct.low_stock_threshold === "number"
        ? editingProduct.low_stock_threshold
        : 3;

      // Calculate sale price discount if sale price entered
      const cleaned = {
        ...editingProduct,
        price: Number(editingProduct.price) || 1990,
        sale_price: editingProduct.sale_price ? Number(editingProduct.sale_price) : undefined,
        original_price: editingProduct.original_price ? Number(editingProduct.original_price) : Number(editingProduct.price),
        image: editingProduct.images?.[0] || editingProduct.image || "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85",
        sizes: editingProduct.sizes && editingProduct.sizes.length ? editingProduct.sizes : ["S", "M", "L", "XL"],
        colors: editingProduct.colors && editingProduct.colors.length ? editingProduct.colors : ["#222222", "#d8d1c2"],
        template: editingProduct.template || "all",
        stock: computedTotalStock,
        low_stock_threshold: lowStockAlert,
        in_stock: computedTotalStock > 0 && editingProduct.in_stock !== false,
        variants: variants,
        video: editingProduct.video || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });

      if (res.ok) {
        setEditingProduct(null);
        setIsNewProduct(false);
        showToast("تم حفظ المنتج والمخزون والفاريتي بنجاح!");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync / pull products across templates
  const handleSyncProductsToAll = async (targetTemplate: "all" | "classic" | "modern" = "all") => {
    try {
      const res = await fetch("/api/admin/products/sync-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTemplate }),
      });
      if (res.ok) {
        showToast("تم سحب ومزامنة كافة المنتجات لتعمل على القالبين بنجاح!");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Discover Reels Videos
  const handleSaveDiscoverItems = async (items: any[]) => {
    if (!settings) return;
    const updatedSettings = { ...settings, discoverItems: items };
    setSettings(updatedSettings);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "siteSettings", data: updatedSettings }),
      });
      if (res.ok) {
        showToast("تم حفظ فيديوهات ريلز Discover your style بنجاح!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("هل أنتِ متأكدة من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast("تم حذف المنتج بنجاح");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSiteSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "siteSettings", data: settings }),
      });
      if (res.ok) {
        showToast("تم حفظ إعدادات وتصميم المتجر بنجاح!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Section
  const handleSaveSections = async (updatedSections: Record<string, SectionSettings>) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sections", data: updatedSections }),
      });
      if (res.ok) {
        setSections(updatedSections);
        showToast("تم حفظ محتوى السيكشن بنجاح!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Page Settings
  const handleSavePageSettings = async (updatedPages: PageSettings) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pageSettings", data: updatedPages }),
      });
      if (res.ok) {
        setPageSettings(updatedPages);
        showToast("تم حفظ محتوى الصفحة بنجاح!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount) return;

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountPercent: Number(newCouponDiscount),
          discount: Number(newCouponDiscount),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => [...prev, data.coupon]);
        setNewCouponCode("");
        showToast("تم إنشاء الكوبون بنجاح!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        showToast("تم حذف الكوبون");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Theme
  const handleSelectTheme = (newTheme: "classic" | "modern") => {
    if (!settings) return;
    const updated = { ...settings, activeTheme: newTheme, theme: newTheme };
    setSettings(updated);
    fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "siteSettings", data: updated }),
    }).then(() => {
      localStorage.setItem("no-name-theme", newTheme);
      showToast(`تم تفعيل القالب: ${newTheme === "classic" ? "الكلاسيكي (بوتيك فخم)" : "العصري (Modern)"}`);
    });
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === "pending" || o.fulfillmentStatus === "new").length;

  const filteredOrders = orders.filter(
    (o) =>
      o.publicReference.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch)
  );

  const filteredProducts = products.filter(
    (p) =>
      (p.name_ar || p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.name_en || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.badge || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#8a5d3b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#554e4a] text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#231f1e] font-sans antialiased" dir="rtl">
      {/* Toast Notification */}
      {saveNotice && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#1c1817] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#8a5d3b]/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8a5d3b]" />
          <span className="text-sm font-medium">{saveNotice}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-[#ece6df] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-serif font-bold text-xl tracking-wider text-[#1c1817] group-hover:text-[#8a5d3b] transition">
                  NO NAME
                </span>
                <span className="text-[10px] bg-[#f0eae1] text-[#8a5d3b] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  لوحة الإدارة الشاملة
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#554e4a] hover:text-[#1c1817] px-3 py-1.5 rounded-lg border border-[#e4ded6] hover:bg-[#faf8f5] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>معاينة المتجر</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-[#f4f0eb]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>نظرة عامة</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap relative ${
                activeTab === "orders"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>الطلبات والمبيعات</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "products"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المنتجات والمخزون</span>
              <span className="text-[10px] opacity-75">({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "theme"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <Palette className="w-4 h-4 text-[#e6b980]" />
              <span>القوالب والتصميم</span>
              <span className="text-[9px] bg-[#8a5d3b] text-white px-1.5 py-0.2 rounded font-mono">
                {settings?.activeTheme === "modern" ? "عصري" : "كلاسيكي"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "sections"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>محتوى السيكشنات</span>
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "pages"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>صفحات الموقع</span>
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeTab === "coupons"
                  ? "bg-[#1c1817] text-white shadow-xs"
                  : "text-[#554e4a] hover:text-[#1c1817] hover:bg-[#f2ece4]"
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>كوبونات الخصم</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================= OVERVIEW TAB ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1c1817]">نظرة عامة على المتجر</h1>
              <p className="text-xs text-[#7e746c] mt-1">ملخص مبيعات ونشاط بوتيك no name والتحكم المركزي</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#ece6df] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7e746c]">إجمالي المبيعات</span>
                  <div className="w-9 h-9 rounded-xl bg-[#f5ede6] flex items-center justify-center text-[#8a5d3b]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-[#1c1817]">{totalRevenue.toLocaleString("en-US")}</span>
                  <span className="text-xs text-[#7e746c] mr-1">ج.م</span>
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">من {orders.length} طلبات مسجلة</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ece6df] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7e746c]">طلبات قيد المراجعة</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-[#1c1817]">{pendingOrdersCount}</span>
                  <span className="text-xs text-[#7e746c] mr-1">طلب</span>
                </div>
                <p className="text-[11px] text-amber-600 mt-1 font-medium">تحتاج تأكيد تحويل أو شحن</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ece6df] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7e746c]">المنتجات النشطة</span>
                  <div className="w-9 h-9 rounded-xl bg-[#f0eae1] flex items-center justify-center text-[#8a5d3b]">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-[#1c1817]">{products.length}</span>
                  <span className="text-xs text-[#7e746c] mr-1">قطعة</span>
                </div>
                <p className="text-[11px] text-[#7e746c] mt-1">جاهزة للعرض والشراء</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#ece6df] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7e746c]">القالب المفعل</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Palette className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-bold text-[#1c1817]">
                    {settings?.activeTheme === "modern" ? "العصري (Modern)" : "الكلاسيكي الفخم"}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("theme")}
                  className="text-[11px] text-[#8a5d3b] hover:underline mt-1 font-medium"
                >
                  تغيير القالب الآن ←
                </button>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[#1c1817]">آخر الطلبات الواردة</h2>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-[#8a5d3b] hover:underline font-medium"
                >
                  عرض جميع الطلبات ({orders.length}) ←
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#7e746c]">لا توجد طلبات مسجلة بعد</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#f4f0eb] text-[#7e746c]">
                        <th className="pb-3 font-semibold">رقم الطلب</th>
                        <th className="pb-3 font-semibold">العميل</th>
                        <th className="pb-3 font-semibold">الإجمالي</th>
                        <th className="pb-3 font-semibold">طريقة الدفع</th>
                        <th className="pb-3 font-semibold">حالة الدفع</th>
                        <th className="pb-3 font-semibold">حالة الشحن</th>
                        <th className="pb-3 font-semibold">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f0eb]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-[#faf8f5] transition">
                          <td className="py-3.5 font-mono font-bold text-[#1c1817]">{order.publicReference}</td>
                          <td className="py-3.5">
                            <div className="font-medium text-[#1c1817]">{order.customerName}</div>
                            <div className="text-[11px] text-[#7e746c]">{order.phone}</div>
                          </td>
                          <td className="py-3.5 font-bold text-[#1c1817]">{order.total?.toLocaleString()} ج.م</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded bg-[#f4f0eb] text-[11px]">
                              {order.paymentMethod === "instapay"
                                ? "InstaPay"
                                : order.paymentMethod === "wallet"
                                ? "محفظة"
                                : "عند الاستلام"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                order.paymentStatus === "confirmed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.paymentStatus === "confirmed" ? "تم التأكيد" : "معلق"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                order.fulfillmentStatus === "delivered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.fulfillmentStatus === "delivered"
                                ? "مكتمل"
                                : order.fulfillmentStatus === "shipping"
                                ? "قيد التوصيل"
                                : "جديد"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab("orders");
                              }}
                              className="text-[#8a5d3b] hover:text-[#1c1817] font-medium text-xs flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>التفاصيل</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= ORDERS TAB ======================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#1c1817]">إدارة الطلبات والمبيعات</h1>
                <p className="text-xs text-[#7e746c] mt-1">متابعة وتحديث حالات الدفع وتفاصيل التحويلات البنكية</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#7e746c] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#e4ded6] text-xs focus:outline-none focus:border-[#8a5d3b]"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#f4f0eb] text-[#7e746c]">
                      <th className="pb-3 font-semibold">رقم الطلب</th>
                      <th className="pb-3 font-semibold">العميل والمحافظة</th>
                      <th className="pb-3 font-semibold">التاريخ</th>
                      <th className="pb-3 font-semibold">الإجمالي</th>
                      <th className="pb-3 font-semibold">الدفع</th>
                      <th className="pb-3 font-semibold">إيصال التحويل</th>
                      <th className="pb-3 font-semibold">الحالة</th>
                      <th className="pb-3 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f0eb]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf8f5] transition">
                        <td className="py-3.5 font-mono font-bold text-[#1c1817]">{order.publicReference}</td>
                        <td className="py-3.5">
                          <div className="font-medium text-[#1c1817]">{order.customerName}</div>
                          <div className="text-[11px] text-[#7e746c]">{order.city || order.address} · {order.phone}</div>
                        </td>
                        <td className="py-3.5 text-[#7e746c]">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="py-3.5 font-bold text-[#1c1817]">{order.total?.toLocaleString()} ج.م</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#f4f0eb] text-[11px]">
                            {order.paymentMethod === "instapay"
                              ? "InstaPay"
                              : order.paymentMethod === "wallet"
                              ? "محفظة كاش"
                              : "عند الاستلام"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {order.receiptUrl ? (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-emerald-700 font-semibold underline text-[11px] flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>عرض الإيصال</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#a09489]">لا يوجد</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <select
                            value={order.fulfillmentStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, { fulfillmentStatus: e.target.value as any })
                            }
                            className="text-xs bg-[#faf8f5] border border-[#e4ded6] rounded-lg px-2 py-1 font-medium text-[#1c1817] focus:outline-none"
                          >
                            <option value="new">جديد</option>
                            <option value="processing">قيد التجهيز</option>
                            <option value="shipping">قيد الشحن</option>
                            <option value="delivered">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </td>
                        <td className="py-3.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 text-xs border-[#e4ded6]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            تفاصيل
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= PRODUCTS TAB ======================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#1c1817]">إدارة المنتجات والمخزون</h1>
                <p className="text-xs text-[#7e746c] mt-1">تحكم كامل في أسعار القطع، الألوان، المقاسات، الشارة، والصور والفيديو</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-[#7e746c] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث في المنتجات..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#e4ded6] text-xs focus:outline-none focus:border-[#8a5d3b]"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleSyncProductsToAll("all")}
                  className="border-[#8a5d3b] text-[#8a5d3b] hover:bg-[#faf6f0] text-xs gap-1.5 h-9 shrink-0 rounded-xl font-semibold"
                  title="سحب كافة المنتجات لتكون متاحة في كلا القالبين (الكلاسيكي والعصري)"
                >
                  <Layers className="w-4 h-4" />
                  <span>سحب المنتجات للقالب الآخر</span>
                </Button>

                <Button
                  onClick={() => {
                    setIsNewProduct(true);
                    setEditingProduct({
                      name_ar: "",
                      name_en: "",
                      description_ar: "",
                      price: 2190,
                      category_slug: "sets",
                      sizes: ["S", "M", "L", "XL"],
                      colors: ["#222222", "#d8d1c2", "#7d8a76"],
                      badge: "جديد",
                      in_stock: true,
                      stock: 15,
                      template: "all",
                      images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85"],
                    });
                  }}
                  className="bg-[#1c1817] hover:bg-[#38312f] text-white text-xs gap-1.5 h-9 shrink-0 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#ece6df] p-4 shadow-xs flex flex-col justify-between group hover:border-[#8a5d3b]/50 transition"
                >
                  <div>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#f0eae1] mb-3">
                      <img
                        src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85"}
                        alt={p.name_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {p.badge && (
                        <span className="absolute top-2 right-2 bg-[#1c1817] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                          {p.badge}
                        </span>
                      )}
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[#1c1817] text-[9px] px-2 py-0.5 rounded-md font-medium border border-black/10">
                        {p.template === "classic" ? "الكلاسيكي" : p.template === "modern" ? "العصري" : "القالبين"}
                      </span>
                      {p.sale_price && (
                        <span className="absolute top-2 left-2 bg-[#d4775c] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                          خصم
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-[#1c1817] line-clamp-1">{p.name_ar || p.name}</h3>
                    <p className="text-[11px] text-[#7e746c] mt-0.5">{p.name_en || p.category_slug}</p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-bold text-sm text-[#1c1817]">
                        {(p.sale_price || p.price || 1990).toLocaleString()} ج.م
                      </span>
                      {p.sale_price && (
                        <span className="text-xs text-[#a09489] line-through">
                          {p.price?.toLocaleString()} ج.م
                        </span>
                      )}
                    </div>

                    {/* Colors & Sizes Preview */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#7e746c]">
                      <div className="flex items-center gap-1">
                        {(p.colors || []).slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono">
                        {(p.sizes || []).join(" · ")}
                      </span>
                    </div>

                    {/* Stock & Low-Stock Alert status */}
                    <div className="mt-2.5">
                      {typeof p.stock === "number" && p.stock <= 0 ? (
                        <div className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold flex items-center justify-between border border-red-200">
                          <span>❌ نفد من المخزون</span>
                          <span>0 قطع</span>
                        </div>
                      ) : typeof p.stock === "number" && p.stock <= (p.low_stock_threshold || 3) ? (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-[10px] font-bold flex items-center justify-between border border-amber-200">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            مخزون منخفض!
                          </span>
                          <span>{p.stock} قطع (تنبيه عند {p.low_stock_threshold || 3})</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold flex items-center justify-between border border-emerald-100">
                          <span>📦 متوفر بالمخزون</span>
                          <span>{p.stock ?? 10} قطعة ({p.variants?.length || 0} فاريتي)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f4f0eb] flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsNewProduct(false);
                        setEditingProduct(p);
                      }}
                      className="flex-1 h-8 text-xs border-[#e4ded6] hover:bg-[#f5ede6] hover:text-[#8a5d3b]"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      تعديل
                    </Button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TEMPLATES & DESIGN TAB ======================= */}
        {activeTab === "theme" && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1c1817]">قوالب وتصميم المتجر</h1>
              <p className="text-xs text-[#7e746c] mt-1">اختاري مظهر المتجر العام، الألوان، ونصوص البانر الإعلاني</p>
            </div>

            {/* Template Chooser Cards */}
            <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#1c1817] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#8a5d3b]" />
                <span>اختر قالب المتجر (Template Selector)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Template 1: Classic Boutique */}
                <div
                  onClick={() => handleSelectTheme("classic")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition relative ${
                    settings?.activeTheme === "classic" || !settings?.activeTheme
                      ? "border-[#8a5d3b] bg-[#faf6f0] shadow-sm"
                      : "border-[#e4ded6] bg-white hover:border-[#8a5d3b]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif font-bold text-base text-[#1c1817]">
                      القالب الكلاسيكي الأصلي (Classic Boutique)
                    </span>
                    {(settings?.activeTheme === "classic" || !settings?.activeTheme) && (
                      <span className="bg-[#8a5d3b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        القالب النشط حالياً ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#554e4a] leading-relaxed mb-4">
                    التصميم الأصلي للبوتيك الفخم: شريط إعلانات متحرك بلون بيج راقي (`#f4f2e9`)، شعار بخط Times New Roman، أرفف التشكيلات الأفقية بالسحب (`CollectionShelf`)، وسيكشن فيديوهات اكتشفي أسلوبك.
                  </p>
                  <div className="h-24 rounded-xl bg-[#eeece1] border border-black/10 flex flex-col justify-center items-center text-center p-2 text-[10px] text-[#1c2822]">
                    <span className="font-times font-bold text-lg tracking-widest">No Name</span>
                    <span className="tracking-widest text-[7px]">MODEST WEAR</span>
                    <span className="mt-1 text-[9px] text-[#d4775c]">✨ New Collection · Sets · Dresses</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-4 bg-[#8a5d3b] hover:bg-[#6e482b] text-white text-xs h-8"
                    onClick={() => handleSelectTheme("classic")}
                  >
                    تفعيل القالب الكلاسيكي
                  </Button>
                </div>

                {/* Template 2: Modern Minimalist */}
                <div
                  onClick={() => handleSelectTheme("modern")}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition relative ${
                    settings?.activeTheme === "modern"
                      ? "border-[#1c1817] bg-[#f8f7f5] shadow-sm"
                      : "border-[#e4ded6] bg-white hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans font-bold text-base text-[#1c1817]">
                      القالب العصري (Modern Minimalist)
                    </span>
                    {settings?.activeTheme === "modern" && (
                      <span className="bg-[#1c1817] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        القالب النشط حالياً ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#554e4a] leading-relaxed mb-4">
                    التصميم العصري النقي: شريط علوي داكن مع أيقونات Sparkles، تصفح حديث مع فلاتر سريعة، بطاقات المنتجات المودرن مع زر الطلب المباشر عبر واتساب.
                  </p>
                  <div className="h-24 rounded-xl bg-white border border-[#ece6df] flex flex-col justify-center items-center text-center p-2 text-[10px] text-[#1c1817]">
                    <span className="font-bold text-base tracking-wider">NO NAME</span>
                    <span className="text-[7px] text-[#8a5d3b] uppercase">MODEST WEAR</span>
                    <span className="mt-1 text-[9px] text-[#554e4a]">Clean Minimalist Grid</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-4 bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs h-8"
                    onClick={() => handleSelectTheme("modern")}
                  >
                    تفعيل القالب العصري
                  </Button>
                </div>
              </div>
            </div>

            {/* General Site Config */}
            <form onSubmit={handleSaveSiteSettings} className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[#1c1817]">إعدادات الموقع ومعلومات التواصل</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">اسم المتجر</label>
                  <input
                    type="text"
                    value={settings?.storeName || ""}
                    onChange={(e) => setSettings(settings ? { ...settings, storeName: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">اللون المميز (Accent Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings?.accent || "#d4775c"}
                      onChange={(e) => setSettings(settings ? { ...settings, accent: e.target.value } : null)}
                      className="w-9 h-9 rounded-lg border border-[#e4ded6] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings?.accent || "#d4775c"}
                      onChange={(e) => setSettings(settings ? { ...settings, accent: e.target.value } : null)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[#554e4a] font-medium mb-1.5">نص شريط الإعلانات العلوي</label>
                  <input
                    type="text"
                    value={settings?.announcement || ""}
                    onChange={(e) => setSettings(settings ? { ...settings, announcement: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    placeholder="شحن مجاني لجميع الطلبات أكثر من 2500 جنيه..."
                  />
                </div>

                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">رقم واتساب المبيعات</label>
                  <input
                    type="text"
                    value={settings?.salesWhatsappNumber || ""}
                    onChange={(e) => setSettings(settings ? { ...settings, salesWhatsappNumber: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono"
                    placeholder="201068568250"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">رقم InstaPay أو المحفظة</label>
                  <input
                    type="text"
                    value={settings?.instapayHandle || settings?.walletNumber || "01068568250"}
                    onChange={(e) =>
                      setSettings(
                        settings
                          ? { ...settings, instapayHandle: e.target.value, walletNumber: e.target.value }
                          : null
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">تكلفة الشحن الثابتة (ج.م)</label>
                  <input
                    type="number"
                    value={settings?.standardShippingCost || 80}
                    onChange={(e) =>
                      setSettings(settings ? { ...settings, standardShippingCost: Number(e.target.value) } : null)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">حد الشحن المجاني (ج.م)</label>
                  <input
                    type="number"
                    value={settings?.freeShippingThreshold || 2500}
                    onChange={(e) =>
                      setSettings(settings ? { ...settings, freeShippingThreshold: Number(e.target.value) } : null)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#f4f0eb]">
                <Button type="submit" className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-6 h-9 rounded-xl">
                  <Save className="w-4 h-4 ml-1.5" />
                  حفظ إعدادات وتصميم المتجر
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ======================= SECTIONS CONTENT TAB ======================= */}
        {activeTab === "sections" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1c1817]">التحكم في محتوى السيكشنات</h1>
              <p className="text-xs text-[#7e746c] mt-1">تغيير العناوين، الأوصاف، الصور، وفيديوهات كل سيكشن بالصفحة الرئيسية</p>
            </div>

            {/* Section Picker Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "arrivals", label: "وصل حديثاً (Arrivals)" },
                { key: "categories", label: "تسوقي بالأقسام (Categories)" },
                { key: "editorial", label: "بانر الأسلوب (Editorial)" },
                { key: "discover", label: "فيديوهات الأسلوب (Discover)" },
                { key: "sets", label: "رف الأطقم (Sets)" },
                { key: "tops", label: "رف التوبس (Tops)" },
                { key: "pants", label: "رف البناطيل (Pants)" },
                { key: "dresses", label: "رف الفساتين (Dresses)" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelectedSectionKey(s.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedSectionKey === s.key
                      ? "bg-[#1c1817] text-white shadow-xs"
                      : "bg-white border border-[#e4ded6] text-[#554e4a] hover:bg-[#faf8f5]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Current Section Editor */}
            <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#1c1817]">
                تعديل سيكشن: <span className="text-[#8a5d3b]">{selectedSectionKey}</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">عنوان السيكشن</label>
                  <input
                    type="text"
                    value={sections[selectedSectionKey]?.title || ""}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        [selectedSectionKey]: {
                          ...sections[selectedSectionKey],
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">الوصف / النص التوضيحي</label>
                  <textarea
                    rows={2}
                    value={sections[selectedSectionKey]?.description || ""}
                    onChange={(e) =>
                      setSections({
                        ...sections,
                        [selectedSectionKey]: {
                          ...sections[selectedSectionKey],
                          description: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>

                {/* Section Image with Upload */}
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">صورة السيكشن (رابط أو رفع ملف)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sections[selectedSectionKey]?.image || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          [selectedSectionKey]: {
                            ...sections[selectedSectionKey],
                            image: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                      placeholder="https://..."
                    />
                    <label className="cursor-pointer bg-[#faf8f5] border border-[#e4ded6] hover:bg-[#f0eae1] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#1c1817]">
                      <UploadCloud className="w-4 h-4" />
                      <span>رفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setSections({
                                ...sections,
                                [selectedSectionKey]: {
                                  ...sections[selectedSectionKey],
                                  image: url,
                                },
                              });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {sections[selectedSectionKey]?.image && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-[#ece6df]">
                      <img
                        src={sections[selectedSectionKey]?.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Section Video with Upload */}
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">فيديو السيكشن (اختياري - رابط أو رفع)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sections[selectedSectionKey]?.video || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          [selectedSectionKey]: {
                            ...sections[selectedSectionKey],
                            video: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                      placeholder="رابط فيديو mp4 أو يوتيوب..."
                    />
                    <label className="cursor-pointer bg-[#faf8f5] border border-[#e4ded6] hover:bg-[#f0eae1] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#1c1817]">
                      <Video className="w-4 h-4" />
                      <span>رفع فيديو</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              setSections({
                                ...sections,
                                [selectedSectionKey]: {
                                  ...sections[selectedSectionKey],
                                  video: url,
                                },
                              });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Specialized Discover Video Reels Manager for Classic Template */}
              {selectedSectionKey === "discover" && (
                <div className="mt-6 pt-6 border-t border-[#f4f0eb] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1817] flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#8a5d3b]" />
                        <span>فيديوهات ريلز Discover your style (القالب الكلاسيكي)</span>
                      </h3>
                      <p className="text-[11px] text-[#7e746c] mt-0.5">
                        هذه الفيديوهات تظهر في الصفحة الرئيسية كبطاقات فيديو تفاعلية (Reels) مع إمكانية تشغيلها وربطها بروابط الشراء.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const current = settings?.discoverItems || [];
                        const newItem = {
                          id: "v" + Date.now(),
                          title: "New Outfit Look",
                          titleAr: "إطلالة جديدة",
                          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
                          video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-42289-large.mp4",
                          link: "/shop",
                        };
                        const updated = [...current, newItem];
                        if (settings) {
                          setSettings({ ...settings, discoverItems: updated });
                        }
                      }}
                      className="bg-[#1c1817] hover:bg-[#38312f] text-white text-xs h-8 rounded-xl gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فيديو ريلز جديد</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(settings?.discoverItems && settings.discoverItems.length > 0
                      ? settings.discoverItems
                      : [
                          {
                            id: "v1",
                            title: "Daytime Linen",
                            titleAr: "كتان نهاري مريح",
                            image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80",
                            video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-42289-large.mp4",
                            link: "/shop?category=Sets",
                          },
                          {
                            id: "v2",
                            title: "City Walks",
                            titleAr: "إطلالات المدينة",
                            image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
                            video: "https://assets.mixkit.co/videos/preview/mixkit-woman-turning-while-wearing-a-dress-41870-large.mp4",
                            link: "/shop?category=Dresses",
                          },
                          {
                            id: "v3",
                            title: "Evening Ease",
                            titleAr: "أناقة المساء",
                            image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
                            video: "https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-summer-dress-41871-large.mp4",
                            link: "/shop?collection=new",
                          },
                          {
                            id: "v4",
                            title: "The Relaxed Fit",
                            titleAr: "القصة الواسعة",
                            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
                            video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-neon-lights-42290-large.mp4",
                            link: "/shop?category=Skirts%20%2F%20pants",
                          },
                        ]
                    ).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-[#faf8f5] border border-[#e4ded6] rounded-2xl p-4 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1c1817]">فيديو ريلز #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const current = settings?.discoverItems || [];
                              const updated = current.filter((_, i) => i !== idx);
                              if (settings) {
                                setSettings({ ...settings, discoverItems: updated });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف هذا الفيديو"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <label className="block text-[#554e4a] font-medium mb-1">العنوان بالعربية</label>
                            <input
                              type="text"
                              value={item.titleAr || ""}
                              onChange={(e) => {
                                const current = [...(settings?.discoverItems || [])];
                                if (current[idx]) {
                                  current[idx] = { ...current[idx], titleAr: e.target.value };
                                  if (settings) setSettings({ ...settings, discoverItems: current });
                                }
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white"
                              placeholder="كتان نهاري مريح"
                            />
                          </div>
                          <div>
                            <label className="block text-[#554e4a] font-medium mb-1">العنوان بالإنجليزية</label>
                            <input
                              type="text"
                              value={item.title || ""}
                              onChange={(e) => {
                                const current = [...(settings?.discoverItems || [])];
                                if (current[idx]) {
                                  current[idx] = { ...current[idx], title: e.target.value };
                                  if (settings) setSettings({ ...settings, discoverItems: current });
                                }
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white"
                              placeholder="Daytime Linen"
                            />
                          </div>
                        </div>

                        {/* Video File / URL with device upload */}
                        <div>
                          <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                            ملف / رابط الفيديو (MP4)
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={item.video || ""}
                              onChange={(e) => {
                                const current = [...(settings?.discoverItems || [])];
                                if (current[idx]) {
                                  current[idx] = { ...current[idx], video: e.target.value };
                                  if (settings) setSettings({ ...settings, discoverItems: current });
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px]"
                              placeholder="رابط الفيديو أو ارفعه من الجهاز..."
                            />
                            <label className="cursor-pointer bg-white border border-[#e4ded6] hover:bg-[#eeece1] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-[#1c1817]">
                              <Video className="w-3 h-3 text-[#8a5d3b]" />
                              <span>رفع فيديو</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, (url) => {
                                      const current = [...(settings?.discoverItems || [])];
                                      if (current[idx]) {
                                        current[idx] = { ...current[idx], video: url };
                                        if (settings) setSettings({ ...settings, discoverItems: current });
                                      }
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Poster Image with device upload */}
                        <div>
                          <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                            صورة الغلاف (Poster)
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={item.image || ""}
                              onChange={(e) => {
                                const current = [...(settings?.discoverItems || [])];
                                if (current[idx]) {
                                  current[idx] = { ...current[idx], image: e.target.value };
                                  if (settings) setSettings({ ...settings, discoverItems: current });
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px]"
                              placeholder="رابط الغلاف أو ارفعه من الجهاز..."
                            />
                            <label className="cursor-pointer bg-white border border-[#e4ded6] hover:bg-[#eeece1] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-[#1c1817]">
                              <UploadCloud className="w-3 h-3 text-[#8a5d3b]" />
                              <span>رفع غلاف</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, (url) => {
                                      const current = [...(settings?.discoverItems || [])];
                                      if (current[idx]) {
                                        current[idx] = { ...current[idx], image: url };
                                        if (settings) setSettings({ ...settings, discoverItems: current });
                                      }
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Target Link */}
                        <div>
                          <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                            رابط الزر (تسوقي الإطلالة)
                          </label>
                          <input
                            type="text"
                            value={item.link || ""}
                            onChange={(e) => {
                              const current = [...(settings?.discoverItems || [])];
                              if (current[idx]) {
                                current[idx] = { ...current[idx], link: e.target.value };
                                if (settings) setSettings({ ...settings, discoverItems: current });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px]"
                            placeholder="/shop?category=Sets"
                          />
                        </div>

                        {/* Small Video preview box */}
                        {item.video && (
                          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-black border border-black/10">
                            <video
                              src={item.video}
                              poster={item.image}
                              controls
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => handleSaveDiscoverItems(settings?.discoverItems || [])}
                      className="bg-[#8a5d3b] hover:bg-[#724a2c] text-white text-xs px-5 h-8 rounded-xl"
                    >
                      <Save className="w-3.5 h-3.5 ml-1" />
                      حفظ فيديوهات ريلز Discover
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-[#f4f0eb]">
                <Button
                  onClick={() => handleSaveSections(sections)}
                  className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-6 h-9 rounded-xl"
                >
                  <Save className="w-4 h-4 ml-1.5" />
                  حفظ تغييرات السيكشن
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= PAGES CONTENT TAB ======================= */}
        {activeTab === "pages" && pageSettings && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1c1817]">التحكم في نصوص وصفحات الموقع</h1>
              <p className="text-xs text-[#7e746c] mt-1">تعديل محتوى صفحة "عن no name"، "الشحن والاستبدال"، وصفحة "تواصلي معنا"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPageKey("about")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedPageKey === "about"
                    ? "bg-[#1c1817] text-white shadow-xs"
                    : "bg-white border border-[#e4ded6] text-[#554e4a] hover:bg-[#faf8f5]"
                }`}
              >
                عن no name (About)
              </button>
              <button
                onClick={() => setSelectedPageKey("shipping")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedPageKey === "shipping"
                    ? "bg-[#1c1817] text-white shadow-xs"
                    : "bg-white border border-[#e4ded6] text-[#554e4a] hover:bg-[#faf8f5]"
                }`}
              >
                الشحن والاستبدال (Shipping)
              </button>
              <button
                onClick={() => setSelectedPageKey("contact")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedPageKey === "contact"
                    ? "bg-[#1c1817] text-white shadow-xs"
                    : "bg-white border border-[#e4ded6] text-[#554e4a] hover:bg-[#faf8f5]"
                }`}
              >
                تواصلي معنا (Contact)
              </button>
            </div>

            {/* About Page Editor */}
            {selectedPageKey === "about" && (
              <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-4 text-xs">
                <h2 className="text-base font-bold text-[#1c1817]">محتوى صفحة "عن no name"</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1.5">العنوان بالعربية</label>
                    <input
                      type="text"
                      value={pageSettings.about.titleAr || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, titleAr: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1.5">Title in English</label>
                    <input
                      type="text"
                      value={pageSettings.about.titleEn || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, titleEn: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#554e4a] font-medium mb-1.5">المقدمة والقصة (عربي)</label>
                    <textarea
                      rows={3}
                      value={pageSettings.about.introAr || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, introAr: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#554e4a] font-medium mb-1.5">نص الرؤية والحرفيين (عربي)</label>
                    <textarea
                      rows={3}
                      value={pageSettings.about.bodyAr || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, bodyAr: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1.5">رابط الصورة الأولى</label>
                    <input
                      type="text"
                      value={pageSettings.about.image1 || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, image1: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1.5">رابط الصورة الثانية</label>
                    <input
                      type="text"
                      value={pageSettings.about.image2 || ""}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          about: { ...pageSettings.about, image2: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#f4f0eb]">
                  <Button
                    onClick={() => handleSavePageSettings(pageSettings)}
                    className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-6 h-9 rounded-xl"
                  >
                    <Save className="w-4 h-4 ml-1.5" />
                    حفظ صفحة About
                  </Button>
                </div>
              </div>
            )}

            {/* Shipping Page Editor */}
            {selectedPageKey === "shipping" && (
              <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-4 text-xs">
                <h2 className="text-base font-bold text-[#1c1817]">محتوى صفحة الشحن والاستبدال</h2>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">النص بالعربية</label>
                  <textarea
                    rows={4}
                    value={pageSettings.shipping.contentAr || ""}
                    onChange={(e) =>
                      setPageSettings({
                        ...pageSettings,
                        shipping: { ...pageSettings.shipping, contentAr: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">Text in English</label>
                  <textarea
                    rows={4}
                    value={pageSettings.shipping.contentEn || ""}
                    onChange={(e) =>
                      setPageSettings({
                        ...pageSettings,
                        shipping: { ...pageSettings.shipping, contentEn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-[#f4f0eb]">
                  <Button
                    onClick={() => handleSavePageSettings(pageSettings)}
                    className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-6 h-9 rounded-xl"
                  >
                    <Save className="w-4 h-4 ml-1.5" />
                    حفظ صفحة الشحن
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Page Editor */}
            {selectedPageKey === "contact" && (
              <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-4 text-xs">
                <h2 className="text-base font-bold text-[#1c1817]">محتوى صفحة تواصلي معنا</h2>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">بريد استلام الرسائل</label>
                  <input
                    type="email"
                    value={pageSettings.contact.recipientEmail || ""}
                    onChange={(e) =>
                      setPageSettings({
                        ...pageSettings,
                        contact: { ...pageSettings.contact, recipientEmail: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">رسالة الترحيب بالعربية</label>
                  <textarea
                    rows={3}
                    value={pageSettings.contact.contentAr || ""}
                    onChange={(e) =>
                      setPageSettings({
                        ...pageSettings,
                        contact: { ...pageSettings.contact, contentAr: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-[#f4f0eb]">
                  <Button
                    onClick={() => handleSavePageSettings(pageSettings)}
                    className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-6 h-9 rounded-xl"
                  >
                    <Save className="w-4 h-4 ml-1.5" />
                    حفظ صفحة التواصل
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= COUPONS TAB ======================= */}
        {activeTab === "coupons" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1c1817]">كوبونات الخصم</h1>
              <p className="text-xs text-[#7e746c] mt-1">إنشاء أكواد ترويجية وتحديد نسبة الخصم ومتابعة الاستخدامات</p>
            </div>

            {/* Create Coupon Form */}
            <form onSubmit={handleAddCoupon} className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#1c1817] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#8a5d3b]" />
                <span>إنشاء كود خصم جديد</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[#554e4a] font-medium mb-1.5">كود الخصم (مثال: SUMMER20)</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="EID10"
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#554e4a] font-medium mb-1.5">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-[#1c1817] hover:bg-[#332e2c] text-white text-xs px-5 h-9 rounded-xl">
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة الكوبون
                </Button>
              </div>
            </form>

            {/* Coupons List */}
            <div className="bg-white rounded-2xl border border-[#ece6df] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#1c1817] mb-4">الأكواد الفعالة</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#f4f0eb] text-[#7e746c]">
                      <th className="pb-3 font-semibold">كود الخصم</th>
                      <th className="pb-3 font-semibold">النسبة</th>
                      <th className="pb-3 font-semibold">الاستخدامات</th>
                      <th className="pb-3 font-semibold">الحالة</th>
                      <th className="pb-3 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f0eb]">
                    {coupons.map((coupon) => (
                      <tr key={coupon.code} className="hover:bg-[#faf8f5]">
                        <td className="py-3 font-mono font-bold text-sm text-[#1c1817]">{coupon.code}</td>
                        <td className="py-3 font-bold text-[#d4775c]">
                          {coupon.discountPercent || (coupon as any).discount}%
                        </td>
                        <td className="py-3 text-[#7e746c]">
                          {coupon.usedCount || (coupon as any).uses || 0} مرة
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                            نشط
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDeleteCoupon(coupon.code)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            title="حذف الكوبون"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= PRODUCT EDIT/CREATE MODAL ======================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#ece6df] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f4f0eb] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#1c1817]">
                {isNewProduct ? "إضافة قطعة أزياء جديدة" : `تعديل: ${editingProduct.name_ar || editingProduct.name}`}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full text-[#7e746c] hover:bg-[#faf8f5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_ar || editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    placeholder="طقم كتان بلون الجمل"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={editingProduct.name_en || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    placeholder="Camel Linen Set"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">السعر الأصلي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value), original_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">سعر الخصم / العرض (اختياري)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sale_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-bold text-[#d4775c]"
                    placeholder="مثال: 1990"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">القسم *</label>
                  <select
                    value={editingProduct.category_slug || "sets"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  >
                    <option value="sets">أطقم (Sets)</option>
                    <option value="tops">توبس وقمصان (Blouses / shirts)</option>
                    <option value="pants">بناطيل وتنانير (Skirts / pants)</option>
                    <option value="jackets">جاكيتات (Jackets)</option>
                    <option value="denims">جينز (Denims)</option>
                    <option value="dresses">فساتين (Dresses)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">الشارة الخارجية (Tag / Badge)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                    placeholder="مثال: جديد، الأكثر طلباً، -25%"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1">القالب المعروض فيه هذا المنتج</label>
                  <select
                    value={editingProduct.template || "all"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, template: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-medium"
                  >
                    <option value="all">كلا القالبين (الكلاسيكي والعصري معاً)</option>
                    <option value="classic">القالب الكلاسيكي فقط (Classic)</option>
                    <option value="modern">القالب العصري فقط (Modern)</option>
                  </select>
                </div>
              </div>

              {/* Colors Manager with Color Picker */}
              <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#e4ded6] space-y-2">
                <label className="block font-semibold text-[#1c1817]">ألوان المنتج المتاحة</label>
                <div className="flex flex-wrap items-center gap-2">
                  {(editingProduct.colors || []).map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#e4ded6] shadow-2xs"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                      <span className="font-mono text-[11px]">{color}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingProduct.colors || []).filter((_, i) => i !== index);
                          setEditingProduct({ ...editingProduct, colors: updated });
                        }}
                        className="text-red-500 hover:text-red-700 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="color"
                    value={currentColorHex}
                    onChange={(e) => setCurrentColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#e4ded6]"
                  />
                  <input
                    type="text"
                    value={currentColorHex}
                    onChange={(e) => setCurrentColorHex(e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingProduct.colors?.includes(currentColorHex)) {
                        setEditingProduct({
                          ...editingProduct,
                          colors: [...(editingProduct.colors || []), currentColorHex],
                        });
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1c1817] text-white rounded-lg text-xs font-semibold hover:bg-[#38312f]"
                  >
                    + إضافة اللون
                  </button>
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="p-3 bg-[#faf8f5] rounded-2xl border border-[#e4ded6] space-y-2">
                <label className="block font-semibold text-[#1c1817]">المقاسات المتوفرة</label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((sz) => {
                    const active = (editingProduct.sizes || []).includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const list = editingProduct.sizes || [];
                          const next = active ? list.filter((s) => s !== sz) : [...list, sz];
                          setEditingProduct({ ...editingProduct, sizes: next });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                          active
                            ? "bg-[#1c1817] text-white border-[#1c1817]"
                            : "bg-white text-[#554e4a] border-[#e4ded6] hover:border-black"
                        }`}
                      >
                        {sz} {active && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= INVENTORY & STOCK CONTROLS ================= */}
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#8a5d3b]" />
                    <label className="font-bold text-[#1c1817] text-sm">التحكم في المخزون والتنبيه بالنقص</label>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#554e4a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.in_stock !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, in_stock: e.target.checked })}
                      className="w-4 h-4 rounded text-[#8a5d3b] accent-[#8a5d3b]"
                    />
                    <span>متاح للطلب بالموقع</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#554e4a] mb-1">
                      إجمالي عدد الاستوك المتوفر:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={typeof editingProduct.stock === "number" ? editingProduct.stock : 10}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-white font-bold text-sm text-[#1c1817] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#7e746c] mt-1">
                      (إذا قمتِ بتوليد مصفوفة الفاريتي بالأسفل، سيتم حساب الإجمالي تلقائياً)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#554e4a] mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>عند كم قطعة يتم التنبيه بالنقص؟:</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={typeof editingProduct.low_stock_threshold === "number" ? editingProduct.low_stock_threshold : 3}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          low_stock_threshold: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-sm text-amber-900 focus:outline-none"
                    />
                    <p className="text-[10px] text-amber-700 mt-1">
                      سيظهر تنبيه فوري باللون البرتقالي عندما يصل المخزون لهذا العدد أو أقل.
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= VARIANTS MATRIX (المقاسات والألوان المتاحة) ================= */}
              <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e4ded6] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-[#1c1817] text-sm block">
                      إدارة الفاريتي (المقاسات والألوان المتاحة واستوك كل تركيبة)
                    </label>
                    <p className="text-[11px] text-[#7e746c]">
                      حددي لكل لون كم متاح ومن كل مقاس ما هي الألوان المتوفرة لتفادي أي تعارض في الطلبات
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateVariantMatrix}
                    className="px-3 py-1.5 bg-[#8a5d3b] hover:bg-[#724a2e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد المصفوفة تلقائياً (Matrix)</span>
                  </button>
                </div>

                {/* Add Manual Variant Line */}
                <div className="p-3 bg-white rounded-xl border border-[#e8e2d8] space-y-2">
                  <span className="text-[11px] font-bold text-[#554e4a] block">+ إضافة متغير خاص يدوياً:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <div>
                      <label className="text-[10px] text-[#7e746c] block mb-0.5">اللون:</label>
                      <select
                        value={manualVariantColor}
                        onChange={(e) => setManualVariantColor(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#e4ded6] bg-[#faf8f5] font-medium"
                      >
                        {(editingProduct.colors && editingProduct.colors.length > 0 ? editingProduct.colors : ["#222222", "#d4775c", "#d8d1c2", "#7d8a76"]).map((c) => (
                          <option key={c} value={c}>
                            {getColorName(c)} ({c})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7e746c] block mb-0.5">المقاس:</label>
                      <select
                        value={manualVariantSize}
                        onChange={(e) => setManualVariantSize(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#e4ded6] bg-[#faf8f5] font-medium"
                      >
                        {(editingProduct.sizes && editingProduct.sizes.length > 0 ? editingProduct.sizes : ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7e746c] block mb-0.5">الكمية المتوفرة:</label>
                      <input
                        type="number"
                        min="0"
                        value={manualVariantStock}
                        onChange={(e) => setManualVariantStock(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#e4ded6] bg-[#faf8f5] font-bold"
                      />
                    </div>

                    <div className="pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={handleAddManualVariant}
                        className="w-full px-3 py-1.5 bg-[#1c1817] hover:bg-[#332e2c] text-white rounded-lg text-xs font-semibold"
                      >
                        + إضافة التركيبة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variants List Table */}
                {editingProduct.variants && editingProduct.variants.length > 0 ? (
                  <div className="border border-[#e8e2d8] rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#f5ede6] text-[#554e4a] border-b border-[#e8e2d8] sticky top-0 font-bold text-[11px]">
                        <tr>
                          <th className="p-2.5">اللون</th>
                          <th className="p-2.5">المقاس</th>
                          <th className="p-2.5">كود SKU</th>
                          <th className="p-2.5">الاستوك المتاح</th>
                          <th className="p-2.5">الحالة</th>
                          <th className="p-2.5 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0eae1]">
                        {editingProduct.variants.map((v, vIdx) => (
                          <tr key={v.id || vIdx} className="hover:bg-[#faf7f3] transition">
                            <td className="p-2.5 flex items-center gap-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 inline-block"
                                style={{ backgroundColor: v.color }}
                              />
                              <span className="font-semibold text-[#1c1817]">
                                {v.colorName || getColorName(v.color)}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold font-mono text-[#1c1817]">
                              {v.size}
                            </td>
                            <td className="p-2.5 font-mono text-[10px] text-[#7e746c]">
                              {v.sku || `SKU-${v.size}`}
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                value={typeof v.stock === "number" ? v.stock : 0}
                                onChange={(e) => handleUpdateVariantStock(v.id, Number(e.target.value))}
                                className="w-20 px-2 py-1 rounded-lg border border-[#e4ded6] bg-[#faf8f5] font-bold text-xs focus:outline-none focus:border-[#8a5d3b]"
                              />
                            </td>
                            <td className="p-2.5">
                              {v.stock === 0 ? (
                                <span className="text-[10px] text-red-600 font-bold">نفد (0)</span>
                              ) : v.stock <= (editingProduct.low_stock_threshold || 3) ? (
                                <span className="text-[10px] text-amber-700 font-bold">منخفض ({v.stock})</span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-semibold">متوفر ({v.stock})</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                title="حذف هذا المقاس/اللون"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-white border border-dashed border-[#e4ded6] text-xs text-[#7e746c]">
                    لم يتم توليد فاريتي تفصيلي بعد. اضغطي على زر{" "}
                    <strong className="text-[#8a5d3b]">"توليد المصفوفة تلقائياً"</strong> بالاعلى لربط كل مقاس بكافة الألوان وتحديد استوك كل تركيبة بدقة!
                  </div>
                )}
              </div>

              {/* Images Manager */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#1c1817]">صور القطعة (حتى 4 صور مع إمكانية الرفع)</label>
                {(editingProduct.images || [editingProduct.image || ""]).map((imgUrl, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => {
                        const copy = [...(editingProduct.images || [])];
                        copy[index] = e.target.value;
                        setEditingProduct({ ...editingProduct, images: copy });
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                      placeholder="رابط الصورة..."
                    />
                    <label className="cursor-pointer bg-[#faf8f5] border border-[#e4ded6] hover:bg-[#f0eae1] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>رفع</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              const copy = [...(editingProduct.images || [])];
                              copy[index] = url;
                              setEditingProduct({ ...editingProduct, images: copy });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const copy = [...(editingProduct.images || [])];
                    if (copy.length < 5) copy.push("");
                    setEditingProduct({ ...editingProduct, images: copy });
                  }}
                  className="text-xs text-[#8a5d3b] hover:underline font-semibold"
                >
                  + إضافة صورة إضافية
                </button>
              </div>

              {/* Product Video */}
              <div>
                <label className="block font-semibold text-[#1c1817] mb-1">فيديو المنتج (اختياري)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.video || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, video: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none font-mono text-xs"
                    placeholder="رابط فيديو القطعة..."
                  />
                  <label className="cursor-pointer bg-[#faf8f5] border border-[#e4ded6] hover:bg-[#f0eae1] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>رفع فيديو</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setEditingProduct({ ...editingProduct, video: url });
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#1c1817] mb-1">الوصف التفصيلي</label>
                <textarea
                  rows={3}
                  value={editingProduct.description_ar || editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none"
                  placeholder="تفاصيل القماش، الإحساس، وقصة التصميم..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f0eb]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl"
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-[#1c1817] hover:bg-[#332e2c] text-white rounded-xl">
                  <Save className="w-4 h-4 ml-1.5" />
                  حفظ القطعة
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ORDER DETAILS MODAL ======================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#ece6df] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f4f0eb] pb-4">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1c1817]">
                  تفاصيل الطلب: <span className="font-mono text-[#8a5d3b]">{selectedOrder.publicReference}</span>
                </h2>
                <p className="text-[11px] text-[#7e746c] mt-0.5">
                  تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-[#7e746c] hover:bg-[#faf8f5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Information */}
            <div className="bg-[#faf8f5] rounded-2xl p-4 border border-[#ece6df] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#7e746c] block">اسم العميل:</span>
                <span className="font-bold text-[#1c1817]">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-[#7e746c] block">رقم الهاتف:</span>
                <a href={`tel:${selectedOrder.phone}`} className="font-mono font-bold text-[#8a5d3b]">
                  {selectedOrder.phone}
                </a>
              </div>
              <div className="col-span-2">
                <span className="text-[#7e746c] block">عنوان التوصيل:</span>
                <span className="text-[#1c1817]">{selectedOrder.city ? `${selectedOrder.city} - ` : ""}{selectedOrder.address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="col-span-2">
                  <span className="text-[#7e746c] block">ملاحظات العميل:</span>
                  <span className="text-[#1c1817] italic">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-[#1c1817]">المنتجات المطلوبة ({selectedOrder.items?.length || 0})</h3>
              <div className="divide-y divide-[#f4f0eb] border border-[#ece6df] rounded-2xl overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1c1817] block">{item.productName}</span>
                      <span className="text-[11px] text-[#7e746c]">
                        المقاس: {item.size || "M"} · اللون: {item.color || "Default"} · الكمية: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-[#1c1817]">
                      {(item.lineTotal || (item.unitPrice * item.quantity)).toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#faf8f5] rounded-2xl p-4 border border-[#ece6df] space-y-2 text-xs">
              <div className="flex justify-between text-[#554e4a]">
                <span>المجموع الفرعي:</span>
                <span>{selectedOrder.subtotal?.toLocaleString()} ج.م</span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className="flex justify-between text-[#d4775c] font-semibold">
                  <span>الخصم المطبق ({selectedOrder.couponCode}):</span>
                  <span>-{selectedOrder.discountAmount?.toLocaleString()} ج.م</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[#554e4a]">
                <span>الشحن والتوصيل:</span>
                <span>{selectedOrder.shippingAmount ? `${selectedOrder.shippingAmount} ج.م` : "شحن مجاني"}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1c1817] pt-2 border-t border-[#e4ded6]">
                <span>المبلغ الإجمالي:</span>
                <span className="text-[#8a5d3b]">{selectedOrder.total?.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Receipt Preview */}
            {selectedOrder.receiptUrl && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#1c1817]">صورة إيصال التحويل البنكي / المحفظة</h4>
                <div className="rounded-2xl border border-[#ece6df] overflow-hidden bg-black/5 p-2 text-center">
                  <a href={selectedOrder.receiptUrl} target="_blank" rel="noreferrer" title="اضغطي لفتح الصورة بالحجم الكامل">
                    <img
                      src={selectedOrder.receiptUrl}
                      alt="Receipt"
                      className="max-h-72 mx-auto rounded-xl object-contain hover:opacity-90 transition"
                    />
                  </a>
                  <span className="text-[10px] text-[#7e746c] mt-1 block">اضغطي على الصورة لعرضها بالحجم الكامل</span>
                </div>
              </div>
            )}

            {/* Status Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f4f0eb]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#554e4a]">تأكيد الدفع:</span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.id, { paymentStatus: e.target.value as any })
                  }
                  className="text-xs bg-[#faf8f5] border border-[#e4ded6] rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="pending">معلق (Pending)</option>
                  <option value="confirmed">مؤكد ومقبول (Confirmed)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#554e4a]">حالة التجهيز والشحن:</span>
                <select
                  value={selectedOrder.fulfillmentStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.id, { fulfillmentStatus: e.target.value as any })
                  }
                  className="text-xs bg-[#faf8f5] border border-[#e4ded6] rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="new">جديد</option>
                  <option value="processing">قيد التجهيز</option>
                  <option value="shipping">قيد الشحن والتوصيل</option>
                  <option value="delivered">تم التوصيل للعميل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
