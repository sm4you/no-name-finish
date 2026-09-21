-- ================================================================
-- NO NAME BOUTIQUE - SUPABASE DATABASE SCHEMA & INITIAL DATA
-- قم بنسخ هذا الكود بالكامل ولصقه في:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ================================================================

-- 1. تفعيل الامتدادات الضرورية (Extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول الأقسام (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_slug TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC DEFAULT 0,
    sale_price NUMERIC,
    badge TEXT,
    is_new BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    images TEXT[] DEFAULT '{}',
    image TEXT,
    sizes TEXT[] DEFAULT '{"S","M","L","XL"}',
    colors TEXT[] DEFAULT '{"Camel","Olive","Black"}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. جدول متغيرات المنتج (Product Variants - المقاسات والألوان والمخزون)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT,
    stock INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'cod',     -- cod, instapay, wallet
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, submitted, verified, rejected
    fulfillment_status TEXT NOT NULL DEFAULT 'new', -- new, processing, completed, cancelled
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    shipping_amount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    coupon_code TEXT,
    transfer_number TEXT,
    receipt_url TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    whatsapp_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. جدول كوبونات الخصم (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    max_uses INT,
    used_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. جدول إعدادات المتجر (Site Settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. جدول إعدادات الأقسام والسكاشن (Sections Settings)
CREATE TABLE IF NOT EXISTS public.section_settings (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    image TEXT,
    video TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. جدول إعدادات الصفحات الثابتة (Page Settings - About, Shipping, Contact)
CREATE TABLE IF NOT EXISTS public.page_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- إعدادات الأمان (Row Level Security - RLS)
-- ================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة البيانات العامة للمتجر (Read Access)
CREATE POLICY "Public Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Coupons are viewable by everyone" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Public Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Sections are viewable by everyone" ON public.section_settings FOR SELECT USING (true);
CREATE POLICY "Public Pages are viewable by everyone" ON public.page_settings FOR SELECT USING (true);

-- السماح للعملاء بإنشاء طلبات جديدة (Insert Orders)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
-- قراءة الطلب الخاص بالعميل من خلال مرجع الطلب
CREATE POLICY "Users can view orders" ON public.orders FOR SELECT USING (true);

-- السماح الكامل للوحة التحكم والسيرفر (Service Role / All operations)
CREATE POLICY "Service role full access categories" ON public.categories FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access products" ON public.products FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access variants" ON public.product_variants FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access coupons" ON public.coupons FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access section_settings" ON public.section_settings FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service role full access page_settings" ON public.page_settings FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ================================================================
-- مستودع تخزين الصور (Supabase Storage Bucket: product-images)
-- ================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- ================================================================
-- البيانات الأولية للمتجر (Seed Initial Data)
-- ================================================================

-- 1. إدخال الأقسام الرئيسية
INSERT INTO public.categories (slug, name_ar, name_en, sort_order) VALUES
('sets', 'أطقم', 'Sets', 1),
('blouses-shirts', 'توبس', 'Blouses / shirts', 2),
('skirts-pants', 'بنطال', 'Skirts / pants', 3),
('dresses', 'فساتين', 'Dresses', 4),
('denims', 'دينم وجينز', 'Denims', 5)
ON CONFLICT (slug) DO UPDATE SET
name_ar = EXCLUDED.name_ar,
name_en = EXCLUDED.name_en,
sort_order = EXCLUDED.sort_order;

-- 2. إدخال الكوبونات الافتراضية
INSERT INTO public.coupons (code, discount_percent, is_active, used_count) VALUES
('WELCOME10', 10, true, 5),
('NONAME20', 20, true, 12),
('EID15', 15, true, 3)
ON CONFLICT (code) DO NOTHING;

-- 3. إدخال إعدادات المتجر الافتراضية
INSERT INTO public.site_settings (id, data) VALUES (
    'default',
    '{
        "storeName": "No Name",
        "subTitle": "Modest Wear",
        "currency": "EGP",
        "freeShippingThreshold": 2500,
        "standardShippingCost": 80,
        "salesWhatsappNumber": "01068568250",
        "salesWhatsappUrl": "https://wa.me/201068568250",
        "walletNumber": "01068568250",
        "instapayNumber": "noname@instapay",
        "announcement_ar": "شحن مجاني للطلبات فوق ٢٥٠٠ جنيه · متاح الدفع عند الاستلام والمعاينة",
        "announcement_en": "Free shipping on orders over 2,500 EGP · Cash on delivery available",
        "accent": "#d4775c",
        "heroTitle": "New for Summer 2026",
        "heroDescription": "أزياء محتشمة مصممة لراحتكِ اليومية وأناقتكِ الطبيعية.",
        "activeTheme": "classic",
        "theme": "classic"
    }'::jsonb
) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- 4. إدخال إعدادات الأقسام الرئيسية (Sections)
INSERT INTO public.section_settings (id, title, description, image) VALUES
('arrivals', 'وصل حديثاً', 'قطع جديدة وصلت لتوها بتصاميم صيفية مريحة.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1900&q=85'),
('categories', 'تسوقي بالأقسام', 'اختاري القسم الأقرب لأسلوبكِ واحتياجكِ.', ''),
('editorial', 'أناقة عفوية', 'تصاميم مدروسة لتلائم كل لحظة في يومكِ، بأقمشة طبيعية وخياطة راقية.', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90'),
('discover', 'اكتشفي أسلوبكِ', 'شاهدي إطلالاتنا في الحركة والتفاصيل اليومية.', '')
ON CONFLICT (id) DO NOTHING;

-- 5. إدخال إعدادات الصفحات (About, Shipping, Contact)
INSERT INTO public.page_settings (id, data) VALUES (
    'default',
    '{
        "about": {
            "titleAr": "لما تكوني على طبيعتك.",
            "titleEn": "When you are yourself.",
            "introAr": "بدأت no name من سؤال بسيط: ليه لازم نختار بين إننا نكون مرتاحين وإننا نكون أنيقين؟",
            "introEn": "no name began with a simple question: why should we choose between feeling comfortable and looking beautiful?",
            "beliefTitleAr": "اللبس الحلو بيبدأ من الإحساس.",
            "beliefTitleEn": "Good clothes start with a feeling.",
            "bodyAr": "نحن علامة مصرية مستقلة نصمم للمرأة التي تعرف نفسها جيداً. نختار خامات مريحة، قصّات ذكية، وألواناً تعيش أبعد من موسم واحد.",
            "bodyEn": "We are an independent Egyptian label designing for women who know themselves well. We choose comfortable fabrics, considered cuts, and colors that live beyond one season.",
            "body2Ar": "كل قطعة تُصنع بالتعاون مع حرفيين محليين في القاهرة. لأن التفاصيل الصغيرة، من أول غرزة لآخر زر، هي التي تجعل القطعة خاصة.",
            "body2En": "Every piece is made with local artisans in Cairo. The smallest details, from the first stitch to the last button, are what make a piece special.",
            "image1": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1100&q=90",
            "image2": "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=700&q=90"
        },
        "shipping": {
            "titleAr": "الشحن والاستبدال",
            "titleEn": "Shipping & returns",
            "contentAr": "نوفر شحناً سريعاً لجميع محافظات مصر خلال ٢ إلى ٤ أيام عمل، مع إتاحة حق المعاينة وقياس القطع في وجود مندوب الشحن قبل السداد.",
            "contentEn": "We offer fast shipping across Egypt within 2-4 business days, with try-before-pay inspection on delivery."
        },
        "contact": {
            "titleAr": "تواصلي معنا",
            "titleEn": "Contact us",
            "contentAr": "يسعدنا الرد على جميع استفساراتكِ ومساعدتكِ في اختيار المقاس المناسب عبر الواتساب أو البريد الإلكتروني.",
            "contentEn": "We would love to answer your questions and help you find the right size via WhatsApp or email.",
            "recipientEmail": "support@noname-boutique.com"
        }
    }'::jsonb
) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
