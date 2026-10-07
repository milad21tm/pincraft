import React, { useState } from 'react';
import { ProductData } from '../types';
import {
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Check,
} from 'lucide-react';

interface PinterestMobileMockupProps {
  product: ProductData;
  title: string;
  description: string;
  posterImageSrc?: string;
}

export const PinterestMobileMockup: React.FC<PinterestMobileMockupProps> = ({
  product,
  title,
  description,
  posterImageSrc,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(142);
  const [isLiked, setIsLiked] = useState(false);

  const fallbackImage =
    product.images[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=85';

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((c) => c - 1);
      setIsLiked(false);
    } else {
      setLikeCount((c) => c + 1);
      setIsLiked(true);
    }
  };

  return (
    <div id="mobile-preview" className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Smartphone className="h-4 w-4 text-rose-400" />
          <span>پیش‌نمایش موکاپ زنده اپلیکیشن موبایل پینترست (Live iOS / Android Mockup)</span>
        </div>
        <span className="text-xs font-mono text-neutral-500">Pinterest v2026.10</span>
      </div>

      <div className="flex justify-center">
        {/* Mobile Phone Mockup Frame */}
        <div className="relative w-full max-w-[340px] rounded-[42px] border-[6px] border-neutral-800 bg-neutral-950 p-3 shadow-2xl shadow-rose-950/20">
          {/* Top Speaker / Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-24 rounded-full bg-neutral-800" />

          {/* Screen Content */}
          <div className="pt-6 pb-2 text-neutral-100">
            {/* Top Bar inside app */}
            <div className="flex items-center justify-between px-2 py-2 text-neutral-400">
              <MoreHorizontal className="h-5 w-5" />
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5" />
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    isSaved
                      ? 'bg-neutral-800 text-white'
                      : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-950'
                  }`}
                >
                  {isSaved ? <Check className="h-3 w-3" /> : null}
                  <span>{isSaved ? 'ذخیره شد' : 'ذخیره'}</span>
                </button>
              </div>
            </div>

            {/* The Main Pin Image / Poster */}
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
              <img
                src={posterImageSrc || fallbackImage}
                alt={title}
                className="h-full w-full object-cover"
              />

              {/* Visit Link Floating Pill on Image */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md shadow-lg">
                <ExternalLink className="h-3 w-3 text-rose-400" />
                <span className="truncate max-w-[140px]">
                  {product.brand || 'خرید از فروشگاه'}
                </span>
              </div>
            </div>

            {/* Creator / Shop Profile */}
            <div className="mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=PinCraft+Official&backgroundColor=e11d48"
                  alt=""
                  className="h-8 w-8 rounded-full border border-neutral-700"
                />
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{product.brand || 'فروشگاه برتر'}</div>
                  <div className="text-[10px] text-neutral-400">۴۲ هزار دنبال‌کننده</div>
                </div>
              </div>

              <button className="rounded-full bg-neutral-800 px-3 py-1 text-[11px] font-medium text-white hover:bg-neutral-700">
                دنبال کردن
              </button>
            </div>

            {/* Pin Title */}
            <div className="mt-3 px-2 text-right">
              <h4 className="text-sm font-bold text-white leading-snug">
                {title || product.title}
              </h4>
            </div>

            {/* Pin Description (Truncated / Expandable) */}
            <div className="mt-1.5 px-2 text-right">
              <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Bottom Actions (Heart, Comments) */}
            <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2.5 px-2 text-neutral-400 text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                    isLiked ? 'text-rose-500 font-bold' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                  <span className="font-mono tabular-nums">{likeCount}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-mono tabular-nums">18</span>
                </div>
              </div>

              <span className="text-[10px] text-neutral-500">پین پیشنهادی</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
