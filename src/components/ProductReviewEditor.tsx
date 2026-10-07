import React, { useState } from 'react';
import { ProductData } from '../types';
import {
  Package,
  Tag,
  DollarSign,
  Check,
  Edit3,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ProductReviewEditorProps {
  product: ProductData;
  onUpdateProduct: (updated: ProductData) => void;
  selectedImageIndex: number;
  onSelectImageIndex: (index: number) => void;
  onRegeneratePin: () => void;
  isRegenerating: boolean;
}

export const ProductReviewEditor: React.FC<ProductReviewEditorProps> = ({
  product,
  onUpdateProduct,
  selectedImageIndex,
  onSelectImageIndex,
  onRegeneratePin,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');

  const handleFieldChange = (field: keyof ProductData, value: any) => {
    onUpdateProduct({
      ...product,
      [field]: value,
    });
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      onUpdateProduct({
        ...product,
        keyFeatures: [...(product.keyFeatures || []), newFeatureText.trim()],
      });
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...(product.keyFeatures || [])];
    updated.splice(index, 1);
    onUpdateProduct({
      ...product,
      keyFeatures: updated,
    });
  };

  const handleAddCustomImage = () => {
    if (customImageUrl.trim()) {
      const updatedImages = [customImageUrl.trim(), ...product.images];
      onUpdateProduct({
        ...product,
        images: updatedImages,
      });
      onSelectImageIndex(0);
      setCustomImageUrl('');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-rose-400 border border-neutral-700">
            <Package className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">اطلاعات استخراج‌شده محصول</h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded px-2 py-0.5">
                تأیید اسکرپ
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              بررسی و ویرایش اطلاعات قبل از طراحی پوستر و تولید متادیتای سئو
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'بستن ویرایشگر' : 'ویرایش مشخصات'}</span>
          </button>

          <button
            onClick={onRegeneratePin}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-950 hover:bg-rose-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>تولید مجدد با AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Data on Right, Image Gallery on Left */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Image Gallery Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-rose-400" />
              <span>گالری تصاویر محصول (تصویر فعال برای پوستر)</span>
            </span>
            <span className="text-neutral-500 font-mono text-[11px]">
              {selectedImageIndex + 1} از {product.images.length}
            </span>
          </div>

          {/* Active Big Image Preview */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 shadow-inner group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              تصویر انتخاب شده برای کاور
            </div>
            {product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[10px] text-neutral-300 backdrop-blur hover:text-white"
              >
                <span>مشاهده منبع</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Thumbnail list */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImageIndex(idx)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                  selectedImageIndex === idx
                    ? 'border-rose-500 ring-2 ring-rose-500/40'
                    : 'border-neutral-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                {selectedImageIndex === idx && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>
            ))}
          </div>

          {/* Add custom image URL */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="افزودن لینک عکس دلخواه..."
              dir="ltr"
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={handleAddCustomImage}
              disabled={!customImageUrl.trim()}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              افزودن
            </button>
          </div>
        </div>

        {/* Right Col: Product Data Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-right">
          {/* Title & Brand */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">نام محصول:</label>
            {isEditing ? (
              <input
                type="text"
                value={product.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm font-semibold text-white focus:border-rose-500 focus:outline-none"
              />
            ) : (
              <h3 className="text-base font-bold text-white leading-relaxed">{product.title}</h3>
            )}
            {product.titleEn && (
              <p className="mt-1 text-xs text-neutral-400 font-mono text-left" dir="ltr">
                {product.titleEn}
              </p>
            )}
          </div>

          {/* Brand, Price & Discount row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
              <span className="text-[11px] text-neutral-500 block mb-1">برند / فروشگاه:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={product.brand}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-neutral-200">{product.brand || '—'}</span>
              )}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
              <span className="text-[11px] text-neutral-500 block mb-1">قیمت:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={product.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white"
                />
              ) : (
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  {product.price || 'تماس بگیرید'}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
              <span className="text-[11px] text-neutral-500 block mb-1">تخفیف / پیشنهاد:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={product.discount || ''}
                  onChange={(e) => handleFieldChange('discount', e.target.value)}
                  className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white"
                />
              ) : (
                <span className="text-sm font-semibold text-rose-400">
                  {product.discount || 'بدون تخفیف'}
                </span>
              )}
            </div>
          </div>

          {/* Category & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <span className="text-neutral-500 block mb-1">دسته‌بندی پینترست:</span>
              <span className="text-neutral-300 font-medium">{product.category}</span>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <span className="text-neutral-500 block mb-1">مخاطبان هدف:</span>
              <span className="text-neutral-300 font-medium">{product.targetAudience}</span>
            </div>
          </div>

          {/* Key Features Bullets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-2">
              ویژگی‌های کلیدی و مزیت‌های رقابتی:
            </label>
            <div className="space-y-1.5">
              {product.keyFeatures?.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2 text-xs text-neutral-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="افزودن مزیت جدید..."
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                />
                <button
                  onClick={handleAddFeature}
                  className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
