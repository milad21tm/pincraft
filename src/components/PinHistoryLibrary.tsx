import React from 'react';
import { SavedPinRecord } from '../types';
import {
  Clock,
  ArrowRight,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PinHistoryLibraryProps {
  savedPins: SavedPinRecord[];
  onLoadPin: (record: SavedPinRecord) => void;
  onDeletePin: (id: string) => void;
  onClearAll: () => void;
}

export const PinHistoryLibrary: React.FC<PinHistoryLibraryProps> = ({
  savedPins,
  onLoadPin,
  onDeletePin,
  onClearAll,
}) => {
  if (savedPins.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-white">کتابخانه پین‌های شما خالی است</h3>
        <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
          با وارد کردن آدرس یک محصول در تب اتوماسیون، پین‌های تولید شده شما در اینجا به صورت محلی ذخیره
          می‌شوند تا در آینده بتوانید آن‌ها را بازیابی یا دوباره دانلود کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <button
          onClick={onClearAll}
          className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
        >
          پاکسازی کل تاریخچه
        </button>

        <div className="text-right">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 justify-end">
            <span>کتابخانه و تاریخچه پین‌های ذخیره شده</span>
            <Clock className="h-5 w-5 text-rose-400" />
          </h2>
          <p className="text-xs text-neutral-400">
            {savedPins.length} پین طراحی شده و آماده انتشار در پینترست
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedPins.map((record) => {
          const dateStr = new Date(record.timestamp).toLocaleDateString('fa-IR');
          const thumb =
            record.posterDataUrl ||
            record.product.images[0] ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=85';

          return (
            <div
              key={record.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/80 overflow-hidden hover:border-neutral-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Poster Thumbnail */}
                <div className="relative aspect-[9/16] max-h-64 w-full overflow-hidden bg-neutral-950">
                  <img
                    src={thumb}
                    alt={record.product.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                    {dateStr}
                  </div>
                  <div className="absolute bottom-2 left-2 rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {record.product.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 text-right">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                    {record.product.brand || 'فروشگاه'}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                    {record.selectedTitle || record.product.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {record.selectedDesc || record.metadata.descriptions[0]?.text}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={() => onDeletePin(record.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                  title="حذف از کتابخانه"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onLoadPin(record)}
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <span>بارگذاری مجدد در استودیو</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
