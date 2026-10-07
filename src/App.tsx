import React, { useState, useEffect } from 'react';
import {
  ProductData,
  PinMetadata,
  PosterDesignConfig,
  UserSession,
  SavedPinRecord,
} from './types';
import { Navbar } from './components/Navbar';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { UrlScraperSection } from './components/UrlScraperSection';
import { ProductReviewEditor } from './components/ProductReviewEditor';
import { PinCopywritingPanel } from './components/PinCopywritingPanel';
import { VisualStudio } from './components/VisualStudio';
import { VideoPinStudio } from './components/VideoPinStudio';
import { PinterestMobileMockup } from './components/PinterestMobileMockup';
import { PinHistoryLibrary } from './components/PinHistoryLibrary';
import { exportPinterestZipPackage } from './utils/zipExport';
import {
  Sparkles,
  Download,
  AlertTriangle,
  FolderArchive,
  Zap,
  X,
  Layers,
  ArrowDown,
} from 'lucide-react';

const INITIAL_USER_SESSION: UserSession = {
  id: 'usr_google_8867529751',
  name: 'Milad Mahibeygi',
  email: 'milad.mahibeygi@gmail.com',
  avatar:
    'https://api.dicebear.com/7.x/initials/svg?seed=Milad+Mahibeygi&backgroundColor=e11d48,be123c',
  authProvider: 'Google OAuth 2.0 (Active)',
  connectedAt: new Date().toISOString(),
  quotaRemaining: 98,
  quotaTotal: 100,
  tier: 'Pro Automation Hub',
  aiEngines: {
    seoEngine: 'Gemini 3.8 Flash',
    deepAnalysis: 'Gemini 3.1 Pro Preview',
    visualStudio: 'Gemini Flash Image / Imagen Studio',
    videoEngine: 'Canvas Dynamic Video Studio',
  },
};

const INITIAL_PRODUCT: ProductData = {
  title: 'عطر اکستریت د پرفیوم لوکس آمبر گراند - نیش لوکس ۵۰ میل',
  titleEn: 'L\'Ambre Grand Extrait De Parfum - Luxury Niche 50ml',
  brand: 'Maison D\'or Paris',
  price: '۴,۸۵۰,۰۰۰ تومان',
  priceUsd: '$185.00',
  originalPrice: '۵,۹۰۰,۰۰۰ تومان',
  discount: '۲۵٪ تخفیف',
  category: 'عطر و ادکلن (Beauty & Fragrance)',
  targetAudience: 'علاقه‌مندان به روایح لوکس، مناسب مهمانی‌های شبانه و استایل رسمی',
  keyFeatures: [
    'ماندگاری فوق‌العاده بالای ۱۸ ساعته با خط بوی مخملی',
    'ترکیب عصاره طبیعی عنبر، وانیل ماداگاسکار و چوب صندل سفید',
    'بطری کریستال سنگین با درب روکش طلای ۲۴ عیار',
    'ساخت فرانسه، کاملاً وگان و بدون تست حیوانی',
  ],
  ingredientsOrSpecs: [
    'غلظت: Extrait de Parfum (۳۰٪ اسانس خالص)',
    'طبع: گرم، تلخ و شیرین شرقی',
    'فصل: پاییز و زمستان',
  ],
  images: [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1080&q=85',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1080&q=85',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1080&q=85',
  ],
  sourceUrl: 'https://example.com/products/ambre-grand-parfum',
};

const EMPTY_METADATA: PinMetadata = {
  titles: [],
  descriptions: [],
  callToAction: '',
  altText: '',
  overlayHooks: [],
  pinterestBoards: [],
  trendingHashtags: [],
};

const INITIAL_CONFIG: PosterDesignConfig = {
  aspectRatio: '9:16',
  templateStyle: 'luxury_editorial',
  selectedImageIndex: 0,
  primaryColor: '#E11D48',
  accentColor: '#FDA4AF',
  badgeText: '۲۵٪ تخفیف ویژه',
  hookText: 'راز عطری با ماندگاری ۱۸ ساعته!',
  priceText: '۴,۸۵۰,۰۰۰ تومان',
  titleText: 'عطر اکستریت د پرفیوم لوکس آمبر گراند',
  brandText: 'Maison D\'or Paris',
  ctaText: 'مشاهده و خرید 🛒',
  removeBackground: false,
  showDiscountBadge: true,
  showPriceBadge: true,
  fontFamily: 'vazir',
};

