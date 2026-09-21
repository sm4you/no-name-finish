import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Facebook,
  Instagram,
  Menu,
  MessageCircle,
  Music2,
  Search,
  ShoppingBag,
  X,
  Youtube,
  Sparkles,
  Truck,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";
import type { SectionSettings, PageSettings, SiteSettings as ApiSiteSettings } from "@shared/api";
import { useCart } from "@/context/CartContext";

export const defaultStoreProducts = [
  { id: "set-01", name: "طقم كتان بلون الجمل", price: "2,490 ج.م", numericPrice: 2490, category: "أطقم", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "set-02", name: "طقم يومي بلون رمادي", price: "2,190 ج.م", numericPrice: 2190, category: "أطقم", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "set-03", name: "طقم واسع بلون الزيتي", price: "2,350 ج.م", numericPrice: 2350, category: "أطقم", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "set-04", name: "طقم السفر المريح", price: "1,990 ج.م", numericPrice: 1990, category: "أطقم", image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "set-05", name: "طقم كريمي ناعم", price: "2,250 ج.م", numericPrice: 2250, category: "أطقم", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "set-06", name: "طقم كتان صيفي", price: "2,590 ج.م", numericPrice: 2590, category: "أطقم", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "linen-shirt", name: "قميص Linen الناعم", price: "990 ج.م", numericPrice: 990, category: "توبس", image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "top-02", name: "توب أسود مضلع", price: "790 ج.م", numericPrice: 790, category: "توبس", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "top-03", name: "قميص أبيض واسع", price: "1,150 ج.م", numericPrice: 1150, category: "توبس", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "top-04", name: "بلوزة بأزرار أمامية", price: "1,050 ج.م", numericPrice: 1050, category: "توبس", image: "https://images.unsplash.com/photo-1564257577054-8e7c5f8e8e8a?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "top-05", name: "توب كتان بلون الحجر", price: "890 ج.م", numericPrice: 890, category: "توبس", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "top-06", name: "قميص أزرق مطبع", price: "1,650 ج.م", numericPrice: 1650, category: "توبس", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "wide-leg-pants", name: "بنطلون الـ Wide Leg", price: "1,290 ج.م", numericPrice: 1290, category: "بنطال", image: "https://images.unsplash.com/photo-1506629905607-d9b1c7d8b7d9?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "pants-02", name: "بنطلون كتان مستقيم", price: "1,390 ج.م", numericPrice: 1390, category: "بنطال", image: "https://images.unsplash.com/photo-1506629905607-d9b1c7d8b7d9?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "pants-03", name: "بنطلون أسود كلاسيك", price: "1,250 ج.م", numericPrice: 1250, category: "بنطال", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "pants-04", name: "بنطلون واسع بلون رملي", price: "1,350 ج.م", numericPrice: 1350, category: "بنطال", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "pants-05", name: "بنطلون جيرسي مريح", price: "1,090 ج.م", numericPrice: 1090, category: "بنطال", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "pants-06", name: "بنطلون جينز مستقيم", price: "1,490 ج.م", numericPrice: 1490, category: "بنطال", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "everyday-jacket", name: "جاكيت الـ Everyday", price: "1,890 ج.م", numericPrice: 1890, category: "جاكيتات", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=85", tag: "الأكثر طلباً" },
  { id: "classic-blazer", name: "بليزر الـ Classic", price: "2,150 ج.م", numericPrice: 2150, category: "جاكيتات", image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "jacket-03", name: "جاكيت دنيم واسع", price: "1,750 ج.م", numericPrice: 1750, category: "جاكيتات", image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "jacket-04", name: "جاكيت كتان خفيف", price: "1,690 ج.م", numericPrice: 1690, category: "جاكيتات", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "jacket-05", name: "كارديجان طويل", price: "1,590 ج.م", numericPrice: 1590, category: "جاكيتات", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "jacket-06", name: "بليزر بلون العاج", price: "2,290 ج.م", numericPrice: 2290, category: "جاكيتات", image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "denim-01", name: "جينز مستقيم أزرق", price: "1,490 ج.م", numericPrice: 1490, category: "جينز", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "denim-02", name: "جينز واسع فاتح", price: "1,550 ج.م", numericPrice: 1550, category: "جينز", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "denim-03", name: "جاكيت جينز كلاسيك", price: "1,750 ج.م", numericPrice: 1750, category: "جينز", image: "https://images.unsplash.com/photo-1523205565295-f8e0c1b7d3a2?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "denim-04", name: "جينز داكن مستقيم", price: "1,590 ج.م", numericPrice: 1590, category: "جينز", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "denim-05", name: "تنورة جينز طويلة", price: "1,290 ج.م", numericPrice: 1290, category: "جينز", image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "denim-06", name: "قميص جينز خفيف", price: "1,350 ج.م", numericPrice: 1350, category: "جينز", image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "dress-01", name: "فستان Siena الحريري", price: "2,450 ج.م", numericPrice: 2450, category: "فساتين", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=85", tag: "جديد" },
  { id: "dress-02", name: "فستان Laila اليومي", price: "1,790 ج.م", numericPrice: 1790, category: "فساتين", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "dress-03", name: "فستان كتان طويل", price: "1,990 ج.م", numericPrice: 1990, category: "فساتين", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "dress-04", name: "فستان صيفي واسع", price: "1,650 ج.م", numericPrice: 1650, category: "فساتين", image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "dress-05", name: "فستان أسود بسيط", price: "1,850 ج.م", numericPrice: 1850, category: "فساتين", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=85", tag: "" },
  { id: "dress-06", name: "فستان كريمي ناعم", price: "2,090 ج.م", numericPrice: 2090, category: "فساتين", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=85", tag: "" },
];

export const englishProductNames: Record<string, string> = {
  "set-01": "Camel Linen Set",
  "set-02": "Grey Everyday Set",
  "set-03": "Olive Relaxed Set",
  "set-04": "Comfort Travel Set",
  "set-05": "Soft Cream Set",
  "set-06": "Summer Linen Set",
  "linen-shirt": "Soft Linen Shirt",
  "top-02": "Ribbed Black Top",
  "top-03": "Relaxed White Shirt",
  "top-04": "Front Button Blouse",
  "top-05": "Stone Linen Top",
  "top-06": "Blue Printed Shirt",
  "wide-leg-pants": "Wide Leg Pants",
  "pants-02": "Straight Linen Pants",
  "pants-03": "Classic Black Pants",
  "pants-04": "Wide Sand Pants",
  "pants-05": "Comfort Jersey Pants",
  "pants-06": "Straight Leg Jeans",
  "everyday-jacket": "Everyday Jacket",
  "classic-blazer": "Classic Blazer",
  "jacket-03": "Oversized Denim Jacket",
  "jacket-04": "Light Linen Jacket",
  "jacket-05": "Long Cardigan",
  "jacket-06": "Ivory Blazer",
  "denim-01": "Straight Blue Jeans",
  "denim-02": "Light Wide Jeans",
  "denim-03": "Classic Denim Jacket",
  "denim-04": "Dark Straight Jeans",
  "denim-05": "Long Denim Skirt",
  "denim-06": "Light Denim Shirt",
  "dress-01": "Siena Silk Dress",
  "dress-02": "Laila Day Dress",
  "dress-03": "Long Linen Dress",
  "dress-04": "Relaxed Summer Dress",
  "dress-05": "Simple Black Dress",
  "dress-06": "Soft Cream Dress",
};

export const englishCategories: Record<string, string> = {
  "أطقم": "Sets",
  "توبس": "Blouses / shirts",
  "بنطال": "Skirts / pants",
  "جينز": "Denims",
  "جاكيتات": "Jackets",
  "فساتين": "Dresses",
  Sets: "Sets",
  "Blouses / shirts": "Blouses / shirts",
  "Skirts / pants": "Skirts / pants",
  Denims: "Denims",
  Dresses: "Dresses",
  Jackets: "Jackets",
};

export type StoreProduct = {
  id: string;
  name: string;
  nameEn?: string;
  price: string;
  numericPrice: number;
  originalPrice?: number;
  salePrice?: number;
  category: string;
  image: string;
  tag?: string;
  badge?: string;
  stock?: number;
  lowStockThreshold?: number;
  colors?: string[];
  sizes?: string[];
  variants?: Array<{ id?: string; size: string; color: string; colorName?: string; sku?: string; stock: number }>;
  video?: string;
  images?: string[];
  template?: "all" | "classic" | "modern";
  description?: string;
  descriptionEn?: string;
};

export type CartItem = { product: StoreProduct; quantity: number };
export type Coupon = { code: string; discount: number; uses: number; active: boolean };
export type PaymentMethod = "cod" | "wallet" | "instapay";
export type StoreOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  originalUnitPrice?: number;
  discountAmount?: number;
  size?: string;
  color?: string;
};
export type StoreOrder = {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  couponCode?: string;
  status: "جديد" | "قيد التجهيز" | "مكتمل" | "ملغي";
  items: number;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  transferNumber?: string;
  receipt?: string;
  orderItems?: StoreOrderItem[];
};
export type Language = "ar" | "en";
export type Theme = "classic" | "modern";

export const normalizeCategory = (category: string) => englishCategories[category] || category;
export const getProductName = (product: StoreProduct, language: Language) =>
  language === "en" ? product.nameEn || englishProductNames[product.id] || product.name : product.name;
export const getCategoryName = (category: string, language: Language) => normalizeCategory(category);
export const getProductBadge = (product: StoreProduct) => product.badge?.trim() || product.tag?.trim() || "";
export const getProductDiscount = (product: StoreProduct) => {
  const orig = product.originalPrice ?? product.numericPrice;
  if (typeof product.salePrice !== "number" || product.salePrice >= orig) return null;
  return Math.round((1 - product.salePrice / orig) * 100);
};
export const getProductUnitPrice = (product: StoreProduct) =>
  product.salePrice && product.salePrice < (product.originalPrice ?? product.numericPrice)
    ? product.salePrice
    : product.numericPrice;
export const formatProductAmount = (amount: number, language: Language) =>
  `${amount.toLocaleString("en-US")} ${language === "en" ? "L.E" : "ج.م"}`;
export const getProductPrice = (product: StoreProduct, language: Language) =>
  formatProductAmount(getProductUnitPrice(product), language);

const productColors: Record<string, string[]> = {
  "أطقم": ["#d8d1c2", "#6f756b", "#222222"],
  "توبس": ["#f4f1e8", "#222222", "#9b9b92"],
  "بنطال": ["#1e2937", "#b3b5b4", "#8b6f58", "#222222"],
  "جاكيتات": ["#222222", "#d2c7b6", "#7d8a76"],
  "جينز": ["#91b6d6", "#45627a", "#1e2937"],
};
export const getProductColors = (product: StoreProduct) =>
  product.colors?.length ? product.colors : productColors[product.category] || ["#222222", "#d8d1c2"];

export const getSalesWhatsAppUrl = (settings: ApiSiteSettings) => {
  const number = settings.salesWhatsappNumber?.replace(/\D/g, "");
  return settings.salesWhatsappUrl?.trim() || (number ? `https://wa.me/${number}` : "https://wa.me/201068568250");
};

type StoreContextValue = {
  cart: number;
  cartItems: CartItem[];
  catalog: StoreProduct[];
  siteSettings: ApiSiteSettings;
  sections: Record<string, SectionSettings>;
  pageSettings: PageSettings;
  coupons: Coupon[];
  appliedCouponCode: string;
  setAppliedCouponCode: (code: string) => void;
  orders: StoreOrder[];
  addToCart: (product: StoreProduct) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: StoreProduct) => void;
  updateProduct: (product: StoreProduct) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: StoreOrder) => void;
  updateSiteSettings: (settings: ApiSiteSettings) => void;
  updateSection: (key: string, section: SectionSettings) => void;
  updatePageSettings: (settings: PageSettings) => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  liked: number[];
  toggleLike: (index: number) => void;
  language: Language;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    return {
      cart: 0,
      cartItems: [],
      catalog: defaultStoreProducts.map((p) => ({ ...p, stock: 12, lowStockThreshold: 3 })),
      siteSettings: {
        storeName: "No Name",
        subTitle: "Modest Wear",
        currency: "EGP",
        freeShippingThreshold: 2500,
        standardShippingCost: 80,
        shippingCost: 80,
        announcement: "Free shipping on orders over 2,500 EGP · Cash on delivery available",
        accent: "#d4775c",
        heroTitle: "New for Summer 2026",
        heroDescription: "Modest styles designed for everyday comfort.",
        salesWhatsappNumber: "201068568250",
        salesWhatsappUrl: "https://wa.me/201068568250",
        socialLinks: {},
        activeTheme: "classic",
        theme: "classic",
      },
      sections: {
        arrivals: { title: "New Collection", description: "New pieces have just arrived.", image: "" },
        categories: { title: "Shop by category", description: "Find the section closest to your style.", image: "" },
        editorial: { title: "Effortless style", description: "Thoughtful designs for every moment.", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90" },
        discover: { title: "Discover your style", description: "Explore the latest looks.", image: "" },
      },
      pageSettings: {
        about: { titleAr: "", titleEn: "", introAr: "", introEn: "", beliefTitleAr: "", beliefTitleEn: "", bodyAr: "", bodyEn: "", body2Ar: "", body2En: "", image1: "", image2: "" },
        shipping: { titleAr: "", titleEn: "", contentAr: "", contentEn: "" },
        contact: { titleAr: "", titleEn: "", contentAr: "", contentEn: "", recipientEmail: "" },
      },
      coupons: [],
      appliedCouponCode: "",
      setAppliedCouponCode: () => {},
      orders: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      addProduct: () => {},
      updateProduct: () => {},
      deleteProduct: () => {},
      addOrder: () => {},
      updateSiteSettings: () => {},
      updateSection: () => {},
      updatePageSettings: () => {},
      addCoupon: () => {},
      deleteCoupon: () => {},
      liked: [],
      toggleLike: () => {},
      language: "en" as Language,
      toggleLanguage: () => {},
      theme: "classic" as Theme,
      setTheme: () => {},
    };
  }
  return context;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<StoreProduct[]>([]);
  const [siteSettings, setSiteSettings] = useState<ApiSiteSettings>({
    storeName: "No Name",
    subTitle: "Modest Wear",
    currency: "EGP",
    freeShippingThreshold: 2500,
    standardShippingCost: 80,
    shippingCost: 80,
    announcement: "Free shipping on orders over 2,500 EGP · Cash on delivery available",
    accent: "#d4775c",
    heroTitle: "New for Summer 2026",
    heroDescription: "Modest styles designed for everyday comfort.",
    salesWhatsappNumber: "201068568250",
    salesWhatsappUrl: "https://wa.me/201068568250",
    socialLinks: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      whatsapp: "https://wa.me/201553003040",
      tiktok: "https://tiktok.com",
    },
    activeTheme: "classic",
    theme: "classic",
    discoverItems: [
      {
        id: "v1",
        title: "Daytime Linen",
        titleAr: "كتان نهاري مريح",
        image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        link: "/shop?category=Sets",
      },
      {
        id: "v2",
        title: "City Walks",
        titleAr: "إطلالات المدينة",
        image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        link: "/shop?category=Dresses",
      },
      {
        id: "v3",
        title: "Evening Ease",
        titleAr: "أناقة المساء",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        link: "/shop?collection=new",
      },
      {
        id: "v4",
        title: "The Relaxed Fit",
        titleAr: "القصة الواسعة",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        link: "/shop?category=Skirts%20%2F%20pants",
      },
    ],
  });

  const defaultSections: Record<string, SectionSettings> = {
    arrivals: { title: "New Collection", description: "New pieces have just arrived.", image: "" },
    categories: { title: "Shop by category", description: "Find the section closest to your style.", image: "" },
    editorial: { title: "Effortless style", description: "Thoughtful designs for every moment.", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90" },
    discover: { title: "Discover your style", description: "Explore the latest looks.", image: "" },
    sets: { title: "Sets", description: "", image: "" },
    tops: { title: "Blouses / shirts", description: "", image: "" },
    pants: { title: "Skirts / pants", description: "", image: "" },
    dresses: { title: "Dresses", description: "", image: "" },
  };

  const [sections, setSections] = useState<Record<string, SectionSettings>>(defaultSections);

  const defaultPageSettings: PageSettings = {
    about: {
      titleAr: "لما تكوني على طبيعتك.",
      titleEn: "When you are yourself.",
      introAr: "بدأت no name من سؤال بسيط: ليه لازم نختار بين إننا نكون مرتاحين وإننا نكون أنيقين؟",
      introEn: "no name began with a simple question: why should we choose between feeling comfortable and looking beautiful?",
      beliefTitleAr: "اللبس الحلو بيبدأ من الإحساس.",
      beliefTitleEn: "Good clothes start with a feeling.",
      bodyAr: "نحن علامة مصرية مستقلة نصمم للمرأة التي تعرف نفسها جيداً. نختار خامات مريحة، قصّات ذكية، وألواناً تعيش أبعد من موسم واحد.",
      bodyEn: "We are an independent Egyptian label designing for women who know themselves well. We choose comfortable fabrics, considered cuts, and colors that live beyond one season.",
      body2Ar: "كل قطعة تُصنع بالتعاون مع حرفيين محليين في القاهرة. لأن التفاصيل الصغيرة، من أول غرزة لآخر زر، هي التي تجعل القطعة خاصة.",
      body2En: "Every piece is made with local artisans in Cairo. The smallest details, from the first stitch to the last button, are what make a piece special.",
      image1: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1100&q=90",
      image2: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=90",
    },
    shipping: {
      titleAr: "الشحن والاستبدال",
      titleEn: "Shipping & returns",
      contentAr: "نوفر شحناً سريعاً داخل مصر مع إمكانية الاستبدال بسهولة. تواصلي معنا لمعرفة التفاصيل.",
      contentEn: "We offer fast shipping across Egypt with easy exchanges. Contact us for full details.",
    },
    contact: {
      titleAr: "تواصلي معنا",
      titleEn: "Contact us",
      contentAr: "يسعدنا الرد على استفساراتك ومساعدتك في اختيار القطعة المناسبة.",
      contentEn: "We would love to answer your questions and help you find the right piece.",
      recipientEmail: "support@noname-boutique.com",
    },
  };

  const [pageSettings, setPageSettings] = useState<PageSettings>(defaultPageSettings);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [liked, setLiked] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("no-name-language") as Language) || "en"
  );
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem("no-name-theme") as Theme) || "classic"
  );

  const isEnglish = language === "en";

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("no-name-theme", newTheme);
    updateSiteSettings({ ...siteSettings, activeTheme: newTheme, theme: newTheme });
  };

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          const mapped: StoreProduct[] = data.map((p: any) => ({
            id: p.id || p.slug,
            name: p.name_ar || p.name,
            nameEn: p.name_en,
            price: `${(p.price || p.numericPrice || 1990).toLocaleString("en-US")} ج.م`,
            numericPrice: p.price || p.numericPrice || 1990,
            originalPrice: p.original_price || p.originalPrice || p.price,
            salePrice: p.sale_price || p.salePrice,
            category: p.category_slug ? (englishCategories[p.category_slug] || p.category_slug) : (p.category || "أطقم"),
            image: p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85",
            images: p.images || [p.image],
            video: p.video,
            badge: p.badge,
            tag: p.badge || p.tag || "",
            stock: p.stock ?? 12,
            lowStockThreshold: p.lowStockThreshold ?? 3,
            colors: p.colors || ["#222222", "#d8d1c2"],
            sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
            description: p.description_ar || p.description,
            descriptionEn: p.description_en || p.descriptionEn,
          }));
          setCatalog(mapped);
        } else {
          setCatalog(defaultStoreProducts.map((p) => ({ ...p, stock: 12, lowStockThreshold: 3 })));
        }
      })
      .catch(() => {
        setCatalog(defaultStoreProducts.map((p) => ({ ...p, stock: 12, lowStockThreshold: 3 })));
      });

    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error);

    fetch("/api/admin/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCoupons(data);
      })
      .catch(console.error);

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.siteSettings) {
          setSiteSettings((prev) => ({ ...prev, ...data.siteSettings }));
          if (data.siteSettings.activeTheme || data.siteSettings.theme) {
            setThemeState(data.siteSettings.activeTheme || data.siteSettings.theme);
          }
        }
        if (data?.sections) setSections((prev) => ({ ...prev, ...data.sections }));
        if (data?.pageSettings) setPageSettings((prev) => ({ ...prev, ...data.pageSettings }));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem("no-name-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isEnglish ? "ltr" : "rtl";
  }, [language, isEnglish]);

  const toggleLanguage = () => setLanguage((current) => (current === "ar" ? "en" : "ar"));

  const addToCart = (product: StoreProduct) =>
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing
        ? current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...current, { product, quantity: 1 }];
    });

  const removeFromCart = (id: string) => setCartItems((current) => current.filter((item) => item.product.id !== id));
  const updateQuantity = (id: string, quantity: number) =>
    setCartItems((current) =>
      quantity < 1
        ? current.filter((item) => item.product.id !== id)
        : current.map((item) => (item.product.id === id ? { ...item, quantity } : item))
    );
  const clearCart = () => {
    setCartItems([]);
    setAppliedCouponCode("");
  };

  const cart = cartItems.reduce((total, item) => total + item.quantity, 0);
  const toggleLike = (index: number) =>
    setLiked((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));

  const addProduct = async (product: StoreProduct) => {
    try {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    } catch {}
    setCatalog((current) => [product, ...current]);
  };

  const updateProduct = async (product: StoreProduct) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    } catch {}
    setCatalog((current) => current.map((item) => (item.id === product.id ? product : item)));
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    } catch {}
    setCatalog((current) => current.filter((item) => item.id !== id));
  };

  const addOrder = async (order: StoreOrder) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          customerName: order.customerName,
          phone: order.phone,
          address: order.address,
          notes: order.notes,
          paymentMethod: order.paymentMethod,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          shippingAmount: order.shippingAmount,
          total: order.total,
          couponCode: order.couponCode,
          transferNumber: order.transferNumber,
          receipt: order.receipt,
          items: order.orderItems?.map((it) => ({
            productId: it.name,
            productName: it.name,
            size: it.size || "M",
            color: it.color || "Default",
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: it.total,
          })),
        }),
      });
    } catch (e) {
      console.error("Order save error:", e);
    }
    setOrders((current) => [order, ...current]);
  };

  const updateSiteSettings = async (settings: ApiSiteSettings) => {
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "siteSettings", data: settings }),
      });
    } catch {}
    setSiteSettings(settings);
  };

  const updateSection = async (key: string, section: SectionSettings) => {
    const next = { ...sections, [key]: section };
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sections", data: next }),
      });
    } catch {}
    setSections(next);
  };

  const updatePageSettings = async (settings: PageSettings) => {
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pageSettings", data: settings }),
      });
    } catch {}
    setPageSettings(settings);
  };

  const addCoupon = async (coupon: Coupon) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coupon),
      });
    } catch {}
    setCoupons((current) => [...current, coupon]);
  };

  const deleteCoupon = async (code: string) => {
    try {
      await fetch(`/api/admin/coupons/${code}`, { method: "DELETE" });
    } catch {}
    setCoupons((current) => current.filter((coupon) => coupon.code !== code));
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartItems,
        catalog,
        siteSettings,
        sections,
        pageSettings,
        coupons,
        appliedCouponCode,
        setAppliedCouponCode,
        orders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateSiteSettings,
        updateSection,
        updatePageSettings,
        addCoupon,
        deleteCoupon,
        liked,
        toggleLike,
        language,
        toggleLanguage,
        theme,
        setTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

function StoreLayoutContent({ children }: { children: ReactNode }) {
  const { siteSettings, language, toggleLanguage, theme, cart } = useStore();
  const { totalCount: cartContextCount } = useCart();
  const effectiveCart = cartContextCount > 0 ? cartContextCount : cart;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isEnglish = language === "en";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const activeSection = (query: string) => {
    if (location.pathname !== "/shop") return false;
    return new URLSearchParams(location.search).toString() === new URLSearchParams(query).toString();
  };

  const nav = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <main dir={isEnglish ? "ltr" : "rtl"} className="min-h-screen overflow-x-clip bg-white text-[#171717] font-sans">
        {/* Top Announcement Bar */}
        {theme === "classic" ? (
          <div className="announcement-bar-container fixed inset-x-0 top-0 z-40 h-[30px] overflow-hidden border-b border-[#1c2822]/10 bg-[#f4f2e9] py-1 text-[8px] tracking-[0.08em] text-[#1c2822]/85 sm:text-[9px] font-medium select-none">
            <div className={`flex items-center gap-10 whitespace-nowrap ${isEnglish ? "animate-ticker-ltr" : "animate-ticker-rtl"}`}>
              {/* First loop of items */}
              <div className="flex items-center gap-10">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4775c]" />
                  <span>{siteSettings.announcement || (isEnglish ? "Free Shipping on Orders Over 2,500 EGP" : "شحن مجاني لجميع الطلبات فوق ٢٥٠٠ جنيه")}</span>
                </span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "Enjoy Up to 50% Off · New Arrivals" : "خصومات حصرية حتى ٥٠٪ على تشكيلة الموسم"}</span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "Try Before You Buy · Cash on Delivery Available" : "معاينة القطع عند الاستلام · الدفع عند الاستلام متاح"}</span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "100% Egyptian Handcrafted Quality" : "صناعة مصرية بأعلى معايير الجودة"}</span>
                <span className="text-black/30">✦</span>
              </div>

              {/* Second duplicate loop for continuous seamless marquee */}
              <div className="flex items-center gap-10">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4775c]" />
                  <span>{siteSettings.announcement || (isEnglish ? "Free Shipping on Orders Over 2,500 EGP" : "شحن مجاني لجميع الطلبات فوق ٢٥٠٠ جنيه")}</span>
                </span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "Enjoy Up to 50% Off · New Arrivals" : "خصومات حصرية حتى ٥٠٪ على تشكيلة الموسم"}</span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "Try Before You Buy · Cash on Delivery Available" : "معاينة القطع عند الاستلام · الدفع عند الاستلام متاح"}</span>
                <span className="text-black/30">✦</span>
                <span>{isEnglish ? "100% Egyptian Handcrafted Quality" : "صناعة مصرية بأعلى معايير الجودة"}</span>
                <span className="text-black/30">✦</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="announcement-bar-container sticky top-0 z-40 bg-[#1c1817] text-[#f4efe9] text-xs py-2 px-4 overflow-hidden border-b border-white/10 select-none">
            <div className={`flex items-center gap-12 whitespace-nowrap ${isEnglish ? "animate-ticker-ltr" : "animate-ticker-rtl"}`}>
              {/* Loop 1 */}
              <div className="flex items-center gap-12">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#e6b980]" />
                  <span>{siteSettings.announcement || (isEnglish ? "Free shipping on orders over 2500 EGP" : "شحن مجاني للطلبات أكثر من 2500 جنيه")}</span>
                </span>
                <span className="text-white/40">✦</span>
                <span>{isEnglish ? "Try before you buy on delivery" : "إمكانية المعاينة والقياس عند الاستلام"}</span>
                <span className="text-white/40">✦</span>
                <span>{isEnglish ? "Instant customer care via WhatsApp" : "خدمة عملاء فورية عبر الواتساب"}</span>
                <span className="text-white/40">✦</span>
              </div>
              {/* Loop 2 */}
              <div className="flex items-center gap-12">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#e6b980]" />
                  <span>{siteSettings.announcement || (isEnglish ? "Free shipping on orders over 2500 EGP" : "شحن مجاني للطلبات أكثر من 2500 جنيه")}</span>
                </span>
                <span className="text-white/40">✦</span>
                <span>{isEnglish ? "Try before you buy on delivery" : "إمكانية المعاينة والقياس عند الاستلام"}</span>
                <span className="text-white/40">✦</span>
                <span>{isEnglish ? "Instant customer care via WhatsApp" : "خدمة عملاء فورية عبر الواتساب"}</span>
                <span className="text-white/40">✦</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        {theme === "classic" ? (
          <header
            className={`z-30 transition-all ${
              isHome
                ? isScrolled
                  ? "fixed inset-x-0 top-[30px] border-b border-black/10 bg-[#eeece1] text-[#171717] shadow-sm"
                  : "fixed inset-x-0 top-[30px] bg-transparent text-white"
                : "sticky top-[30px] border-b border-black/10 bg-[#eeece1] text-[#171717]"
            }`}
          >
            <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
              <button className="lg:hidden p-1" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة">
                <Menu size={22} strokeWidth={1.4} />
              </button>
              <nav className="hidden items-center gap-4 text-[11px] font-medium tracking-[0.08em] lg:flex">
                <Link
                  to="/shop?collection=new"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?collection=new") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  New Collection
                </Link>
                <Link
                  to="/shop?category=Sets"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?category=Sets") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  Sets
                </Link>
                <Link
                  to="/shop?category=Skirts%20%2F%20pants"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?category=Skirts%20%2F%20pants") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  Skirts / pants
                </Link>
                <Link
                  to="/shop?category=Blouses%20%2F%20shirts"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?category=Blouses%20%2F%20shirts") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  Blouses / shirts
                </Link>
                <Link
                  to="/shop?category=Denims"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?category=Denims") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  Denims
                </Link>
                <Link
                  to="/shop?category=Dresses"
                  className={`text-[13px] hover:underline hover:underline-offset-8 ${
                    activeSection("?category=Dresses") ? "font-semibold underline underline-offset-8" : ""
                  }`}
                >
                  Dresses
                </Link>
              </nav>

              <Link to="/" className="store-logo absolute left-1/2 -translate-x-1/2 text-center leading-none" aria-label="الصفحة الرئيسية">
                <div className="font-times text-[22px] sm:text-[24px] font-semibold tracking-[0.12em]">No Name</div>
                <div className="mt-1 text-[7px] tracking-[0.38em] font-sans">MODEST WEAR</div>
              </Link>

              <div className="flex items-center gap-3 text-[10px] tracking-wide">
                <button
                  className="inline-flex border border-current/30 px-2 py-0.5 text-[10px] rounded-sm hover:opacity-80 transition font-medium"
                  onClick={toggleLanguage}
                  aria-label={isEnglish ? "Switch to Arabic" : "Switch to English"}
                >
                  {isEnglish ? "العربية" : "English"}
                </button>
                <button onClick={() => setSearchOpen((open) => !open)} aria-label={isEnglish ? "Search" : "بحث"}>
                  <Search size={18} strokeWidth={1.4} />
                </button>
                <button className="relative" onClick={() => navigate("/cart")} aria-label="حقيبة التسوق">
                  <ShoppingBag size={18} strokeWidth={1.4} />
                  {effectiveCart > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4775c] px-1 text-[9px] text-white font-bold">
                      {effectiveCart}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {searchOpen && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const val = (event.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
                  navigate(`/shop?search=${encodeURIComponent(val)}`);
                  setSearchOpen(false);
                }}
                className="mx-auto flex max-w-[1240px] border-t border-[#1c2822]/10 bg-[#eeece1] px-5 py-4 lg:px-8 text-[#171717]"
              >
                <input
                  name="search"
                  autoFocus
                  placeholder={isEnglish ? "Search for a piece..." : "ابحثي عن قطعة..."}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
                />
                <button className="text-[11px] font-bold">
                  {isEnglish ? "Search" : "بحث"} <ArrowLeft className="mr-2 inline" size={15} />
                </button>
              </form>
            )}

            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-[#1c2822] p-6 text-[#f6f3ee]">
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X size={24} />
                </button>
                <div className="mt-14 flex flex-col gap-5 text-2xl font-serif">
                  <button className="text-right" onClick={() => nav("/shop?collection=new")}>
                    New Collection
                  </button>
                  <button className="text-right" onClick={() => nav("/shop?category=Sets")}>
                    Sets
                  </button>
                  <button className="text-right" onClick={() => nav("/shop?category=Skirts%20%2F%20pants")}>
                    Skirts / pants
                  </button>
                  <button className="text-right" onClick={() => nav("/shop?category=Blouses%20%2F%20shirts")}>
                    Blouses / shirts
                  </button>
                  <button className="text-right" onClick={() => nav("/shop?category=Denims")}>
                    Denims
                  </button>
                  <button className="text-right" onClick={() => nav("/shop?category=Dresses")}>
                    Dresses
                  </button>
                  <button className="text-right text-lg border-t border-white/10 pt-4" onClick={() => nav("/about")}>
                    About
                  </button>
                  <button className="text-right text-lg" onClick={() => nav("/shipping")}>
                    Shipping & Returns
                  </button>
                  <button className="text-right text-lg" onClick={() => nav("/contact")}>
                    Contact Us
                  </button>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="absolute bottom-8 left-6 right-6 border border-[#f6f3ee]/30 py-3 text-center text-sm font-medium"
                >
                  {isEnglish ? "العربية" : "English"}
                </button>
              </div>
            )}
          </header>
        ) : (
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ece6df] transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-[#443e3b] hover:text-[#1c1817] lg:hidden"
                  aria-label="قائمة التصفح"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                  <Link to="/" className="text-[#554e4a] hover:text-[#8a5d3b]">
                    {isEnglish ? "Home" : "الرئيسية"}
                  </Link>
                  <Link to="/shop" className="text-[#554e4a] hover:text-[#8a5d3b]">
                    {isEnglish ? "Shop" : "المتجر"}
                  </Link>
                  <Link to="/shop?collection=new" className="text-[#554e4a] hover:text-[#8a5d3b]">
                    {isEnglish ? "New Drops" : "وصل حديثاً"}
                  </Link>
                  <Link to="/about" className="text-[#554e4a] hover:text-[#8a5d3b]">
                    {isEnglish ? "About" : "عن البراند"}
                  </Link>
                </nav>

                <Link to="/" className="text-center">
                  <span className="font-serif text-2xl font-bold tracking-widest text-[#1c1817]">NO NAME</span>
                  <span className="block text-[8px] tracking-[0.3em] text-[#8a5d3b] uppercase">MODEST WEAR</span>
                </Link>

                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleLanguage}
                    className="text-xs font-semibold px-2 py-1 border border-[#e4ded6] rounded hover:border-[#1c1817]"
                  >
                    {isEnglish ? "عربي" : "EN"}
                  </button>
                  <Link to="/cart" className="relative p-2 text-[#231f1e] hover:text-[#8a5d3b]">
                    <ShoppingBag className="w-5 h-5" />
                    {effectiveCart > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#1c1817] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {effectiveCart}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        {children}

        {/* Footer */}
        {theme === "classic" ? (
          <footer id="journal" className="bg-white px-5 py-16 lg:px-8 border-t border-[#1c2822]/10">
            <div className="mx-auto max-w-[1240px]">
              <div className="grid gap-12 border-b border-[#1c2822]/15 pb-14 md:grid-cols-[1.4fr_1fr_1fr_1.5fr]">
                <div>
                  <Link to="/" className="store-logo font-times text-3xl font-semibold tracking-[0.14em]">
                    No Name
                  </Link>
                  <p className="mt-5 max-w-[220px] text-[12px] leading-6 text-[#1c2822]/60">
                    {isEnglish ? "A piece of you, made in Egypt." : "قطعة منك، مصنوعة في مصر."}
                  </p>
                  <div className="mt-5 flex gap-4">
                    <a href={siteSettings.socialLinks?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" aria-label="Instagram">
                      <Instagram size={16} />
                    </a>
                    <a href={siteSettings.socialLinks?.facebook || "https://facebook.com"} target="_blank" rel="noreferrer" aria-label="Facebook">
                      <Facebook size={16} />
                    </a>
                    <a href={siteSettings.socialLinks?.youtube || "https://youtube.com"} target="_blank" rel="noreferrer" aria-label="YouTube">
                      <Youtube size={16} />
                    </a>
                    <a href={siteSettings.socialLinks?.whatsapp || "https://wa.me/201553003040"} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                      <MessageCircle size={16} />
                    </a>
                    <a href={siteSettings.socialLinks?.tiktok || "https://tiktok.com"} target="_blank" rel="noreferrer" aria-label="TikTok">
                      <Music2 size={16} />
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="mb-5 text-[11px] font-bold uppercase tracking-wider">{isEnglish ? "Shop" : "تسوقي"}</h3>
                  <div className="flex flex-col gap-3 text-[12px] text-[#1c2822]/60">
                    <Link to="/shop?collection=new">{isEnglish ? "New collection" : "وصل حديثاً"}</Link>
                    <Link to="/shop?category=Sets">Sets</Link>
                    <Link to="/shop?category=Blouses%20%2F%20shirts">Blouses / shirts</Link>
                    <Link to="/shop?category=Skirts%20%2F%20pants">Skirts / pants</Link>
                    <Link to="/shop?category=Denims">Denims</Link>
                    <Link to="/shop?category=Dresses">Dresses</Link>
                  </div>
                </div>

                <div>
                  <h3 className="mb-5 text-[11px] font-bold uppercase tracking-wider">{isEnglish ? "Help" : "مساعدة"}</h3>
                  <div className="flex flex-col gap-3 text-[12px] text-[#1c2822]/60">
                    <Link to="/about">{isEnglish ? "About no name" : "عن no name"}</Link>
                    <Link to="/shipping">{isEnglish ? "Shipping & returns" : "الشحن والاستبدال"}</Link>
                    <Link to="/contact">{isEnglish ? "Contact us" : "تواصلي معنا"}</Link>
                    <Link to="/admin/login" className="text-[#1c2822]/40 hover:text-black">
                      {isEnglish ? "Admin Portal" : "لوحة التحكم"}
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="mb-5 text-[11px] font-bold uppercase tracking-wider">{isEnglish ? "Stay in the know" : "خليكي على اطلاع"}</h3>
                  <p className="mb-4 text-[12px] leading-6 text-[#1c2822]/60">
                    {isEnglish ? "Subscribe for first access to every new drop." : "اشتركي عشان تعرفي كل جديد قبل أي حد."}
                  </p>
                  {subscribed ? (
                    <p className="text-[12px] font-bold text-[#d4775c]">{isEnglish ? "You are subscribed. Welcome in." : "تم الاشتراك بنجاح، أهلاً بكِ."}</p>
                  ) : (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (email) setSubscribed(true);
                      }}
                      className="flex border-b border-[#1c2822]"
                    >
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        required
                        placeholder={isEnglish ? "Your email" : "بريدك الإلكتروني"}
                        className="min-w-0 flex-1 bg-transparent py-3 text-[12px] outline-none placeholder:text-[#1c2822]/40"
                      />
                      <button aria-label="اشتراك" className="p-2">
                        <ArrowLeft size={17} />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-3 pt-6 text-[10px] text-[#1c2822]/45 sm:flex-row">
                <span className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1">
                    صنع بحب في القاهرة 2026
                    <Link
                      to="/admin/login"
                      aria-label="Admin dashboard"
                      title="Admin dashboard"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#1c2822]/55 text-[8px] font-medium leading-none text-[#1c2822] transition hover:bg-[#1c2822] hover:text-white"
                    >
                      <span>R</span>
                    </Link>
                  </span>
                  <span>تم التطوير بواسطة فريق Casper.Dev</span>
                </span>
                <span className="text-right sm:text-left">No Name Boutique © {new Date().getFullYear()}</span>
              </div>
            </div>
          </footer>
        ) : (
          <footer className="bg-[#1c1817] text-[#e5ded6] py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12">
              <div className="space-y-4">
                <span className="font-serif text-2xl font-bold tracking-widest text-white">NO NAME</span>
                <p className="text-xs text-[#a99e95] leading-relaxed">
                  {isEnglish ? "An Egyptian modest wear boutique offering considered, timeless essentials." : "براند أزياء محتشمة مصرية تصمم للمرأة العصرية بلمسة من الرقي والبساطة."}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">{isEnglish ? "Shop" : "تسوقي"}</h4>
                <ul className="space-y-2 text-xs text-[#a99e95]">
                  <li><Link to="/shop" className="hover:text-white">{isEnglish ? "All Collections" : "جميع التشكيلات"}</Link></li>
                  <li><Link to="/shop?category=Sets" className="hover:text-white">{isEnglish ? "Sets" : "الأطقم"}</Link></li>
                  <li><Link to="/shop?category=Dresses" className="hover:text-white">{isEnglish ? "Dresses" : "الفساتين"}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">{isEnglish ? "Support" : "الدعم"}</h4>
                <ul className="space-y-2 text-xs text-[#a99e95]">
                  <li><Link to="/shipping" className="hover:text-white">{isEnglish ? "Shipping & Exchanges" : "الشحن والاستبدال"}</Link></li>
                  <li><Link to="/contact" className="hover:text-white">{isEnglish ? "Contact Us" : "تواصل معنا"}</Link></li>
                  <li><Link to="/admin/login" className="hover:text-white">{isEnglish ? "Admin Portal" : "لوحة الإدارة"}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-white uppercase mb-4">{isEnglish ? "Direct WhatsApp" : "طلب سريع عبر واتساب"}</h4>
                <a
                  href={getSalesWhatsAppUrl(siteSettings)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25d366] text-white px-4 py-2.5 rounded text-xs font-semibold hover:opacity-95 transition"
                >
                  <MessageCircle size={15} /> {isEnglish ? "Order on WhatsApp" : "تواصل مع خدمة العملاء"}
                </a>
              </div>
            </div>
            <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-[#7e746c]">
              No Name Modest Wear · All Rights Reserved © {new Date().getFullYear()}
            </div>
          </footer>
        )}
      </main>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  const context = useContext(StoreContext);
  if (!context) {
    return (
      <StoreProvider>
        <StoreLayoutContent>{children}</StoreLayoutContent>
      </StoreProvider>
    );
  }
  return <StoreLayoutContent>{children}</StoreLayoutContent>;
}

export function ProductCard({ product, index }: { product: StoreProduct; index: number }) {
  const { liked, toggleLike, addToCart, cartItems, language } = useStore();
  const added = cartItems.some((item) => item.product.id === product.id);
  const navigate = useNavigate();
  const productName = getProductName(product, language);
  const isEnglish = language === "en";
  const colors = getProductColors(product);
  const sizes = product.sizes === undefined ? ["S", "M", "L", "XL", "XXL"] : product.sizes;
  const discount = getProductDiscount(product);
  const hasDiscount = discount !== null;
  const originalPrice = product.originalPrice ?? product.numericPrice;
  const salePrice = product.salePrice ?? product.numericPrice;
  const badge = hasDiscount ? getProductBadge(product) || `-${discount}%` : getProductBadge(product);

  const primaryImage = (product.images && product.images[0]) || product.image;
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;

  const openProduct = () => navigate(`/product/${product.id}`);

  return (
    <article
      className="group min-w-0 cursor-pointer"
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") openProduct();
      }}
      role="link"
      tabIndex={0}
    >
      <div className="relative aspect-[.82] overflow-hidden rounded-2xl bg-[#f0f0ee]">
        <Link to={`/product/${product.id}`} className="block h-full relative overflow-hidden">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={productName}
            className={`h-full w-full object-cover transition-all duration-700 ${
              secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
            }`}
          />

          {/* Secondary Hover Image with smooth reveal animation */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${productName} - alternate view`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>
        {badge && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold ${
              hasDiscount ? "bg-[#d4775c] text-white" : "bg-white/90 text-black shadow-sm"
            }`}
          >
            {isEnglish ? (badge === "جديد" ? "New" : badge === "الأكثر طلباً" ? "Bestseller" : badge) : badge}
          </span>
        )}
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            toggleLike(index);
          }}
          className="absolute left-3 top-3 text-lg"
          aria-label={isEnglish ? "Add to wishlist" : "إضافة للمفضلة"}
        >
          <span className={liked.includes(index) ? "text-[#d4775c]" : "text-white drop-shadow"}>♥</span>
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            addToCart(product);
          }}
          className={`absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full text-[#171717] transition hover:bg-[#171717] hover:text-white ${
            added ? "bg-black text-white" : "bg-[#e9e3d7]"
          }`}
          aria-label={isEnglish ? "Add to cart" : "إضافة إلى السلة"}
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-[13px] font-medium">
          <Link
            to={`/product/${product.id}`}
            onClick={(event) => event.stopPropagation()}
            className="transition hover:underline"
          >
            {productName}
          </Link>
        </h3>
        <div className="mt-1 text-[12px]">
          {hasDiscount ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-baseline">
              <span className="justify-self-end text-black/40 line-through mx-2">
                {formatProductAmount(originalPrice, language)}
              </span>
              <span className="mx-auto font-semibold">{formatProductAmount(salePrice, language)}</span>
              <span aria-hidden="true" />
            </div>
          ) : (
            <span className="mx-auto block w-fit text-black">{getProductPrice(product, language)}</span>
          )}
        </div>
        <div className="mt-2 flex justify-center gap-1.5" aria-label={isEnglish ? "Available colors" : "الألوان المتاحة"}>
          {colors.map((color) => (
            <span key={color} className="h-3 w-3 rounded-full border border-black/15" style={{ backgroundColor: color }} />
          ))}
        </div>
        {sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1" aria-label="Available sizes">
            {sizes.map((size) => (
              <span key={size} className="inline-flex h-5 min-w-6 items-center justify-center border border-black/15 px-1.5 text-[9px] text-black/55">
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
