import React, { useState } from "react";
import { MessageCircle, Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { StoreLayout, useStore, getSalesWhatsAppUrl } from "@/components/store/StoreLayout";

export default function Contact() {
  const { pageSettings, siteSettings, language } = useStore();
  const isEnglish = language === "en";
  const contact = pageSettings.contact;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <StoreLayout>
      <div className="bg-[#faf8f5] py-16 px-5 lg:px-8">
        <div className="mx-auto max-w-[800px] space-y-10">
          <div className="text-center">
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#8a5d3b] font-bold">
              {isEnglish ? "Get in Touch" : "يسعدنا تواصلكِ"}
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1c1817] mt-2">
              {isEnglish ? contact.titleEn || "Contact Us" : contact.titleAr || "تواصلي معنا"}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-[#7e746c] max-w-md mx-auto">
              {isEnglish ? contact.contentEn : contact.contentAr}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={getSalesWhatsAppUrl(siteSettings)}
              target="_blank"
              rel="noreferrer"
              className="bg-white p-5 rounded-2xl border border-[#ece6df] flex items-center gap-4 hover:border-[#25d366] transition shadow-xs group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25d366]/10 text-[#25d366] flex items-center justify-center shrink-0 group-hover:bg-[#25d366] group-hover:text-white transition">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-sm text-[#1c1817]">واتساب خدمة العملاء</span>
                <span className="text-xs text-[#7e746c] font-mono">
                  {siteSettings.salesWhatsappNumber || "01068568250"}
                </span>
                <span className="block text-[11px] text-[#25d366] mt-0.5 font-medium">رد فوري خلال دقائق ←</span>
              </div>
            </a>

            <div className="bg-white p-5 rounded-2xl border border-[#ece6df] flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#8a5d3b]/10 text-[#8a5d3b] flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-bold text-sm text-[#1c1817]">البريد الإلكتروني</span>
                <span className="text-xs text-[#7e746c] font-mono">
                  {contact.recipientEmail || "support@noname-boutique.com"}
                </span>
                <span className="block text-[11px] text-[#7e746c] mt-0.5">للتعاون والشكاوى والاستفسارات</span>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece6df] shadow-xs">
            <h2 className="font-bold text-base text-[#1c1817] mb-4">
              {isEnglish ? "Send us a direct message" : "أرسلي لنا رسالة وسنقوم بالرد عليكِ"}
            </h2>

            {sent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900">
                  {isEnglish ? "Thank you! Your message has been received." : "شكراً لكِ! تم استلام رسالتكِ بنجاح."}
                </h3>
                <p className="text-xs text-emerald-700">
                  {isEnglish ? "We will reach out to you via WhatsApp or call shortly." : "سيتواصل معكِ فريق الدعم عبر الواتساب أو الهاتف قريباً."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#554e4a] mb-1.5">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: ياسمين أحمد"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none focus:border-[#8a5d3b]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1.5">رقم الهاتف / الواتساب *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none focus:border-[#8a5d3b] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#554e4a] mb-1.5">الرسالة أو الاستفسار *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتبي استفساركِ هنا بخصوص المقاسات، الشحن، أو الطلب الخاص..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4ded6] bg-[#faf8f5] focus:outline-none focus:border-[#8a5d3b]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1c1817] hover:bg-[#38312e] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEnglish ? "Send Message" : "إرسال الرسالة"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
