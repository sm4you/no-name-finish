import React, { useState } from "react";
import { Video, UploadCloud, Trash2, Plus, Save, Sparkles, CheckCircle2, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { parseVideoUrl } from "@shared/api";

export interface DiscoverItem {
  id: string;
  title: string;
  titleAr: string;
  image: string;
  video: string;
  link: string;
}

interface DiscoverVideosManagerProps {
  items: DiscoverItem[];
  onChange: (items: DiscoverItem[]) => void;
  onSave: (items: DiscoverItem[]) => void;
  handleFileUpload?: (file: File, callback: (url: string) => void) => void;
}

export function DiscoverVideosManager({
  items,
  onChange,
  onSave,
  handleFileUpload,
}: DiscoverVideosManagerProps) {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const safeItems = items && items.length > 0 ? items : [];

  const handleUpdateItem = (index: number, patch: Partial<DiscoverItem>) => {
    const updated = [...safeItems];
    if (updated[index]) {
      updated[index] = { ...updated[index], ...patch };
      onChange(updated);
    }
  };

  const handleVideoUrlChange = (index: number, newUrl: string) => {
    const parsed = parseVideoUrl(newUrl);
    const current = safeItems[index];
    const patch: Partial<DiscoverItem> = { video: newUrl };

    // Auto-fill thumbnail if current poster is empty or a stock placeholder
    if (parsed.type === "youtube" && parsed.thumbnailUrl) {
      if (!current.image || current.image.includes("unsplash.com")) {
        patch.image = parsed.thumbnailUrl;
      }
    }
    handleUpdateItem(index, patch);
  };

  const handleAddItem = () => {
    const newItem: DiscoverItem = {
      id: "v" + Date.now(),
      title: "New Look",
      titleAr: "إطلالة جديدة",
      image: "https://img.youtube.com/vi/fJgwVW9rKHA/hqdefault.jpg",
      video: "https://youtube.com/shorts/fJgwVW9rKHA?si=M-poypgeahA4pd8f",
      link: "/shop?collection=new",
    };
    onChange([...safeItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (safeItems.length <= 1) {
      if (!window.confirm("هل أنت متأكد من حذف هذا الفيديو؟ يفضل إبقاء فيديو واحد على الأقل.")) {
        return;
      }
    }
    const updated = safeItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="bg-white border border-[#e4ded6] rounded-2xl p-6 space-y-6 shadow-xs" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f2ece4]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8a5d3b]/10 flex items-center justify-center text-[#8a5d3b]">
              <Video className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-serif font-bold text-[#1c1817]">
              إدارة فيديوهات الريلز (Discover your style)
            </h2>
          </div>
          <p className="text-xs text-[#7e746c] mt-1 leading-relaxed max-w-2xl">
            يمكنك هنا وضع روابط فيديوهات <strong>YouTube Shorts</strong> أو روابط فيديوهات عادية، أو رفع مقاطع فيديو مباشرة من جهازك. تظهر هذه المقاطع كبطاقات فيديو تفاعلية في الصفحة الرئيسية وتعمل تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleAddItem}
            className="bg-[#1c1817] hover:bg-[#38312f] text-white text-xs h-9 rounded-xl gap-1.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيديو جديد</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onSave(safeItems)}
            className="bg-[#8a5d3b] hover:bg-[#724a2c] text-white text-xs h-9 rounded-xl gap-1.5 px-5 shadow-xs font-semibold"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كل الفيديوهات</span>
          </Button>
        </div>
      </div>

      {/* Quick Helper Banner */}
      <div className="bg-[#faf8f5] border border-[#e4ded6] rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#8a5d3b] mt-0.5 shrink-0" />
        <div className="text-xs text-[#554e4a] space-y-1">
          <p className="font-semibold text-[#1c1817]">طرق إضافة الفيديوهات المدعومة:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#7e746c]">
            <li><strong>رابط YouTube Shorts:</strong> ضعي الرابط مباشرة مثل <code className="bg-white px-1.5 py-0.5 rounded border border-[#e4ded6] text-[#8a5d3b]" dir="ltr">https://youtube.com/shorts/fJgwVW9rKHA</code> ويتم جلبه وعرضه فوراً مع الغلاف تلقائياً.</li>
            <li><strong>رابط YouTube عادي:</strong> يدعم روابط يوتيوب القياسية ومشاركات <code className="bg-white px-1.5 py-0.5 rounded border border-[#e4ded6]" dir="ltr">youtu.be</code>.</li>
            <li><strong>الرفع المباشر:</strong> يمكنك الضغط على زر "رفع فيديو من الجهاز" لتحميل ملف MP4 أو WebM مباشرة.</li>
          </ul>
        </div>
      </div>

      {/* Videos List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {safeItems.map((item, idx) => {
          const parsed = parseVideoUrl(item.video);
          const isYouTube = parsed.type === "youtube";

          return (
            <div
              key={item.id || idx}
              className="bg-[#fcfbfa] border border-[#e4ded6] rounded-2xl p-5 space-y-4 relative hover:border-[#8a5d3b]/40 transition group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1c1817] text-white text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-[#1c1817]">
                    {item.titleAr || item.title || `فيديو ريلز #${idx + 1}`}
                  </span>
                  {isYouTube ? (
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      يوتيوب شورتس
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                      ملف فيديو مباشر
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  className="text-[#a89f91] hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50"
                  title="حذف هذا الفيديو"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Input Fields & Preview Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Inputs: 7 cols on larger screens */}
                <div className="sm:col-span-7 space-y-3">
                  {/* Titles */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                        العنوان بالعربية
                      </label>
                      <input
                        type="text"
                        value={item.titleAr || ""}
                        onChange={(e) => handleUpdateItem(idx, { titleAr: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white text-xs focus:ring-1 focus:ring-[#8a5d3b]"
                        placeholder="مثال: إطلالة الكتان الأنيقة"
                      />
                    </div>
                    <div>
                      <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                        العنوان بالإنجليزية
                      </label>
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white text-xs focus:ring-1 focus:ring-[#8a5d3b]"
                        placeholder="e.g. Linen Daytime"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Video URL & Upload */}
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                      رابط الفيديو (YouTube Shorts أو MP4)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={item.video || ""}
                        onChange={(e) => handleVideoUrlChange(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px] focus:ring-1 focus:ring-[#8a5d3b]"
                        placeholder="https://youtube.com/shorts/... أو رابط مباشر"
                        dir="ltr"
                      />
                      {handleFileUpload && (
                        <label className="cursor-pointer bg-white border border-[#e4ded6] hover:bg-[#eeece1] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-[#1c1817] shrink-0">
                          <UploadCloud className="w-3.5 h-3.5 text-[#8a5d3b]" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  handleUpdateItem(idx, { video: url });
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Poster Image */}
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                      صورة الغلاف (Poster)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={item.image || ""}
                        onChange={(e) => handleUpdateItem(idx, { image: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px] focus:ring-1 focus:ring-[#8a5d3b]"
                        placeholder="رابط صورة الغلاف أو ارفعيها..."
                        dir="ltr"
                      />
                      {handleFileUpload && (
                        <label className="cursor-pointer bg-white border border-[#e4ded6] hover:bg-[#eeece1] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 text-[#1c1817] shrink-0">
                          <UploadCloud className="w-3.5 h-3.5 text-[#8a5d3b]" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  handleUpdateItem(idx, { image: url });
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Target Button Link */}
                  <div>
                    <label className="block text-[#554e4a] font-medium mb-1 text-[11px]">
                      رابط الشراء (تسوقي الإطلالة)
                    </label>
                    <input
                      type="text"
                      value={item.link || ""}
                      onChange={(e) => handleUpdateItem(idx, { link: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4ded6] bg-white font-mono text-[10px] focus:ring-1 focus:ring-[#8a5d3b]"
                      placeholder="/shop?collection=new أو /shop?category=Dresses"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Live Preview Column: 5 cols */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-[#7e746c] mb-1 font-medium">
                    معاينة الفيديو مباشرة:
                  </span>
                  <div className="relative w-full aspect-[9/16] max-h-[260px] rounded-xl overflow-hidden bg-black border border-stone-300 shadow-xs">
                    {item.video ? (
                      <VideoPlayer
                        url={item.video}
                        poster={item.image}
                        controls={true}
                        autoPlay={false}
                        loop={true}
                        muted={true}
                        showSoundToggle={true}
                        isEnglish={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                        <Video className="w-8 h-8 opacity-40 mb-2" />
                        <span className="text-[11px]">أدخلي رابط فيديو لعرض المعاينة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-3 border-t border-[#f2ece4]">
        <Button
          type="button"
          onClick={() => onSave(safeItems)}
          className="bg-[#1c1817] hover:bg-[#38312f] text-white text-xs h-10 rounded-xl gap-2 px-6 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتطبيق فيديوهات الريلز على المتجر</span>
        </Button>
      </div>
    </div>
  );
}
