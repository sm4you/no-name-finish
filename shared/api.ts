export interface Category {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
  product_count?: number;
}

export interface ProductVariant {
  id?: string;
  productId?: string;
  size: string;
  color: string;
  colorName?: string;
  sku?: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  category_slug: string;
  category_id?: string | null;
  price: number;
  original_price: number;
  sale_price?: number;
  badge?: string;
  is_new?: boolean;
  in_stock: boolean;
  stock?: number;
  low_stock_threshold?: number;
  images: string[];
  image?: string;
  video?: string;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  template?: "all" | "classic" | "modern";
  created_at?: string;
}

export interface CartItem {
  id: string; // composite key: `${product.id}-${size}-${color}`
  productId: string;
  name_ar: string;
  name_en: string;
  price: number;
  original_price?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type PaymentMethod = "cod" | "wallet" | "instapay";
export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected";
export type FulfillmentStatus = "new" | "processing" | "completed" | "cancelled";

export interface Order {
  id: string;
  publicReference: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  couponCode?: string;
  transferNumber?: string;
  receiptUrl?: string;
  items: OrderItem[];
  createdAt: string;
  whatsappMessage?: string;
}

export interface ShippingZone {
  nameAr: string;
  nameEn?: string;
  cost: number;
  provinces: string[];
}

export interface SectionSettings {
  title: string;
  description: string;
  image: string;
  video?: string;
}

export interface PageSettings {
  about: {
    titleAr: string;
    titleEn: string;
    introAr: string;
    introEn: string;
    beliefTitleAr: string;
    beliefTitleEn: string;
    bodyAr: string;
    bodyEn: string;
    body2Ar: string;
    body2En: string;
    image1: string;
    image2: string;
  };
  shipping: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
  };
  contact: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    recipientEmail: string;
  };
}

export interface DiscoverVideoItem {
  id: string;
  title: string;
  titleAr?: string;
  video: string;
  image?: string;
  link?: string;
}

export interface SiteSettings {
  storeName: string;
  subTitle: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  shippingCost?: number;
  salesWhatsappNumber: string;
  salesWhatsappUrl: string;
  walletNumber: string;
  instapayNumber: string;
  announcement_ar?: string;
  announcement_en?: string;
  announcement?: string;
  accent?: string;
  heroTitle?: string;
  heroDescription?: string;
  activeTheme?: "classic" | "modern";
  theme?: "classic" | "modern";
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  discoverVideos?: string[];
  discoverItems?: DiscoverVideoItem[];
  shippingZones?: ShippingZone[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
}

export interface CreateOrderRequest {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  transferNumber?: string;
  receiptUrl?: string;
  items: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }[];
}

export type AdminRole = "super_admin" | "manager" | "editor" | "orders_only";

export interface AdminPermissions {
  canManageOrders: boolean;
  canManageProducts: boolean;
  canManageCategories?: boolean;
  canManageContent: boolean;
  canManageTheme: boolean;
  canManageCoupons: boolean;
  canManageAdmins: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: AdminRole;
  password?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  permissions: AdminPermissions;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    role: AdminRole;
    permissions: AdminPermissions;
  };
  error?: string;
}

export interface DemoResponse {
  message: string;
}

export function normalizeCategorySlug(raw?: string | null): string {
  if (!raw || raw === "all" || raw === "الكل") return "all";
  let str = "";
  try {
    str = decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    str = (raw || "").trim().toLowerCase();
  }

  if (
    str === "sets" ||
    str === "set" ||
    str === "أطقم" ||
    str === "الأطقم" ||
    str === "اطقم"
  ) {
    return "sets";
  }
  if (
    str === "blouses-shirts" ||
    str === "blouses / shirts" ||
    str === "blouses/shirts" ||
    str === "blouses_shirts" ||
    str === "blouses" ||
    str === "shirts" ||
    str === "توبس" ||
    str === "بلوزات وقمصان" ||
    str === "بلوزات" ||
    str === "قمصان" ||
    str === "البلوزات والقمصان"
  ) {
    return "blouses-shirts";
  }
  if (
    str === "skirts-pants" ||
    str === "skirts / pants" ||
    str === "skirts/pants" ||
    str === "skirts_pants" ||
    str === "skirts" ||
    str === "pants" ||
    str === "بنطال" ||
    str === "بناطيل" ||
    str === "تنانير" ||
    str === "تنانير وبناطيل" ||
    str === "التنانير والبناطيل"
  ) {
    return "skirts-pants";
  }
  if (
    str === "denims" ||
    str === "denim" ||
    str === "جينز" ||
    str === "الجينز" ||
    str === "جينز ودنيم" ||
    str === "الجينز والدنيم"
  ) {
    return "denims";
  }
  if (
    str === "dresses" ||
    str === "dress" ||
    str === "فساتين" ||
    str === "الفساتين" ||
    str === "فستان"
  ) {
    return "dresses";
  }
  if (
    str === "jackets" ||
    str === "jacket" ||
    str === "جاكيتات" ||
    str === "الجاكيتات" ||
    str === "جاكيت"
  ) {
    return "jackets";
  }
  if (
    str === "new" ||
    str === "new-collection" ||
    str === "new collection" ||
    str === "new_collection" ||
    str === "arrivals" ||
    str === "وصل حديثاً" ||
    str === "جديد"
  ) {
    return "new-collection";
  }

  return str.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

