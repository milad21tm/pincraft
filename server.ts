import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import {
  generatePinterestMetadata,
  analyzeProductMultimodal,
  generateStudioBackdrop,
  synthesizeProductDetails,
} from './src/services/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// In-memory sessions store
interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  authProvider: string;
  connectedAt: string;
  quotaRemaining: number;
  quotaTotal: number;
  tier: string;
  customApiKey?: string;
  aiEngines: {
    seoEngine: string;
    deepAnalysis: string;
    visualStudio: string;
    videoEngine: string;
  };
}

let currentSession: SessionUser = {
  id: 'usr_google_8867529751',
  name: 'Milad Mahibeygi',
  email: 'milad.mahibeygi@gmail.com',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Milad+Mahibeygi&backgroundColor=e11d48,be123c',
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

// Preset sample products (only activated when presetKey is explicitly clicked)
const PRESET_PRODUCTS: Record<string, any> = {
  perfume: {
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
      'ساخت فرانسه، کاملاً وگان و بدون تست حیوانی'
    ],
    ingredientsOrSpecs: [
      'غلظت: Extrait de Parfum (۳۰٪ اسانس خالص)',
      'طبع: گرم، تلخ و شیرین شرقی',
      'فصل: پاییز و زمستان'
    ],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1080&q=85'
    ],
    sourceUrl: 'https://example.com/products/ambre-grand-parfum'
  },
  skincare: {
    title: 'سرم جوانساز و ضد لک ویتامین سی ۱۰٪ هیالورونیک اسید ارگانیک',
    titleEn: 'Pure Botanical Vitamin C 10% + Hyaluronic Acid Youth Serum',
    brand: 'Lumina Botanics',
    price: '۷۲۰,۰۰۰ تومان',
    priceUsd: '$34.00',
    originalPrice: '۹۶۰,۰۰۰ تومان',
    discount: '۳۰٪ تخفیف ویژه',
    category: 'مراقبت پوست و زیبایی (Skincare)',
    targetAudience: 'افراد دارای پوست کدر، خطوط ریز یا جای جوش و لک‌های پوستی',
    keyFeatures: [
      'شفافیت چشمگیر پوست و روشن‌کننده در کمتر از ۷ روز',
      'آبرسانی عمقی لایه‌های پوست با ۳ وزن مولکولی هیالورونیک اسید',
      'بدنه فرموله شده بر پایه عصاره چای سبز ارگانیک و نیاسینامید',
      'فاقد عطر مصنوعی، الکل و پارابن - مناسب پوست‌های حساس'
    ],
    ingredientsOrSpecs: [
      'حجم: ۳۰ میلی‌لیتر',
      'نوع پوست: همه انواع پوست حتی پوست حساس',
      'روش مصرف: صبح و شب ۳ الی ۴ قطره روی پوست تمیز'
    ],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1608248597359-5613531b2682?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1080&q=85'
    ],
    sourceUrl: 'https://example.com/products/lumina-vitamin-c-serum'
  },
  coffee: {
    title: 'دریپر قهوه سرامیکی دست‌ساز آرتیزان با استند چوب گردو',
    titleEn: 'Handcrafted Ceramic Pour-Over Coffee Dripper with Walnut Stand',
    brand: 'Komorebi Crafts',
    price: '۱,۴۵۰,۰۰۰ تومان',
    priceUsd: '$68.00',
    originalPrice: '۱,۸۰۰,۰۰۰ تومان',
    discount: '۲۰٪ تخفیف',
    category: 'خانه، دکور و سبک زندگی (Home & Kitchen)',
    targetAudience: 'علاقه‌مندان به قهوه تخصصی موج سوم و دکوراسیون مینیمال ژاپنی',
    keyFeatures: [
      'طراحی زاویه ۶۰ درجه جهت عصاره‌گیری یکنواخت و ایجاد طعم شفاف',
      'سرامیک سنگی لعاب مات پخته شده در دمای ۱۲۸۰ درجه سانتی‌گراد',
      'پایه ساخته شده از چوب طبیعی گردوی آمریکایی با محافظ روغن گیاهی',
      'سازگار با تمام فیلترهای کاغذی مخروطی استاندارد V60'
    ],
    ingredientsOrSpecs: [
      'جنس: سرامیک سنگی و چوب گردو',
      'گنجایش: ۱ تا ۴ فنجان قهوه',
      'شستشو: قابل شستشو در ماشین ظرفشویی (بخش سرامیکی)'
    ],
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1080&q=85'
    ],
    sourceUrl: 'https://example.com/products/ceramic-pour-over'
  },
  headphones: {
    title: 'هدفون بی‌سیم نویز کنسلینگ استودیویی های‌رزولوشن مدل Apex One',
    titleEn: 'Apex One Wireless ANC Studio Headphones with Spatial Audio',
    brand: 'AcoustiQ Tech',
    price: '۱۱,۹۰۰,۰۰۰ تومان',
    priceUsd: '$249.00',
    originalPrice: '۱۳,۵۰۰,۰۰۰ تومان',
    discount: '۱۵٪ تخفیف جشنواره',
    category: 'دیجیتال و گجت (Tech & Audio)',
    targetAudience: 'تولیدکنندگان محتوا، فریلنسرها، عاشقان موسیقی باکیفیت و گیمرها',
    keyFeatures: [
      'فناوری حذف نویز فعال هیبریدی (Active Noise Cancelling) تا ۴۵ دسی‌بل',
      'درایورهای بریلیوم ۴۰ میلی‌متری با بیس عمیق و صدای بدون اعوجاج',
      'شارژدهی اعجاب‌انگیز ۵۰ ساعته با یک بار شارژ و شارژ سریع ۱۰ دقیقه‌ای',
      'بدنه آلومینیومی فوق سبک و بالشتک‌های مموری‌فوم با روکش چرم پروتئینی'
    ],
    ingredientsOrSpecs: [
      'نسخه بلوتوث: ۵.۴ با پشتیبانی از LDAC و aptX HD',
      'وزن: ۲۴۵ گرم',
      'میکروفون: ۶ میکروفون هوشمند با حذف نویز محیطی'
    ],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1080&q=85'
    ],
    sourceUrl: 'https://example.com/products/apex-one-headphones'
  }
};

