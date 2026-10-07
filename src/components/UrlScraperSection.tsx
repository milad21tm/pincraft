import React, { useState } from 'react';
import {
  Link2,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Layers,
  ShoppingBag,
  Zap,
} from 'lucide-react';

interface UrlScraperSectionProps {
  onScrape: (
    url: string,
    presetKey?: string,
    enableThinking?: boolean,
    language?: 'fa' | 'en' | 'both'
  ) => void;
  isLoading: boolean;
  loadingStep: string;
}

export const UrlScraperSection: React.FC<UrlScraperSectionProps> = ({
  onScrape,
  isLoading,
  loadingStep,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'fa' | 'en' | 'both'>('fa');
  const [enableThinking, setEnableThinking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onScrape(inputUrl.trim(), undefined, enableThinking, selectedLanguage);
    }
  };

  const handleSelectPreset = (presetKey: string) => {
    onScrape('', presetKey, enableThinking, selectedLanguage);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-8 md:p-10 shadow-2xl">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-1/4 -z-10 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-3xl text-center">
        {/* Editorial Subtitle */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 mb-3 tracking-wide">
          <Zap className="h-3.5 w-3.5" />
          <span>هوش مصنوعی جامع تولید و اتوماسیون محتوای پینترست</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          تولید خودکار پین‌های ویروسی و پرفروش بر اساس لینک محصول
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          فقط آدرس صفحه محصول را وارد کنید تا هوش مصنوعی کل اطلاعات، گالری HD، کپی‌رایتینگ متادیتای سئو،
          پوستر‌های استودیویی ۹:۱۶ و ویدیوی انیمیشنی را در چند ثانیه بسازد.
        </p>

        {/* Main URL Input Box */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border border-neutral-700 bg-neutral-950/90 p-2 shadow-xl focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
            <div className="flex items-center gap-2 px-3 py-2 text-neutral-500">
              <Link2 className="h-5 w-5 text-neutral-400 shrink-0" />
            </div>

            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="لینک صفحه محصول (آمازون، شاپیفای، دیجی‌کالا، اتسی، زارا یا هر فروشگاه اینترنتی)..."
              dir="ltr"
              disabled={isLoading}
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none disabled:opacity-50 text-left"
            />

            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="mt-2 sm:mt-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-950 transition-all hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال پردازش...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>تحلیل و ساخت پین</span>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </>
              )}
            </button>
          </div>

          {/* AI Strategy & Language Configuration Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-xs text-neutral-300">
            {/* Thinking Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableThinking}
                onChange={(e) => setEnableThinking(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-rose-600 focus:ring-rose-500 focus:ring-offset-neutral-900"
              />
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>حالت تفکر عمیق (Gemini 3.1 Pro Thinking Mode)</span>
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono border border-amber-500/20">
                Thinking Level: High
              </span>
            </label>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">زبان تولید متادیتا:</span>
              <div className="flex items-center gap-1 bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('fa')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedLanguage === 'fa'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  فارسی
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('both')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedLanguage === 'both'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  دوزبانه
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Loading Steps Pipeline Visualizer */}
        {isLoading && (
          <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-950/20 p-4 text-right animate-fade-in">
            <div className="flex items-center gap-3 text-sm font-medium text-rose-300">
              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
              <span>{loadingStep || 'در حال واکشی اطلاعات و پردازش توسط هوش مصنوعی...'}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 border-t border-rose-500/10 pt-2.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> ۱. اسکرپ محتوا و متادیتا
              </span>
              <span className="flex items-center gap-1 text-rose-400 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" /> ۲. آنالیز توسط Gemini 3.8 Flash
              </span>
              <span className="flex items-center gap-1 text-neutral-500">
                <Layers className="h-3.5 w-3.5" /> ۳. نگارش سئو و رندرینگ کاور
              </span>
            </div>
          </div>
        )}

        {/* 1-Click Ready Test Presets */}
        <div className="mt-7 pt-6 border-t border-neutral-800/80">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <span className="text-neutral-500 font-medium ml-1">تست سریع با ۱ کلیک:</span>

            <button
              type="button"
              onClick={() => handleSelectPreset('perfume')}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-neutral-300 hover:border-rose-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <span>💎</span>
              <span>عطر لوکس آمبر (نیش)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('skincare')}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-neutral-300 hover:border-rose-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <span>🌿</span>
              <span>سرم ویتامین C و هیالورونیک</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('coffee')}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-neutral-300 hover:border-rose-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <span>☕</span>
              <span>دریپر قهوه سرامیکی V60</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('headphones')}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-neutral-300 hover:border-rose-500/50 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <span>🎧</span>
              <span>هدفون بی‌سیم استودیویی ANC</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
