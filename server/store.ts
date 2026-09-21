import fs from "fs";
import path from "path";
import { Category, Product, Order, SiteSettings, Coupon, SectionSettings, PageSettings, AdminUser } from "../shared/api";

export interface InMemoryStore {
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: SiteSettings;
  sections: Record<string, SectionSettings>;
  pageSettings: PageSettings;
  adminTokens: Set<string>;
  adminUsers: AdminUser[];
}

export const defaultAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    username: "admin",
    name: "المدير العام الرئيسي",
    email: "admin@noname-store.com",
    role: "super_admin",
    password: "password123",
    isActive: true,
    createdAt: new Date("2026-01-01").toISOString(),
    lastLoginAt: new Date().toISOString(),
    permissions: {
      canManageOrders: true,
      canManageProducts: true,
      canManageContent: true,
      canManageTheme: true,
      canManageCoupons: true,
      canManageAdmins: true,
    },
  },
  {
    id: "admin-2",
    username: "manager",
    name: "مسؤول المنتجات والطلبات",
    email: "manager@noname-store.com",
    role: "manager",
    password: "password123",
    isActive: true,
    createdAt: new Date("2026-02-15").toISOString(),
    permissions: {
      canManageOrders: true,
      canManageProducts: true,
      canManageContent: false,
      canManageTheme: false,
      canManageCoupons: true,
      canManageAdmins: false,
    },
  },
];

const defaultSettings: SiteSettings = {
  storeName: "No Name",
  subTitle: "Modest Wear",
  currency: "EGP",
  freeShippingThreshold: 2500,
  standardShippingCost: 80,
  shippingCost: 80,
  salesWhatsappNumber: "201068568250",
  salesWhatsappUrl: "https://wa.me/201068568250",
  walletNumber: "01068568250",
  instapayNumber: "noname@instapay",
  announcement: "Free shipping on orders over 2,500 EGP · Cash on delivery available",
  announcement_ar: "شحن مجاني للطلبات فوق ٢٥٠٠ جنيه · متاح الدفع عند الاستلام",
  announcement_en: "Free shipping on orders over 2,500 EGP · Cash on delivery available",
  accent: "#d4775c",
  heroTitle: "New for Summer 2026",
  heroDescription: "Modest styles designed for everyday comfort.",
  activeTheme: "classic",
  theme: "classic",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me/201553003040",
    tiktok: "https://tiktok.com",
  },
  discoverVideos: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  ],
  discoverItems: [
    {
      id: "v1",
      title: "Latest Lookbook Reel",
      titleAr: "أحدث إطلالات الفساتين والأطقم",
      image: "https://img.youtube.com/vi/fJgwVW9rKHA/hqdefault.jpg",
      video: "https://youtube.com/shorts/fJgwVW9rKHA?si=M-poypgeahA4pd8f",
      link: "/shop?collection=new",
    },
    {
      id: "v2",
      title: "Flowy Dresses & Movement",
      titleAr: "حركة وأناقة الفساتين",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
      video: "https://assets.mixkit.co/videos/preview/mixkit-woman-turning-while-wearing-a-dress-41870-large.mp4",
      link: "/shop?category=Dresses",
    },
    {
      id: "v3",
      title: "Summer Walk Lookbook",
      titleAr: "إطلالة الصيف العصرية",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      video: "https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-summer-dress-41871-large.mp4",
      link: "/shop?collection=new",
    },
    {
      id: "v4",
      title: "Minimal Chic & Modest Wear",
      titleAr: "أناقة بسيطة ومحتشمة",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
      video: "https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-turtleneck-sweater-posing-for-the-camera-42790-large.mp4",
      link: "/shop?category=Blouses%20%2F%20shirts",
    },
    {
      id: "v5",
      title: "Everyday Modest Elegance",
      titleAr: "أناقة الإطلالات اليومية",
      image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=600&q=80",
      video: "https://assets.mixkit.co/videos/preview/mixkit-a-stylish-woman-in-an-autumn-outfit-posing-in-a-park-42784-large.mp4",
      link: "/shop?category=Skirts%20%2F%20pants",
    },
    {
      id: "v6",
      title: "Studio Editorial Reel",
      titleAr: "جلسة تصوير حصرية",
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
      video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-neon-lights-42290-large.mp4",
      link: "/shop?collection=bestsellers",
    },
  ],
};

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