export default function App() {
  const [userSession, setUserSession] = useState<UserSession>(INITIAL_USER_SESSION);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'creator' | 'history'>('creator');

  const [product, setProduct] = useState<ProductData>(INITIAL_PRODUCT);
  const [metadata, setMetadata] = useState<PinMetadata>(EMPTY_METADATA);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedDesc, setSelectedDesc] = useState('');
  const [posterConfig, setPosterConfig] = useState<PosterDesignConfig>(INITIAL_CONFIG);

  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingBackdrop, setIsGeneratingBackdrop] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [savedPins, setSavedPins] = useState<SavedPinRecord[]>([]);

  // Load User Session from backend, History from LocalStorage, and fetch live Gemini metadata
  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUserSession(data.user);
      })
      .catch((e) => console.log('Session fetch fallback:', e));

    // Dynamic initial Pinterest metadata generation via server Gemini service
    fetch('/api/generate-pin-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: INITIAL_PRODUCT, language: 'fa', tone: 'viral' }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setMetadata(res.data);
          if (res.data.titles?.[0]) setSelectedTitle(res.data.titles[0].text);
          if (res.data.descriptions?.[0]) setSelectedDesc(res.data.descriptions[0].text);
          if (res.data.overlayHooks?.[0]) {
            setPosterConfig((prev) => ({
              ...prev,
              hookText: res.data.overlayHooks[0],
              badgeText: res.data.overlayHooks[2] || prev.badgeText,
            }));
          }
        }
      })
      .catch((err) => console.log('Init dynamic metadata fetch:', err));

    try {
      const stored = localStorage.getItem('pincraft_saved_pins');
      if (stored) {
        setSavedPins(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  // Save history helper
  const handleSavePinToLibrary = (posterDataUrl?: string) => {
    const record: SavedPinRecord = {
      id: 'pin_' + Date.now(),
      timestamp: Date.now(),
      product,
      metadata,
      selectedTitle,
      selectedDesc,
      posterDataUrl,
    };
    const updated = [record, ...savedPins.slice(0, 30)];
    setSavedPins(updated);
    localStorage.setItem('pincraft_saved_pins', JSON.stringify(updated));
  };

  // Full Pipeline: Scrape URL -> Generate Metadata -> Update Config
  const handleScrape = async (
    url: string,
    presetKey?: string,
    enableThinking: boolean = false,
    language: 'fa' | 'en' | 'both' = 'fa'
  ) => {
    setIsLoadingScrape(true);
    setErrorMessage(null);
    setLoadingStep(
      enableThinking
        ? 'حالت تفکر عمیق: استخراج ساختار DOM و تحلیل استراتژیک چندوجهی محصول...'
        : 'در حال واکشی ساختار صفحه و استخراج تگ‌های HD محصول...'
    );

    try {
      // 1. Scrape real product URL
      const scrapeRes = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, presetKey, enableThinking }),
      });
      const scrapeData = await scrapeRes.json();

      if (!scrapeRes.ok || !scrapeData.product) {
        throw new Error(scrapeData.error || 'خطا در دریافت مشخصات محصول از آدرس اعلام شده');
      }

      const newProduct: ProductData = scrapeData.product;
      setProduct(newProduct);

      // 2. SEO Copywriting with Gemini (Thinking or Flash)
      setLoadingStep(
        enableThinking
          ? 'مدل Gemini 3.1 Pro با Thinking Level: High در حال استدلال عمیق و تدوین کپی‌رایتینگ سئو...'
          : 'هوش مصنوعی Gemini 3.8 Flash در حال نگارش متادیتای سئو و کپی‌رایتینگ پینترست...'
      );

      const metaRes = await fetch('/api/generate-pin-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: newProduct,
          language,
          tone: 'viral',
          enableThinking,
        }),
      });
      const metaDataJson = await metaRes.json();

      let newMeta: PinMetadata = EMPTY_METADATA;
      if (metaRes.ok && metaDataJson.data) {
        newMeta = metaDataJson.data;
        setMetadata(newMeta);
      } else if (metaDataJson.error) {
        console.warn('Metadata generation warning:', metaDataJson.error);
      }

      const chosenTitle = newMeta.titles[0]?.text || newProduct.title;
      const chosenDesc = newMeta.descriptions[0]?.text || '';
      setSelectedTitle(chosenTitle);
      setSelectedDesc(chosenDesc);

      // 3. Update Poster Config with scraped details
      setPosterConfig({
        ...posterConfig,
        selectedImageIndex: 0,
        customBackdropUrl: undefined,
        titleText: newProduct.title,
        brandText: newProduct.brand || 'PINCRAFT STORE',
        priceText: newProduct.price || '',
        badgeText:
          metaDataJson.pipeline?.poster_elements?.badge_text ||
          newProduct.discount ||
          (newMeta.overlayHooks?.[2] || 'پیشنهاد ویژه'),
        hookText:
          metaDataJson.pipeline?.poster_elements?.main_headline ||
          newMeta.overlayHooks?.[0] ||
          'بهترین انتخاب برای شما!',
        ctaText: metaDataJson.pipeline?.seo_metadata?.call_to_action || 'مشاهده و خرید 🛒',
        imageGenerationPrompt:
          metaDataJson.pipeline?.image_generation_prompt || newMeta.imageGenerationPrompt,
      });

      // Update remaining quota and active engine indication
      setUserSession((prev) => ({
        ...prev,
        quotaRemaining: Math.max(0, prev.quotaRemaining - 1),
        aiEngines: {
          ...prev.aiEngines,
          seoEngine: enableThinking
            ? 'Gemini 3.1 Pro (Thinking: High)'
            : 'Gemini 3.8 Flash',
        },
      }));

      // Automatically store in library
      handleSavePinToLibrary();
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setErrorMessage(err.message || 'خطا در پردازش آدرس محصول. لطفاً اتصال به اینترنت و آدرس وارد شده را بررسی کنید.');
    } finally {
      setIsLoadingScrape(false);
      setLoadingStep('');
    }
  };

  // Re-generate metadata with AI
  const handleRegenerateMetadata = async () => {
    setIsLoadingScrape(true);
    setErrorMessage(null);
    setLoadingStep('تولید مجدد متادیتای سئو و عناوین توسط هوش مصنوعی...');
    try {
      const metaRes = await fetch('/api/generate-pin-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          language: 'fa',
          tone: 'viral',
        }),
      });
      const metaDataJson = await metaRes.json();
      if (metaRes.ok && metaDataJson.data) {
        setMetadata(metaDataJson.data);
        setSelectedTitle(metaDataJson.data.titles[0]?.text || selectedTitle);
        setSelectedDesc(metaDataJson.data.descriptions[0]?.text || selectedDesc);
      } else {
        throw new Error(metaDataJson.error || 'خطا در تولید مجدد متادیتا');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'خطا در تولید متادیتا با هوش مصنوعی');
    } finally {
      setIsLoadingScrape(false);
      setLoadingStep('');
    }
  };

  // AI Backdrop generation
  const handleGenerateAiBackdrop = async (style: string, customPrompt?: string): Promise<string | void> => {
    setIsGeneratingBackdrop(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/generate-backdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: product.category,
          brand: product.brand,
          style,
          prompt: customPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'خطا در تولید بك‌گراند استودیویی');
      }
      return data.imageUrl;
    } catch (err: any) {
      console.error(err);
      setErrorMessage('خطا در تولید پس‌زمینه با مدل هوش مصنوعی: ' + err.message);
    } finally {
      setIsGeneratingBackdrop(false);
    }
  };

  // ZIP Download
  const handleExportZip = async () => {
    setIsExportingZip(true);
    setErrorMessage(null);
    try {
      const canvasEl = document.querySelector('canvas') as HTMLCanvasElement | null;
      const zipBlob = await exportPinterestZipPackage(
        canvasEl,
        product,
        metadata,
        selectedTitle,
        selectedDesc
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinterest-hub-package-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('ZIP export error:', e);
      setErrorMessage('خطا در ایجاد فایل فشرده ZIP: ' + e.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Switch pin from history
  const handleLoadFromHistory = (record: SavedPinRecord) => {
    setProduct(record.product);
    setMetadata(record.metadata);
    setSelectedTitle(record.selectedTitle);
    setSelectedDesc(record.selectedDesc);
    setPosterConfig({
      ...posterConfig,
      titleText: record.product.title,
      brandText: record.product.brand,
      priceText: record.product.price,
    });
    setActiveTab('creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        userSession={userSession}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedPinsCount={savedPins.length}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
          <div className="flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-xs text-red-200">
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded text-red-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-right">
              <span>{errorMessage}</span>
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {activeTab === 'creator' ? (
          <>
            {/* Step 1 & 2: Hero URL Scraper Engine */}
            <UrlScraperSection
              onScrape={handleScrape}
              isLoading={isLoadingScrape}
              loadingStep={loadingStep}
            />

            {/* Extracted Product Reviewer & Gallery Picker */}
            <ProductReviewEditor
              product={product}
              onUpdateProduct={setProduct}
              selectedImageIndex={posterConfig.selectedImageIndex}
              onSelectImageIndex={(idx) =>
                setPosterConfig({ ...posterConfig, selectedImageIndex: idx })
              }
              onRegeneratePin={handleRegenerateMetadata}
              isRegenerating={isLoadingScrape}
            />

            {/* Step 3: AI SEO Copywriting Panel */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl">
              <PinCopywritingPanel
                metadata={metadata}
                selectedTitle={selectedTitle}
                onSelectTitle={(t) => {
                  setSelectedTitle(t);
                  setPosterConfig((prev) => ({ ...prev, hookText: t.slice(0, 40) }));
                }}
                selectedDesc={selectedDesc}
                onSelectDesc={setSelectedDesc}
              />
            </div>

            {/* Step 4: Visual Studio (Poster 9:16 & Backgrounds) */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl">
              <VisualStudio
                product={product}
                config={posterConfig}
                onChangeConfig={setPosterConfig}
                onGenerateAiBackdrop={handleGenerateAiBackdrop}
                isGeneratingBackdrop={isGeneratingBackdrop}
                onSavePin={handleSavePinToLibrary}
              />
            </div>

            {/* Step 4 Continued: Video Pin & Idea Pin Studio */}
            <VideoPinStudio product={product} config={posterConfig} />

            {/* Step 5: Pinterest Live Mobile Mockup */}
            <PinterestMobileMockup
              product={product}
              title={selectedTitle}
              description={selectedDesc}
              posterImageSrc={product.images[posterConfig.selectedImageIndex] || product.images[0]}
            />

            {/* Batch Export & ZIP Downloader Bar */}
            <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="text-right">
                <h3 className="text-base font-bold text-white flex items-center gap-2 justify-end">
                  <span>دانلود پکیج کامل آماده انتشار در پینترست (ZIP)</span>
                  <FolderArchive className="h-5 w-5 text-rose-400" />
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  شامل کاور باکیفیت ۱۰۸۰×۱۹۲۰ (فرمت‌های PNG و JPG)، فایل متادیتای آماده و کپی‌پیست سئو
                </p>
              </div>

              <button
                onClick={handleExportZip}
                disabled={isExportingZip}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-rose-950 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                {isExportingZip ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin text-amber-300" />
                    <span>در حال بسته‌بندی فایل فشرده...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>دانلود کل پکیج یکجا (ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Tab: Saved Pins History Library */
          <PinHistoryLibrary
            savedPins={savedPins}
            onLoadPin={handleLoadFromHistory}
            onDeletePin={(id) => {
              const updated = savedPins.filter((p) => p.id !== id);
              setSavedPins(updated);
              localStorage.setItem('pincraft_saved_pins', JSON.stringify(updated));
            }}
            onClearAll={() => {
              setSavedPins([]);
              localStorage.removeItem('pincraft_saved_pins');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-900 bg-neutral-950 py-8 text-neutral-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">PinCraft AI Hub</span>
            <span>·</span>
            <span>اتوماسیون هوش مصنوعی تولید پین و محتوای تصویری پینترست</span>
          </div>
          <div className="text-neutral-500 text-[11px]">
            توسعه‌یافته با React 19، Tailwind CSS، Gemini 3.8 Flash، Cheerio و Canvas Studio
          </div>
        </div>
      </footer>

      {/* Google Auth & Engine Settings Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userSession={userSession}
        onUpdateSession={setUserSession}
      />
    </div>
  );
}
