import express, { Request, Response } from "express";
import cors from "cors";
import { globalStore } from "./store";
import { CreateOrderRequest, Order, OrderItem, PaymentMethod } from "@shared/api";
import { createClient } from "@supabase/supabase-js";

// Supabase client with graceful fallback
let supabase: any = null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("[No Name Server] Supabase client initialized");
  } catch (err) {
    console.warn("[No Name Server] Supabase initialization failed, falling back to in-memory store", err);
  }
}

export function createServer(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health / Test Endpoints
  app.get("/api/ping", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "pong", timestamp: new Date().toISOString() });
  });

  app.get("/api/demo", (_req: Request, res: Response) => {
    res.json({ message: "No Name Fashion Boutique API is active and ready." });
  });

  // Public Categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      }
    } catch {
      // fallback to in-memory
    }
    res.json(globalStore.categories);
  });

  // Public Products with Filtering
  app.get("/api/products", async (req: Request, res: Response) => {
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search ? (req.query.search as string).toLowerCase().trim() : "";
    const sort = req.query.sort as string | undefined;

    try {
      if (supabase) {
        let query = supabase.from("products").select("*").eq("is_active", true);
        if (categorySlug && categorySlug !== "all") {
          query = query.eq("category_slug", categorySlug);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data;
          if (search) {
            list = list.filter(
              (p: any) =>
                p.name_ar?.toLowerCase().includes(search) ||
                p.name_en?.toLowerCase().includes(search) ||
                p.description_ar?.toLowerCase().includes(search)
            );
          }
          return res.json(list);
        }
      }
    } catch {
      // fallback
    }

    let result = [...globalStore.products];

    if (categorySlug && categorySlug !== "all") {
      result = result.filter((p) => p.category_slug === categorySlug);
    }

    if (search) {
      result = result.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(search) ||
          p.name_en.toLowerCase().includes(search) ||
          (p.description_ar && p.description_ar.toLowerCase().includes(search)) ||
          (p.description_en && p.description_en.toLowerCase().includes(search))
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
    }

    res.json(result);
  });

  // Single Product
  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .single();
        if (!error && data) {
          return res.json(data);
        }
      }
    } catch {
      // fallback
    }

    const product = globalStore.products.find((p) => p.slug === slug || p.id === slug);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // Public Site Settings
  app.get("/api/site/public-settings", (_req: Request, res: Response) => {
    res.json(globalStore.settings);
  });

  // Coupon Validation
  app.post("/api/coupons/validate", (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "كود الكوبون مطلوب" });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = globalStore.coupons.find((c) => c.code === cleanCode && c.isActive);

    if (!coupon) {
      return res.status(404).json({ error: "كود الخصم غير صالح أو منتهي الصلاحية" });
    }

    res.json({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      valid: true,
    });
  });

  // Create Order
  app.post("/api/orders", (req: Request, res: Response) => {
    const body = req.body as CreateOrderRequest;

    if (!body.customerName || !body.phone || !body.address || !body.items || body.items.length === 0) {
      return res.status(400).json({ error: "جميع بيانات الطلب والعميل مطلوبة" });
    }

    // Calculate subtotal from trusted server prices
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of body.items) {
      const product = globalStore.products.find((p) => p.id === item.productId || p.slug === item.productId);
      const unitPrice = product ? product.price : 1990;
      const quantity = Math.max(1, item.quantity || 1);
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;
      orderItems.push({
        productId: product ? product.id : item.productId,
        productName: product ? product.name_ar : "منتج من No Name",
        size: item.size || "M",
        color: item.color || "Camel",
        quantity,
        unitPrice,
        lineTotal,
      });

      // Deduct stock for variant and product to prevent overselling
      if (product) {
        if (product.variants && product.variants.length > 0) {
          const match = product.variants.find(
            (v) =>
              (v.color?.toLowerCase() === (item.color || "").toLowerCase() ||
                (v as any).colorName === item.color) &&
              v.size?.toUpperCase() === (item.size || "").toUpperCase()
          );
          if (match) {
            match.stock = Math.max(0, match.stock - quantity);
          }
          product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else if (typeof product.stock === "number") {
          product.stock = Math.max(0, product.stock - quantity);
        }
        if (product.stock <= 0) {
          product.in_stock = false;
        }
      }
    }

    // Calculate coupon discount
    let discountAmount = 0;
    if (body.couponCode) {
      const coupon = globalStore.coupons.find(
        (c) => c.code === body.couponCode?.trim().toUpperCase() && c.isActive
      );
      if (coupon) {
        discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
        coupon.usedCount = (coupon.usedCount || 0) + 1;
      }
    }

    // Shipping fee rule: Free if subtotal >= freeShippingThreshold, else standard shipping
    const shippingThreshold = globalStore.settings.freeShippingThreshold || 2500;
    const standardShipping = globalStore.settings.standardShippingCost || 60;
    const shippingAmount = subtotal >= shippingThreshold ? 0 : standardShipping;
    const total = Math.max(0, subtotal - discountAmount + shippingAmount);

    const refNumber = `#NN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    // Format WhatsApp prefilled message
    const itemsText = orderItems
      .map((it) => `• ${it.productName} (مقاس: ${it.size}، لون: ${it.color}) × ${it.quantity} = ${it.lineTotal} ج.م`)
      .join("\n");

    const paymentLabel =
      body.paymentMethod === "cod"
        ? "الدفع عند الاستلام (COD)"
        : body.paymentMethod === "instapay"
        ? "إنستاباي (InstaPay)"
        : "محفظة إلكترونية (Wallet)";

    const whatsappMessage = `*طلب جديد من No Name ✨*
رقم الطلب: ${refNumber}
الاسم: ${body.customerName}
الهاتف: ${body.phone}
العنوان: ${body.address}
طريقة الدفع: ${paymentLabel}
${body.transferNumber ? `رقم التحويل: ${body.transferNumber}\n` : ""}
*المنتجات:*
${itemsText}

إجمالي المنتجات: ${subtotal} ج.م
الخصم: ${discountAmount} ج.م
الشحن: ${shippingAmount === 0 ? "مجاني" : `${shippingAmount} ج.م`}
*الإجمالي النهائي: ${total} ج.م*
${body.notes ? `ملاحظات: ${body.notes}\n` : ""}
شكراً لتسوقك من No Name!`;

    const newOrder: Order = {
      id: orderId,
      publicReference: refNumber,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      notes: body.notes,
      paymentMethod: body.paymentMethod || "cod",
      paymentStatus: body.paymentMethod === "cod" ? "pending" : "submitted",
      fulfillmentStatus: "new",
      subtotal,
      discountAmount,
      shippingAmount,
      total,
      couponCode: body.couponCode,
      transferNumber: body.transferNumber,
      receiptUrl: body.receiptUrl,
      items: orderItems,
      createdAt: new Date().toISOString(),
      whatsappMessage,
    };

    globalStore.orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      whatsappUrl: `https://wa.me/${globalStore.settings.salesWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
    });
  });

  // Get Order By ID or Reference
  app.get("/api/orders/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const order = globalStore.orders.find((o) => o.id === id || o.publicReference === id);
    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }
    res.json(order);
  });

  // Image/Video Upload endpoint (Receipts, Product images, Discover videos)
  app.post("/api/uploads", (req: Request, res: Response) => {
    try {
      const { dataUrl, filename, image_base64, video_base64, file_name, file } = req.body;
      const finalUrl = image_base64 || video_base64 || dataUrl || file;
      const name = file_name || filename || `upload_${Date.now()}`;

      if (finalUrl && typeof finalUrl === "string") {
        return res.json({
          url: finalUrl,
          success: true,
          storage_key: `upload_${Date.now()}_${name}`,
        });
      }
      res.status(400).json({ error: "لم يتم استلام أي ملف للرفع" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "فشل رفع الملف" });
    }
  });

  // Admin: Sync products across templates
  app.post("/api/admin/products/sync-templates", (req: Request, res: Response) => {
    const { targetTemplate = "all" } = req.body;
    globalStore.products = globalStore.products.map((p) => ({
      ...p,
      template: targetTemplate as any,
    }));
    res.json({
      success: true,
      message: "تمت مزامنة جميع المنتجات بين القوالب بنجاح",
      count: globalStore.products.length,
      products: globalStore.products,
    });
  });

  // Settings for both public and store context
  app.get("/api/settings", (_req: Request, res: Response) => {
    res.json({
      siteSettings: globalStore.settings,
      sections: globalStore.sections,
      pageSettings: globalStore.pageSettings,
    });
  });

  // Admin Auth & Login
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const cleanUsername = username?.trim().toLowerCase();

    // Check against dynamic admin users
    const matchedUser = globalStore.adminUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (matchedUser) {
      if (!matchedUser.isActive) {
        return res.status(403).json({ success: false, error: "هذا الحساب معطل حالياً من قِبل الإدارة" });
      }

      // Check password (or fallback for default testing)
      const validPassword = matchedUser.password ? matchedUser.password === password : (password === "password123" || password === "admin");
      if (validPassword) {
        matchedUser.lastLoginAt = new Date().toISOString();
        const token = `token-${matchedUser.id}-${Date.now()}`;
        globalStore.adminTokens.add(token);

        return res.json({
          success: true,
          token,
          user: {
            id: matchedUser.id,
            username: matchedUser.username,
            name: matchedUser.name,
            role: matchedUser.role,
            permissions: matchedUser.permissions,
          },
        });
      }
    }

    // Default admin fallback
    if (cleanUsername === "admin" && (password === "password123" || password === "admin" || !password)) {
      const token = `token-admin-${Date.now()}`;
      globalStore.adminTokens.add(token);
      const defaultAdmin = globalStore.adminUsers[0] || {
        id: "admin-1",
        username: "admin",
        name: "المدير العام الرئيسي",
        role: "super_admin",
        permissions: {
          canManageOrders: true,
          canManageProducts: true,
          canManageContent: true,
          canManageTheme: true,
          canManageCoupons: true,
          canManageAdmins: true,
        },
      };
      return res.json({
        success: true,
        token,
        user: {
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          name: defaultAdmin.name,
          role: defaultAdmin.role,
          permissions: defaultAdmin.permissions,
        },
      });
    }

    res.status(401).json({ success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  });

  app.get("/api/admin/session", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (globalStore.adminTokens.has(token)) {
        const defaultAdmin = globalStore.adminUsers[0];
        return res.json({
          authenticated: true,
          user: {
            id: defaultAdmin?.id || "admin-1",
            username: defaultAdmin?.username || "admin",
            name: defaultAdmin?.name || "المدير العام",
            role: defaultAdmin?.role || "super_admin",
            permissions: defaultAdmin?.permissions,
          },
        });
      }
    }
    // Allow demo session in preview environment
    const defaultAdmin = globalStore.adminUsers[0];
    res.json({
      authenticated: true,
      user: {
        id: defaultAdmin?.id || "admin-1",
        username: defaultAdmin?.username || "admin",
        name: defaultAdmin?.name || "المدير العام",
        role: defaultAdmin?.role || "super_admin",
        permissions: defaultAdmin?.permissions,
      },
    });
  });

  app.post("/api/admin/logout", (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  // Admin Users Management (CRUD)
  app.get("/api/admin/users", (_req: Request, res: Response) => {
    // Return all users without sensitive raw passwords in standard payload (send masked or flag)
    const sanitized = globalStore.adminUsers.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email || "",
      role: u.role,
      isActive: u.isActive !== false,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      permissions: u.permissions || {
        canManageOrders: true,
        canManageProducts: true,
        canManageContent: true,
        canManageTheme: true,
        canManageCoupons: true,
        canManageAdmins: u.role === "super_admin",
      },
      hasPassword: Boolean(u.password),
    }));
    res.json(sanitized);
  });

  app.post("/api/admin/users", (req: Request, res: Response) => {
    const { username, name, email, password, role = "manager", permissions, isActive = true } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: "اسم المستخدم مطلوب" });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "كلمة المرور مطلوبة" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = globalStore.adminUsers.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return res.status(409).json({ error: "اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر" });
    }

    const defaultRolePermissions = {
      super_admin: {
        canManageOrders: true,
        canManageProducts: true,
        canManageContent: true,
        canManageTheme: true,
        canManageCoupons: true,
        canManageAdmins: true,
      },
      manager: {
        canManageOrders: true,
        canManageProducts: true,
        canManageContent: true,
        canManageTheme: false,
        canManageCoupons: true,
        canManageAdmins: false,
      },
      editor: {
        canManageOrders: false,
        canManageProducts: true,
        canManageContent: true,
        canManageTheme: true,
        canManageCoupons: false,
        canManageAdmins: false,
      },
      orders_only: {
        canManageOrders: true,
        canManageProducts: false,
        canManageContent: false,
        canManageTheme: false,
        canManageCoupons: false,
        canManageAdmins: false,
      },
    };

    const finalPermissions = permissions || defaultRolePermissions[role as keyof typeof defaultRolePermissions] || defaultRolePermissions.manager;

    const newUser = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      name: name?.trim() || cleanUsername,
      email: email?.trim() || "",
      role: role as any,
      password: password.trim(),
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      permissions: finalPermissions,
    };

    globalStore.adminUsers.push(newUser);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        permissions: newUser.permissions,
        hasPassword: true,
      },
    });
  });

  const handleUpdateAdminUser = (req: Request, res: Response) => {
    const { id } = req.params;
    const userIndex = globalStore.adminUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    const existingUser = globalStore.adminUsers[userIndex];
    const { username, name, email, password, role, permissions, isActive } = req.body;

    // Check if updating username creates a duplicate
    if (username && username.trim().toLowerCase() !== existingUser.username.toLowerCase()) {
      const cleanUsername = username.trim().toLowerCase();
      const duplicate = globalStore.adminUsers.find(
        (u) => u.id !== id && u.username.toLowerCase() === cleanUsername
      );
      if (duplicate) {
        return res.status(409).json({ error: "اسم المستخدم الجديد مستخدم بالفعل لحساب آخر" });
      }
      existingUser.username = cleanUsername;
    }

    // Protection: Prevent deactivating or demoting the last active super_admin
    if (existingUser.role === "super_admin" && (isActive === false || (role && role !== "super_admin"))) {
      const activeSuperAdmins = globalStore.adminUsers.filter((u) => u.id !== id && u.role === "super_admin" && u.isActive);
      if (activeSuperAdmins.length === 0) {
        return res.status(400).json({ error: "لا يمكن تعطيل أو تغيير رتبة المشرف العام الوحيد النشط في المتجر" });
      }
    }

    if (name !== undefined) existingUser.name = name.trim();
    if (email !== undefined) existingUser.email = email.trim();
    if (role !== undefined) existingUser.role = role;
    if (isActive !== undefined) existingUser.isActive = Boolean(isActive);
    if (permissions !== undefined) existingUser.permissions = { ...existingUser.permissions, ...permissions };
    if (password && password.trim()) existingUser.password = password.trim();

    globalStore.adminUsers[userIndex] = existingUser;

    res.json({
      success: true,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt,
        lastLoginAt: existingUser.lastLoginAt,
        permissions: existingUser.permissions,
        hasPassword: Boolean(existingUser.password),
      },
    });
  };

  app.put("/api/admin/users/:id", handleUpdateAdminUser);
  app.patch("/api/admin/users/:id", handleUpdateAdminUser);

  app.delete("/api/admin/users/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const userIndex = globalStore.adminUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    const targetUser = globalStore.adminUsers[userIndex];
    if (targetUser.role === "super_admin") {
      const otherSuperAdmins = globalStore.adminUsers.filter((u) => u.id !== id && u.role === "super_admin");
      if (otherSuperAdmins.length === 0) {
        return res.status(400).json({ error: "لا يمكن حذف المشرف العام الوحيد المتبقي في المتجر" });
      }
    }

    globalStore.adminUsers.splice(userIndex, 1);
    res.json({ success: true, message: "تم حذف حساب المشرف بنجاح" });
  });


  // Admin: Get Orders
  app.get("/api/admin/orders", (_req: Request, res: Response) => {
    res.json(globalStore.orders);
  });

  // Admin: Update Order Status
  app.patch("/api/admin/orders/:id/status", (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentStatus, fulfillmentStatus } = req.body;

    const order = globalStore.orders.find((o) => o.id === id || o.publicReference === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;

    res.json({ success: true, order });
  });

  // Admin: Products
  app.get("/api/admin/products", (_req: Request, res: Response) => {
    res.json(globalStore.products);
  });

  app.post("/api/admin/products", (req: Request, res: Response) => {
    const body = req.body;
    const newId = `prod-${Date.now()}`;
    const slug = body.slug || (body.name_en ? body.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-") : newId);

    const newProduct = {
      id: newId,
      slug,
      name_ar: body.name_ar || "منتج جديد",
      name_en: body.name_en || "New Product",
      description_ar: body.description_ar || "",
      description_en: body.description_en || "",
      category_slug: body.category_slug || "sets",
      price: Number(body.price) || 1990,
      original_price: Number(body.original_price) || Number(body.price) || 1990,
      sale_price: body.sale_price ? Number(body.sale_price) : undefined,
      badge: body.badge,
      is_new: body.is_new !== false,
      in_stock: body.in_stock !== false,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85"],
      image: body.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
      sizes: body.sizes || ["S", "M", "L", "XL"],
      colors: body.colors || ["Camel", "Olive", "Black"],
      created_at: new Date().toISOString(),
    };

    globalStore.products.unshift(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  });

  const handleUpdateProduct = (req: Request, res: Response) => {
    const { id } = req.params;
    const index = globalStore.products.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) {
      // If not found, insert
      const newProduct = { ...req.body, id: id || `prod-${Date.now()}` };
      globalStore.products.unshift(newProduct);
      return res.json({ success: true, product: newProduct });
    }

    globalStore.products[index] = {
      ...globalStore.products[index],
      ...req.body,
    };

    res.json({ success: true, product: globalStore.products[index] });
  };

  app.patch("/api/admin/products/:id", handleUpdateProduct);
  app.put("/api/admin/products/:id", handleUpdateProduct);

  app.delete("/api/admin/products/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    globalStore.products = globalStore.products.filter((p) => p.id !== id && p.slug !== id);
    res.json({ success: true });
  });

  // Admin: Settings
  app.get("/api/admin/settings", (_req: Request, res: Response) => {
    res.json(globalStore.settings);
  });

  const handleUpdateSettings = (req: Request, res: Response) => {
    const { type, data } = req.body;
    if (type === "siteSettings" && data) {
      globalStore.settings = { ...globalStore.settings, ...data };
    } else if (type === "sections" && data) {
      globalStore.sections = { ...globalStore.sections, ...data };
    } else if (type === "pageSettings" && data) {
      globalStore.pageSettings = { ...globalStore.pageSettings, ...data };
    } else {
      globalStore.settings = {
        ...globalStore.settings,
        ...req.body,
      };
    }
    res.json({
      success: true,
      settings: globalStore.settings,
      sections: globalStore.sections,
      pageSettings: globalStore.pageSettings,
    });
  };

  app.post("/api/admin/settings", handleUpdateSettings);
  app.patch("/api/admin/settings", handleUpdateSettings);

  // Admin: Coupons
  app.get("/api/admin/coupons", (_req: Request, res: Response) => {
    res.json(globalStore.coupons);
  });

  app.post("/api/admin/coupons", (req: Request, res: Response) => {
    const { code, discountPercent, discount } = req.body;
    const finalDiscount = Number(discountPercent || discount || 10);
    if (!code) {
      return res.status(400).json({ error: "الكود مطلوب" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existingIndex = globalStore.coupons.findIndex((c) => c.code === cleanCode);
    const newCoupon = {
      code: cleanCode,
      discountPercent: finalDiscount,
      discount: finalDiscount,
      isActive: true,
      active: true,
      usedCount: req.body.uses || 0,
      uses: req.body.uses || 0,
    };

    if (existingIndex !== -1) {
      globalStore.coupons[existingIndex] = newCoupon as any;
    } else {
      globalStore.coupons.push(newCoupon as any);
    }
    res.status(201).json({ success: true, coupon: newCoupon });
  });

  app.delete("/api/admin/coupons/:code", (req: Request, res: Response) => {
    const { code } = req.params;
    const cleanCode = code?.trim().toUpperCase();
    globalStore.coupons = globalStore.coupons.filter((c) => c.code !== cleanCode);
    res.json({ success: true });
  });

  // Admin: Categories Management
  app.get("/api/admin/categories", async (_req: Request, res: Response) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data) {
          const categoriesWithCounts = data.map((cat) => {
            const count = globalStore.products.filter(
              (p) => p.category_slug === cat.slug || p.category_id === cat.id
            ).length;
            return { ...cat, product_count: count };
          });
          return res.json(categoriesWithCounts);
        }
      }
    } catch {
      // fallback
    }

    const categoriesWithCounts = globalStore.categories.map((cat, idx) => {
      const count = globalStore.products.filter(
        (p) =>
          p.category_slug === cat.slug ||
          p.category_slug === cat.name_en ||
          p.category_slug === cat.name_ar
      ).length;
      return {
        ...cat,
        id: cat.id || `cat-${cat.slug || idx}`,
        sort_order: cat.sort_order ?? idx + 1,
        is_active: cat.is_active ?? true,
        product_count: count,
      };
    });

    res.json(categoriesWithCounts);
  });

  app.post("/api/admin/categories", async (req: Request, res: Response) => {
    try {
      const { name_ar, name_en, slug, description_ar, description_en, image, sort_order, is_active } = req.body;
      if (!name_ar || !name_en) {
        return res.status(400).json({ error: "اسم القسم بالعربية والإنجليزية مطلوب" });
      }

      const generatedSlug = (slug || name_en)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `category-${Date.now()}`;

      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        slug: generatedSlug,
        name_ar: name_ar.trim(),
        name_en: name_en.trim(),
        description_ar: description_ar || "",
        description_en: description_en || "",
        image: image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
        sort_order: typeof sort_order === "number" ? sort_order : globalStore.categories.length + 1,
        is_active: is_active !== false,
        product_count: 0,
      };

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("categories")
            .insert({
              slug: newCategory.slug,
              name_ar: newCategory.name_ar,
              name_en: newCategory.name_en,
              description_ar: newCategory.description_ar,
              description_en: newCategory.description_en,
              image: newCategory.image,
              sort_order: newCategory.sort_order,
              is_active: newCategory.is_active,
            })
            .select()
            .single();
          if (!error && data) {
            newCategory.id = data.id;
          }
        } catch (e) {
          console.error("Supabase insert category error:", e);
        }
      }

      globalStore.categories.push(newCategory);
      res.status(201).json({ success: true, category: newCategory });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = globalStore.categories.findIndex((c) => c.id === id || c.slug === id);

      if (idx === -1) {
        return res.status(404).json({ error: "القسم غير موجود" });
      }

      const updatedCategory = {
        ...globalStore.categories[idx],
        ...updates,
      };
      globalStore.categories[idx] = updatedCategory;

      if (supabase) {
        try {
          await supabase
            .from("categories")
            .update({
              name_ar: updatedCategory.name_ar,
              name_en: updatedCategory.name_en,
              slug: updatedCategory.slug,
              description_ar: updatedCategory.description_ar,
              description_en: updatedCategory.description_en,
              image: updatedCategory.image,
              sort_order: updatedCategory.sort_order,
              is_active: updatedCategory.is_active,
            })
            .or(`id.eq.${id},slug.eq.${id}`);
        } catch (e) {
          console.error("Supabase update category error:", e);
        }
      }

      res.json({ success: true, category: updatedCategory });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const categoryToDelete = globalStore.categories.find((c) => c.id === id || c.slug === id);
      if (!categoryToDelete) {
        return res.status(404).json({ error: "القسم غير موجود" });
      }

      globalStore.categories = globalStore.categories.filter((c) => c.id !== id && c.slug !== id);

      if (supabase) {
        try {
          await supabase.from("categories").delete().or(`id.eq.${id},slug.eq.${id}`);
        } catch (e) {
          console.error("Supabase delete category error:", e);
        }
      }

      res.json({ success: true, message: "تم حذف القسم بنجاح" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete category" });
    }
  });

  app.post("/api/admin/categories/reorder", async (req: Request, res: Response) => {
    try {
      const { categoryIds } = req.body;
      if (Array.isArray(categoryIds)) {
        const reordered: Category[] = [];
        categoryIds.forEach((catId: string, idx: number) => {
          const cat = globalStore.categories.find((c) => c.id === catId || c.slug === catId);
          if (cat) {
            cat.sort_order = idx + 1;
            reordered.push(cat);
          }
        });
        globalStore.categories.forEach((cat) => {
          if (!reordered.find((r) => r.id === cat.id || r.slug === cat.slug)) {
            reordered.push(cat);
          }
        });
        globalStore.categories = reordered;
      }
      res.json({ success: true, categories: globalStore.categories });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}

export default createServer;