// ----------------------------------------------------
// 1. CORS Image Proxy to prevent Canvas Taint
// ----------------------------------------------------
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    const parsed = new URL(imageUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const imageRes = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: `${parsed.protocol}//${parsed.hostname}/`,
      },
    });
    clearTimeout(timeout);

    if (!imageRes.ok) {
      return res.status(imageRes.status).send('Failed to fetch image');
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(buffer);
  } catch (err: any) {
    console.error('Image proxy error:', err.message);
    return res.status(500).send('Error proxying image: ' + err.message);
  }
});

// ----------------------------------------------------
// 2. Google Authentication & Session Endpoints
// ----------------------------------------------------
app.get('/api/auth/session', (_req, res) => {
  res.json({ success: true, user: currentSession });
});

app.post('/api/auth/google', (req, res) => {
  try {
    const { credential, clientId } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Decode JWT payload (standard Google ID Token)
    const parts = credential.split('.');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Invalid Google JWT format' });
    }

    const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadRaw);

    currentSession = {
      id: payload.sub || `usr_google_${Date.now()}`,
      name: payload.name || payload.email?.split('@')[0] || 'کاربر گوگل',
      email: payload.email || 'user@gmail.com',
      avatar: payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
      authProvider: 'Google OAuth 2.0 (Verified)',
      connectedAt: new Date().toISOString(),
      quotaRemaining: 100,
      quotaTotal: 100,
      tier: 'Pro Automation Hub',
      aiEngines: currentSession.aiEngines,
    };

    return res.json({ success: true, user: currentSession });
  } catch (err: any) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'خطا در اعتبارسنجی لاگین گوگل: ' + err.message });
  }
});