const defaultCoupons: Coupon[] = [
  { code: "WELCOME10", discountPercent: 10, isActive: true, usedCount: 5 },
  { code: "NONAME20", discountPercent: 20, isActive: true, usedCount: 12 },
  { code: "EID15", discountPercent: 15, isActive: true, usedCount: 3 },
];

export function initializeStore(): InMemoryStore {
  let categories: Category[] = [
    {
      id: "cat-new-collection",
      slug: "new-collection",
      name_ar: "وصل حديثاً",
      name_en: "New Collection",
      description_ar: "أحدث القطع والتصاميم الصيفية الحصرية",
      description_en: "Latest seasonal drops and exclusive designs",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 1,
    },
    {
      id: "cat-sets",
      slug: "sets",
      name_ar: "أطقم",
      name_en: "Sets",
      description_ar: "أطقم متناسقة من الكتان والأقمشة الطبيعية",
      description_en: "Matching linen and natural fiber coordinated sets",
      image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 2,
    },
    {
      id: "cat-skirts-pants",
      slug: "skirts-pants",
      name_ar: "تنانير وبناطيل",
      name_en: "Skirts / pants",
      description_ar: "بناطيل وتنانير بقصات مريحة وواسعة",
      description_en: "Wide-leg trousers and elegant modest skirts",
      image: "https://images.unsplash.com/photo-1506629905607-d9b1c7d8b7d9?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 3,
    },
    {
      id: "cat-blouses-shirts",
      slug: "blouses-shirts",
      name_ar: "بلوزات وقمصان",
      name_en: "Blouses / shirts",
      description_ar: "قمصان وبلوزات ناعمة للاستخدام اليومي والعمل",
      description_en: "Soft shirts and everyday versatile blouses",
      image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 4,
    },
    {
      id: "cat-denims",
      slug: "denims",
      name_ar: "جينز ودنيم",
      name_en: "Denims",
      description_ar: "أزياء جينز عصرية بقصات محتشمة وعملية",
      description_en: "Modern relaxed denim cuts with timeless comfort",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 5,
    },
    {
      id: "cat-dresses",
      slug: "dresses",
      name_ar: "فساتين",
      name_en: "Dresses",
      description_ar: "فساتين طويلة بأقمشة انسيابية راقية",
      description_en: "Flowing modest dresses with artisanal details",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=85",
      is_active: true,
      sort_order: 6,
    },
  ];

  let products: Product[] = [];
  let settings: SiteSettings = { ...defaultSettings };

  try {
    const backupPath = path.resolve(process.cwd(), "store_backup.json");
    if (fs.existsSync(backupPath)) {
      const raw = fs.readFileSync(backupPath, "utf-8");
      const backup = JSON.parse(raw);

      if (Array.isArray(backup.categories) && backup.categories.length > 0) {
        categories = backup.categories.map((c: any, index: number) => ({
          id: `cat-${c.slug || index}`,
          slug: c.slug,
          name_ar: c.name_ar,
          name_en: c.name_en,
          sort_order: index + 1,
        }));
      }

      if (Array.isArray(backup.products) && backup.products.length > 0) {
        const defaultSizes = ["S", "M", "L", "XL"];
        const defaultColors = ["#b29d89", "#1a1a1a", "#d8d1c2", "#4a5d4e"];
        const sampleVideos = [
          "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-42289-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-woman-turning-while-wearing-a-dress-41870-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-summer-dress-41871-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-neon-lights-42290-large.mp4"
        ];

        products = backup.products.map((p: any, index: number) => {
          const slug = p.slug || (p.name_en
            ? p.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            : `product-${index + 1}`);

          const price = Number(p.price) || 1990;
          const originalPrice = Number(p.original_price) || price;
          const images = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85"];

          const prodColors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : defaultColors;
          const prodSizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : defaultSizes;

          const variants = Array.isArray(p.variants) && p.variants.length > 0
            ? p.variants
            : prodColors.flatMap((col: string) =>
                prodSizes.map((sz: string, sIdx: number) => ({
                  id: `var-${slug}-${encodeURIComponent(col)}-${sz}`,
                  productId: `prod-${index + 1}`,
                  color: col,
                  colorName: col.startsWith("#")
                    ? (col === "#1a1a1a" || col === "#000000" ? "أسود" : col === "#b29d89" ? "جملي" : col === "#d8d1c2" ? "بيج" : col === "#4a5d4e" ? "زيتي" : "لون أساسي")
                    : col,
                  size: sz,
                  sku: `NN-${(p.category_slug || "SET").toUpperCase().slice(0, 3)}-${sz}-${sIdx + 1}`,
                  stock: Math.max(0, 4 + ((index * 3 + sIdx * 2) % 9)),
                }))
              );

          const totalStock = typeof p.stock === "number" ? p.stock : variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
          const lowStockThreshold = typeof p.low_stock_threshold === "number" ? p.low_stock_threshold : 3;

          return {
            id: `prod-${index + 1}`,
            slug,
            name_ar: p.name_ar || `منتج ${index + 1}`,
            name_en: p.name_en || `Product ${index + 1}`,
            description_ar: p.description_ar || "قطعة فاخرة مصممة من أجود الخامات لتلائم إطلالتك المحتشمة والعصرية في آن واحد.",
            description_en: p.description_en || "An elegant modest piece crafted with premium fabrics for your everyday effortless style.",
            category_slug: p.category_slug || "sets",
            category_id: `cat-${p.category_slug || "sets"}`,
            price,
            original_price: originalPrice,
            sale_price: price < originalPrice ? price : undefined,
            badge: price < originalPrice ? "تخفيض" : p.is_new ? "جديد" : undefined,
            is_new: Boolean(p.is_new),
            in_stock: totalStock > 0 && p.in_stock !== false,
            stock: totalStock,
            low_stock_threshold: lowStockThreshold,
            images,
            image: images[0],
            video: p.video && typeof p.video === "string" && p.video.trim() !== "" ? p.video : undefined,
            sizes: prodSizes,
            colors: prodColors,
            variants,
            created_at: new Date(Date.now() - index * 86400000).toISOString(),
          };
        });
      }

      if (backup.siteSettings) {
        settings = {
          ...defaultSettings,
          ...backup.siteSettings,
        };
      }
    }
  } catch (err) {
    console.warn("Could not load store_backup.json, using defaults:", err);
  }

  // Add initial sample orders for realistic admin view
  const sampleOrders: Order[] = [
    {
      id: "ord-1",
      publicReference: "#NN-2026-8491",
      customerName: "سارة أحمد",
      phone: "01012345678",
      address: "القاهرة، المعادي، شارع النصر عمارة 14",
      notes: "يرجى الاتصال قبل الوصول بنصف ساعة",
      paymentMethod: "cod",
      paymentStatus: "pending",
      fulfillmentStatus: "processing",
      subtotal: 2490,
      discountAmount: 249,
      shippingAmount: 60,
      total: 2301,
      couponCode: "WELCOME10",
      items: [
        {
          productId: "prod-1",
          productName: "طقم كتان بلون الجمل",
          size: "M",
          color: "Camel",
          quantity: 1,
          unitPrice: 2490,
          lineTotal: 2490,
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "ord-2",
      publicReference: "#NN-2026-7219",
      customerName: "نور الهدى إبراهيم",
      phone: "01198765432",
      address: "الجيزة، الشيخ زايد، بيفرلي هيلز",
      notes: "",
      paymentMethod: "instapay",
      paymentStatus: "verified",
      fulfillmentStatus: "completed",
      subtotal: 4440,
      discountAmount: 0,
      shippingAmount: 0,
      total: 4440,
      transferNumber: "IP-94021849",
      items: [
        {
          productId: "prod-2",
          productName: "طقم يومي بلون رمادي",
          size: "L",
          color: "Grey",
          quantity: 1,
          unitPrice: 2190,
          lineTotal: 2190,
        },
        {
          productId: "prod-5",
          productName: "طقم كريمي ناعم",
          size: "M",
          color: "Cream",
          quantity: 1,
          unitPrice: 2250,
          lineTotal: 2250,
        },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return {
    categories,
    products,
    orders: sampleOrders,
    coupons: [...defaultCoupons],
    settings,
    sections: { ...defaultSections },
    pageSettings: { ...defaultPageSettings },
    adminTokens: new Set(["admin-session-active"]),
    adminUsers: [...defaultAdminUsers],
  };
}

export const globalStore = initializeStore();

export function saveStoreBackup() {
  try {
    const backupPath = path.resolve(process.cwd(), "store_backup.json");
    const data = {
      categories: globalStore.categories,
      products: globalStore.products,
      siteSettings: globalStore.settings,
      sections: globalStore.sections,
      pageSettings: globalStore.pageSettings,
    };
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save store_backup.json:", err);
  }
}
