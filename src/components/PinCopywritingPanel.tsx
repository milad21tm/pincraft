import React, { useState } from 'react';
import { PinMetadata } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  MousePointerClick,
  Accessibility,
  Hash,
  Bookmark,
  Share2,
} from 'lucide-react';

interface PinCopywritingPanelProps {
  metadata: PinMetadata;
  selectedTitle: string;
  onSelectTitle: (title: string) => void;
  selectedDesc: string;
  onSelectDesc: (desc: string) => void;
}

export const PinCopywritingPanel: React.FC<PinCopywritingPanelProps> = ({
  metadata,
  selectedTitle,
  onSelectTitle,
  selectedDesc,
  onSelectDesc,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const copyFullPackage = () => {
    const fullText = `📌 PINTEREST METADATA PACKAGE:
---------------------------------------------
عنوان انتخابی (Title):
${selectedTitle || metadata.titles[0]?.text || ''}

توضیحات پینترست (Description):
${selectedDesc || metadata.descriptions[0]?.text || ''}

دعوت به اقدام (Call To Action):
${metadata.callToAction}

متن جایگزین (Alt Text):
${metadata.altText}

هشتگ‌های ترند پینترست:
${metadata.trendingHashtags.join(' ')}

بردهای پیشنهادی:
${metadata.pinterestBoards.join(' | ')}
---------------------------------------------`;

    copyToClipboard(fullText, 'full_package');
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Full Package Copy Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-rose-400 border border-neutral-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-white">متادیتای سئو و کپی‌رایتینگ پینترست</h2>
            <p className="text-xs text-neutral-400">
              تولید شده توسط Gemini AI بر اساس استانداردهای الگوریتم داخلی سرچ پینترست
            </p>
          </div>
        </div>

        <button
          onClick={copyFullPackage}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950 hover:from-rose-500 hover:to-rose-600 transition-all cursor-pointer"
        >
          {copiedKey === 'full_package' ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>کل پکیج کپی شد!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>کپی مستقیم کل پکیج متادیتا</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Pin Titles (3 models) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-rose-400" />
            <span>۳ مدل عنوان بهینه‌شده پینترست (Pin Titles - انتخاب برای کاور):</span>
          </span>
          <span className="text-[11px] text-neutral-500">کلیک برای انتخاب روی پوستر</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {(!metadata.titles || metadata.titles.length === 0) ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 text-center text-xs text-neutral-400">
              <Sparkles className="h-5 w-5 mx-auto mb-2 text-rose-400 animate-pulse" />
              <span>در حال ارتباط با Gemini API و نگارش عناوین سئو بر اساس مشخصات محصول...</span>
            </div>
          ) : (
            metadata.titles.map((titleObj, idx) => {
            const isSelected = selectedTitle === titleObj.text;
            return (
              <div
                key={idx}
                onClick={() => onSelectTitle(titleObj.text)}
                className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500/30'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(titleObj.text, `title_${idx}`);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="کپی این عنوان"
                  >
                    {copiedKey === `title_${idx}` ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-end gap-2 mb-1.5">
                      <span className="text-[11px] font-medium text-rose-300/80">
                        {titleObj.style}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected ? 'bg-rose-500' : 'bg-neutral-700'
                        }`}
                      />
                    </div>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {titleObj.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* 2. Pin Descriptions (2 models, 300 to 500 chars) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-rose-400" />
            <span>۲ مدل توضیحات حرفه‌ای پینترست (Pin Descriptions - ۳۰۰ تا ۵۰۰ کاراکتر):</span>
          </span>
          <span className="text-[11px] text-neutral-500">حاوی LSI و هشتگ‌های نیچ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metadata.descriptions.map((descObj, idx) => {
            const isSelected = selectedDesc === descObj.text;
            const charCount = descObj.text.length;
            return (
              <div
                key={idx}
                onClick={() => onSelectDesc(descObj.text)}
                className={`group relative rounded-xl border p-4 transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500/30'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(descObj.text, `desc_${idx}`);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="کپی این توضیحات"
                    >
                      {copiedKey === `desc_${idx}` ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <span className="text-xs font-semibold text-rose-300/90 text-right">
                      {descObj.style}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed text-right whitespace-pre-line">
                    {descObj.text}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-mono tabular-nums text-neutral-400">
                    {charCount} کاراکتر (بهینه)
                  </span>
                  <span className={isSelected ? 'text-rose-400 font-medium' : ''}>
                    {isSelected ? '✓ انتخاب شده' : 'کلیک برای انتخاب'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CTA & Alt Text Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Call to Action */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => copyToClipboard(metadata.callToAction, 'cta')}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              {copiedKey === 'cta' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-rose-400" />
              <span>دعوت به اقدام (Call To Action):</span>
            </span>
          </div>
          <p className="text-xs text-neutral-200 text-right font-medium leading-relaxed bg-neutral-950/60 rounded-lg p-2.5 border border-neutral-800">
            {metadata.callToAction}
          </p>
        </div>

        {/* Alt Text */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => copyToClipboard(metadata.altText, 'alt')}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              {copiedKey === 'alt' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Accessibility className="h-3.5 w-3.5 text-rose-400" />
              <span>متن جایگزین (Alt Text سئو پینترست):</span>
            </span>
          </div>
          <p className="text-xs text-neutral-300 text-right leading-relaxed bg-neutral-950/60 rounded-lg p-2.5 border border-neutral-800">
            {metadata.altText}
          </p>
        </div>
      </div>

      {/* 4. Trending Hashtags & Boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Hashtags */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => copyToClipboard(metadata.trendingHashtags.join(' '), 'hashtags')}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              {copiedKey === 'hashtags' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-rose-400" />
              <span>هشتگ‌های ترند و نیچ:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {metadata.trendingHashtags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] font-mono text-rose-300/90 bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* Pinterest Boards */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => copyToClipboard(metadata.pinterestBoards.join(' | '), 'boards')}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              {copiedKey === 'boards' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-rose-400" />
              <span>بردهای پیشنهادی برای ذخیره پین:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {metadata.pinterestBoards.map((board, i) => (
              <span
                key={i}
                className="text-xs text-neutral-300 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1"
              >
                📁 {board}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