app.post('/api/auth/save-engines', (req, res) => {
  const { seoEngine, visualStudio, videoEngine, customApiKey } = req.body;
  currentSession.aiEngines = {
    seoEngine: seoEngine || currentSession.aiEngines.seoEngine,
    deepAnalysis: currentSession.aiEngines.deepAnalysis,
    visualStudio: visualStudio || currentSession.aiEngines.visualStudio,
    videoEngine: videoEngine || currentSession.aiEngines.videoEngine,
  };
  if (customApiKey !== undefined) {
    currentSession.customApiKey = customApiKey;
  }
  res.json({ success: true, user: currentSession });
});

app.post('/api/auth/logout', (_req, res) => {
  currentSession = {
    ...currentSession,
    authProvider: 'مهمان (Guest)',
  };
  res.json({ success: true });
});

// Backward compatible endpoint
app.get('/api/user-session', (_req, res) => {
  res.json({ user: currentSession });
});

// ----------------------------------------------------
// 3. Real Product Scraper Engine (Cheerio + JSON-LD + OpenGraph)
// ----------------------------------------------------
async function scrapeProductPage(targetUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);

  const response = await fetch(targetUrl, {
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`سایت مبدأ خطای وضعیت HTTP ${response.status} را بازگرداند.`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 1. Check for Embedded JSON in SPA frameworks (Next.js, Nuxt, Redux)
  let embeddedJsonProduct: any = null;
  const nextDataScript = $('#__NEXT_DATA__').html();
  if (nextDataScript) {
    try {
      const nextObj = JSON.parse(nextDataScript);
      const pageProps = nextObj.props?.pageProps;
      if (pageProps?.product || pageProps?.initialState?.product) {
        embeddedJsonProduct = pageProps.product || pageProps.initialState.product;
      }
    } catch {
      // ignore
    }
  }

  // 2. Parse Schema.org JSON-LD scripts
  let jsonLdProduct: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed['@type'] === 'Product') {
        jsonLdProduct = parsed;
      } else if (Array.isArray(parsed)) {
        const found = parsed.find((p) => p['@type'] === 'Product');
        if (found) jsonLdProduct = found;
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        const found = parsed['@graph'].find((p: any) => p['@type'] === 'Product');
        if (found) jsonLdProduct = found;
      }
    } catch {
      // continue
    }
  });

  // 3. Extract OpenGraph & Twitter Meta
  const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || '';
  const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
  const ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
  const ogPrice = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content') || '';
  const ogCurrency = $('meta[property="product:price:currency"]').attr('content') || $('meta[property="og:price:currency"]').attr('content') || '';

  // 4. Extract High-Res Images
  const images: string[] = [];
  const addImage = (rawSrc?: string) => {
    if (!rawSrc) return;
    try {
      const resolved = new URL(rawSrc, targetUrl).href;
      if (
        !resolved.includes('logo') &&
        !resolved.includes('icon') &&
        !resolved.includes('avatar') &&
        !resolved.includes('tracking') &&
        !resolved.includes('1x1') &&
        !images.includes(resolved)
      ) {
        images.push(resolved);
      }
    } catch {
      // ignore invalid URL
    }
  };

  // OpenGraph image
  $('meta[property="og:image"]').each((_, el) => addImage($(el).attr('content')));
  $('meta[name="twitter:image"]').each((_, el) => addImage($(el).attr('content')));

  // JSON-LD images
  if (jsonLdProduct?.image) {
    const ldImgs = Array.isArray(jsonLdProduct.image) ? jsonLdProduct.image : [jsonLdProduct.image];
    for (const img of ldImgs) {
      if (typeof img === 'string') addImage(img);
      else if (img?.url) addImage(img.url);
    }
  }

  // Next.js images
  if (embeddedJsonProduct?.images && Array.isArray(embeddedJsonProduct.images)) {
    for (const img of embeddedJsonProduct.images) {
      if (typeof img === 'string') addImage(img);
      else if (img?.url || img?.src) addImage(img.url || img.src);
    }
  }

  // DOM image tags (look for gallery, main product image, zoom images)
  $(
    'img[data-zoom-image], img[data-large], img[data-src], img.product-image, img.gallery-image, [data-testid="product-image"] img, [id*="product"] img, img'
  ).each((_, el) => {
    if (images.length >= 8) return;
    const src =
      $(el).attr('data-zoom-image') ||
      $(el).attr('data-large') ||
      $(el).attr('data-src') ||
      $(el).attr('src');
    addImage(src);
  });

  // DOM Headings & Descriptions
  const domTitle =
    $('h1').first().text().trim() ||
    $('[data-testid="product-title"]').text().trim() ||
    $('#productTitle').text().trim() ||
    $('.product-title').text().trim();

  const domPrice =
    $('[data-testid="price"]').first().text().trim() ||
    $('.price, .current-price, .product-price, #priceblock_ourprice').first().text().trim();

  // Specs & Bullet Features from HTML
  const domFeatures: string[] = [];
  $('ul.features li, ul.specifications li, ul.a-unordered-list li, .product-details li, .specs li').each(
    (_, el) => {
      const text = $(el).text().trim();
      if (text.length > 5 && text.length < 150 && domFeatures.length < 6) {
        domFeatures.push(text);
      }
    }
  );

  // Clean Text Content slice for LLM
  $('script, style, noscript, svg, nav, footer, header').remove();
  const cleanBodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3500);

  const titleCandidate =
    jsonLdProduct?.name ||
    embeddedJsonProduct?.title ||
    embeddedJsonProduct?.name ||
    ogTitle ||
    domTitle ||
    $('title').text().trim();

  const descCandidate =
    jsonLdProduct?.description ||
    embeddedJsonProduct?.description ||
    ogDesc ||
    domFeatures.join(' · ') ||
    '';

  const brandCandidate =
    jsonLdProduct?.brand?.name ||
    (typeof jsonLdProduct?.brand === 'string' ? jsonLdProduct.brand : '') ||
    embeddedJsonProduct?.brand ||
    ogSiteName ||
    new URL(targetUrl).hostname.replace('www.', '').split('.')[0];

  const priceCandidate =
    (jsonLdProduct?.offers?.price ? `${jsonLdProduct.offers.price} ${jsonLdProduct.offers.priceCurrency || ''}` : '') ||
    (ogPrice ? `${ogPrice} ${ogCurrency}` : '') ||
    domPrice;

  return {
    title: titleCandidate,
    desc: descCandidate,
    brand: brandCandidate,
    price: priceCandidate,
    domFeatures,
    images,
    cleanBodyText,
  };
}

