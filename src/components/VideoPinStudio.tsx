import React, { useState } from 'react';
import { PosterDesignConfig, ProductData } from '../types';
import { generatePinterestVideoPin, VideoGenerationProgress } from '../utils/canvasVideoGenerator';
import {
  Video,
  Play,
  Download,
  Loader2,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface VideoPinStudioProps {
  product: ProductData;
  config: PosterDesignConfig;
}

export const VideoPinStudio: React.FC<VideoPinStudioProps> = ({ product, config }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<VideoGenerationProgress>({
    progress: 0,
    phase: '',
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setProgressState({ progress: 5, phase: 'شروع پردازش ویدیو...' });
    try {
      const result = await generatePinterestVideoPin(product, config, (p) => {
        setProgressState(p);
      });
      setVideoUrl(result.videoUrl);
    } catch (err: any) {
      console.error('Video generation error:', err);
      alert('خطا در تولید ویدیو: ' + (err.message || 'مشکل در رندرینگ مرورگر'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `pinterest-video-pin-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-rose-400 border border-neutral-700">
            <Film className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h3 className="text-base sm:text-lg font-bold text-white">
              استودیو تولید ویدیو پین و ایده‌پین (Idea Pin / Video Pin)
            </h3>
            <p className="text-xs text-neutral-400">
              تولید ویدیوی ۵ الی ۷ ثانیه‌ای دینامیک با زوم سینمایی Ken Burns، موشن تایپوگرافی و افکت‌های فروشگاهی
            </p>
          </div>
        </div>

        {videoUrl && (
          <button
            onClick={handleDownloadVideo}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-950 hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>دانلود فایل ویدیو (MP4)</span>
          </button>
        )}
      </div>

      {/* Main Video Generation Area */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Video Preview Player (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-700 bg-black shadow-2xl flex items-center justify-center">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-400">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
                <p className="text-xs text-neutral-400">
                  پیش‌نمایش ویدیو پس از کلیک روی دکمه تولید انیمیشن نمایش داده می‌شود.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Options & Video Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-right">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
              <span>ویژگی‌های موتور ویدیو پین هوشمند:</span>
              <Sparkles className="h-4 w-4 text-rose-400" />
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li className="flex items-center gap-2 justify-end">
                <span>زوم نرم سینمایی (Ken Burns Slow Zoom) روی جزئیات محصول</span>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <span>ظاهر شدن تایپوگرافی حل مشکل/مزیت و تیتر به صورت متحرک</span>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <span>پالس نوری بج تخفیف و دکمه اکشن جهت افزایش حداکثری نرخ کلیک (CTR)</span>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <span>رزولوشن استاندارد ۷۲۰×۱۲۸۰ عمودی با رندرینگ سریع ۶۰ فریم بر ثانیه</span>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              </li>
            </ul>
          </div>

          {/* Progress Bar if generating */}
          {isGenerating && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2 text-right">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{progressState.phase}</span>
                <span className="font-mono text-rose-300 font-semibold">
                  {progressState.progress}٪
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${progressState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-rose-950 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال رندر و تولید انیمیشن ویدیو...</span>
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span>تولید ویدیوی ۶ ثانیه‌ای محصول (Idea Pin MP4)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
