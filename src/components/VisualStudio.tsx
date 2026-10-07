import React, { useRef, useEffect, useState } from 'react';
import { PosterDesignConfig, ProductData } from '../types';
import { renderPinterestPoster } from '../utils/canvasPosterRenderer';
import {
  Palette,
  Download,
  Sparkles,
  Scissors,
  Layers,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Loader2,
  Ratio,
  Type,
  Maximize2,
} from 'lucide-react';

interface VisualStudioProps {
  product: ProductData;
  config: PosterDesignConfig;
  onChangeConfig: (newConfig: PosterDesignConfig) => void;
  onGenerateAiBackdrop: (style: string, customPrompt?: string) => Promise<string | void>;
  isGeneratingBackdrop: boolean;
  onSavePin: (posterDataUrl: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({
  product,
  config,
  onChangeConfig,
  onGenerateAiBackdrop,
  isGeneratingBackdrop,
  onSavePin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedAiStyle, setSelectedAiStyle] = useState('minimal_travertine');

  // Re-render poster whenever config or product changes
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderPinterestPoster(canvasRef.current, product, config);
      } catch (err) {
        console.error('Error rendering poster:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [product, config]);

  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pinterest-pin-${config.aspectRatio === '9:16' ? '9x16' : '2x3'}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);

    // Save to user library as well
    onSavePin(dataUrl);
  };

  const handleAiBackdropClick = async (useCustomPrompt = false) => {
    const promptToUse = useCustomPrompt ? config.imageGenerationPrompt : undefined;
    const backdropUrl = await onGenerateAiBackdrop(selectedAiStyle, promptToUse);
    if (backdropUrl) {
      onChangeConfig({
        ...config,
        customBackdropUrl: backdropUrl,
      });
    }
  };

  return (
    <div id="visual-studio" className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-rose-400 border border-neutral-700">
            <Palette className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-white">استودیو پوستر و کاورهای استودیویی پینترست</h2>
            <p className="text-xs text-neutral-400">
              رندرینگ مستقیم با ابعاد استاندارد عمودی ۱۰۸۰×۱۹۲۰ (۹:۱۶) و تایپوگرافی سه‌بعدی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadImage('jpeg')}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>دانلود JPG</span>
          </button>

          <button
            onClick={() => handleDownloadImage('png')}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-950 hover:bg-rose-500 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>دانلود شد!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>دانلود پوستر HD (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Controls on Right, Canvas on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Canvas Preview Viewport (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] rounded-2xl p-2 bg-neutral-900 border border-neutral-800 shadow-2xl">
            {/* Aspect Ratio Switcher on top of preview */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Ratio className="h-3.5 w-3.5 text-rose-400" />
                <span>نسبت تصویر:</span>
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, aspectRatio: '9:16' })}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    config.aspectRatio === '9:16'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ۹:۱۶ (پین استاندارد)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, aspectRatio: '2:3' })}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    config.aspectRatio === '2:3'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ۲:۳ (کلاسیک)
                </button>
              </div>
            </div>

            {/* Poster Canvas Frame */}
            <div
              className={`relative w-full overflow-hidden rounded-xl bg-black border border-neutral-700/80 shadow-2xl ${
                config.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[2/3]'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full object-contain block transition-opacity duration-300"
              />

              {/* Rendering indicator */}
              {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-neutral-900/90 px-3 py-2 text-xs text-white border border-neutral-700">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                    <span>رندر فوتورئال پوستر...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 px-1">
              <span>رزولوشن خروجی: ۱۰۸۰ × ۱۹۲۰ پیکسل</span>
              <span className="font-mono text-emerald-400">۳۰۰ DPI آماده چاپ و انتشار</span>
            </div>
          </div>
        </div>

        {/* Right Column: Studio Design Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-right">
          {/* 1. Template Style Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2.5">
              سبک بصری پوستر (Template Presets):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { id: 'luxury_editorial', name: 'لوکس ادیتوریال', desc: 'تراورتن تیره و سنگین', color: 'from-stone-900 to-black' },
                { id: 'minimal_studio', name: 'مینیمال استودیو', desc: 'خنثی و مدرن', color: 'from-neutral-800 to-neutral-950' },
                { id: 'bold_sale', name: 'پیشنهاد شگفت‌انگیز', desc: 'هایپر کنتراست قرمز/مشکی', color: 'from-rose-950 to-neutral-950' },
                { id: 'organic_lifestyle', name: 'سبک زندگی ارگانیک', desc: 'تم سبز زیتونی و گیاهی', color: 'from-emerald-950 to-neutral-950' },
                { id: 'tech_dark', name: 'تکنولوژی دارک', desc: 'نوآر و نورپردازی نئون', color: 'from-slate-900 to-neutral-950' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      templateStyle: style.id as any,
                      customBackdropUrl: undefined,
                    })
                  }
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    config.templateStyle === style.id && !config.customBackdropUrl
                      ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500/40'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">{style.name}</div>
                  <div className="text-[11px] text-neutral-400">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Background Removal & Isolated Cutout Toggle */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.removeBackground}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      removeBackground: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs font-bold text-white">
                    جداسازی خودکار پس‌زمینه محصول (Background Removal)
                  </span>
                  <Scissors className="h-4 w-4 text-rose-400" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  حذف بک‌گراند سوژه برای قرار دادن مستقیم روی پدیستال ۳بعدی یا استودیو مینیمال
                </p>
              </div>
            </div>
          </div>

          {/* 3. AI Studio Backdrop Generator with Gemini Flash Image */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Gemini Flash Image / Imagen Studio</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  ساخت بک‌گراند استودیویی با هوش مصنوعی
                </span>
                <Layers className="h-4 w-4 text-rose-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
              {[
                { id: 'minimal_travertine', name: 'پدیستال سنگ تراورتن و نور خورشید' },
                { id: 'luxury_dark', name: 'استودیو مشکی آبسیدین با نور لبه‌ای' },
                { id: 'botanical_spa', name: 'اسپا ارگانیک و سایه برگ اوکالیپتوس' },
                { id: 'vibrant_modern', name: 'طاق‌های هندسی مینیمال و شیب مدرن' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedAiStyle(b.id)}
                  className={`p-2 rounded-lg border text-right transition-colors cursor-pointer ${
                    selectedAiStyle === b.id
                      ? 'border-rose-500/80 bg-rose-950/30 text-white font-medium'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {config.imageGenerationPrompt && (
              <div className="mb-3 rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-right text-[11px] text-neutral-400">
                <span className="text-rose-400 font-semibold block mb-0.5">پرامپت استودیویی استخراج‌شده از ظاهر محصول:</span>
                <span className="line-clamp-2 font-mono text-[10px] text-neutral-500" dir="ltr">{config.imageGenerationPrompt}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {config.customBackdropUrl && (
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, customBackdropUrl: undefined })}
                  className="text-xs text-neutral-400 hover:text-rose-300 underline"
                >
                  حذف بک‌گراند فعلی و بازگشت به پیش‌فرض
                </button>
              )}
              <div className="mr-auto flex items-center gap-2">
                {config.imageGenerationPrompt && (
                  <button
                    type="button"
                    onClick={() => handleAiBackdropClick(true)}
                    disabled={isGeneratingBackdrop}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-600/50 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>تولید با پرامپت اختصاصی فرم محصول</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAiBackdropClick(false)}
                  disabled={isGeneratingBackdrop}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGeneratingBackdrop ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ساخت بک‌گراند...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>تولید بک‌گراند استودیو</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 4. Live Text Overlays on Poster */}
          <div className="space-y-3">
            <div className="flex items-center justify-end gap-2 text-xs font-semibold text-neutral-300">
              <span>تایپوگرافی و متن‌های روی کاور پوستر:</span>
              <Type className="h-4 w-4 text-rose-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hook text */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">تیتر اصلی / هوک:</label>
                <input
                  type="text"
                  value={config.hookText}
                  onChange={(e) => onChangeConfig({ ...config, hookText: e.target.value })}
                  placeholder="مثلاً: راز داشتن پوستی شفاف در ۷ روز"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Discount badge text */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">برچسب تخفیف:</label>
                <input
                  type="text"
                  value={config.badgeText}
                  onChange={(e) => onChangeConfig({ ...config, badgeText: e.target.value })}
                  placeholder="مثلاً: ۳۰٪ تخفیف ویژه"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Price text */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">قیمت نمایشی:</label>
                <input
                  type="text"
                  value={config.priceText}
                  onChange={(e) => onChangeConfig({ ...config, priceText: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* CTA button text */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">متن دکمه اکشن (CTA):</label>
                <input
                  type="text"
                  value={config.ctaText}
                  onChange={(e) => onChangeConfig({ ...config, ctaText: e.target.value })}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