// ----------------------------------------------------
// Scrape Product Page Router
// ----------------------------------------------------
app.post('/api/scrape-product', async (req, res) => {
  try {
    const { url, presetKey, enableThinking = false } = req.body;
    const userKey = (req.headers['x-gemini-api-key'] as string) || currentSession.customApiKey;

    // 1. Explicit Preset selection
    if (presetKey && PRESET_PRODUCTS[presetKey]) {
      return res.json({
        success: true,
        isPreset: true,
        product: PRESET_PRODUCTS[presetKey],
      });
    }

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'آدرس اینترنتی وارد شده معتبر نیست. لطفاً یک URL کامل با http یا https وارد کنید.' });
    }

    // 2. Real Scrape
    console.log(`[Scraper] Fetching and parsing: ${url}`);
    const scraped = await scrapeProductPage(url);

    // 3. Synthesize with Gemini service
    const synthesized = await synthesizeProductDetails(
      url,
      {
        title: scraped.title,
        desc: scraped.desc,
        brand: scraped.brand,
        price: scraped.price,
        domFeatures: scraped.domFeatures,
        cleanBodyText: scraped.cleanBodyText,
      },
      userKey,
      Boolean(enableThinking)
    );

    const host = new URL(url).hostname.replace('www.', '');
    const finalProduct = {
      title: synthesized.title || scraped.title || `محصول از ${host}`,
      titleEn: synthesized.titleEn || scraped.title || `Product from ${host}`,
      brand: synthesized.brand || scraped.brand || host,
      price: synthesized.price || scraped.price || 'تماس بگیرید',
      originalPrice: synthesized.originalPrice || '',
      discount: synthesized.discount || 'پیشنهاد ویژه',
      category: synthesized.category || 'خرید آنلاین',
      targetAudience: synthesized.targetAudience || 'علاقه‌مندان به محصولات باکیفیت',
      keyFeatures:
        synthesized.keyFeatures && synthesized.keyFeatures.length > 0
          ? synthesized.keyFeatures
          : scraped.domFeatures.length > 0
          ? scraped.domFeatures
          : [
              'کیفیت ساخت درجه یک با ضمانت اصالت کالا',
              'طراحی مدرن و ارگونومیک سازگار با جدیدترین ترندها',
              'ارسال سریع به همراه پشتیبانی ۲۴ ساعته',
            ],
      ingredientsOrSpecs: synthesized.ingredientsOrSpecs || ['ضمانت بازگشت وجه ۷ روزه', 'ارسال اکسپرس'],
      images:
        scraped.images.length > 0
          ? scraped.images
          : [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=85',
            ],
      sourceUrl: url,
    };

    return res.json({ success: true, product: finalProduct });
  } catch (err: any) {
    console.error('Scraper endpoint error:', err);
    return res.status(500).json({
      error: `خطا در باز کردن و تحلیل آدرس محصول: ${err.message || 'عدم دسترسی به سرور مقصد'}`,
    });
  }
});

// ----------------------------------------------------
// 4. Pinterest SEO Metadata Copywriting
// ----------------------------------------------------
app.post('/api/generate-pin-metadata', async (req, res) => {
  try {
    const { product, language = 'fa', tone = 'viral', enableThinking = false, model } = req.body;

    if (!product || !product.title) {
      return res.status(400).json({ error: 'اطلاعات محصول الزامی است.' });
    }

    const userKey = (req.headers['x-gemini-api-key'] as string) || currentSession.customApiKey;

    const result = await analyzeProductMultimodal(product, {
      language,
      tone,
      enableThinking: Boolean(enableThinking),
      model: enableThinking ? 'gemini-3.1-pro-preview' : model,
      customApiKey: userKey,
    });

    return res.json({
      success: true,
      data: result.metadata,
      pipeline: {
        seo_metadata: result.seo_metadata,
        poster_elements: result.poster_elements,
        image_generation_prompt: result.image_generation_prompt,
      },
    });
  } catch (err: any) {
    console.error('Metadata generation error:', err);
    return res.status(500).json({ error: err.message || 'خطا در نگارش متادیتای سئو' });
  }
});

// ----------------------------------------------------
// 5. Studio Backdrop Generator
// ----------------------------------------------------
app.post('/api/generate-backdrop', async (req, res) => {
  try {
    const { category, brand, style = 'minimal_travertine', prompt } = req.body;
    const userKey = (req.headers['x-gemini-api-key'] as string) || currentSession.customApiKey;

    const imageUrl = await generateStudioBackdrop(category, brand, style, prompt, userKey);
    res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Backdrop generation error:', error);
    res.status(500).json({ error: error.message || 'خطا در ساخت بك‌گراند استودیو' });
  }
});

// ----------------------------------------------------
// 6. Vite / Static Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
