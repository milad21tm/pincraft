import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  PinMetadata,
  ProductData,
  PipelineAnalysisResponse,
} from '../types';

/**
 * Server-side Gemini AI client initialization
 * Must use process.env.GEMINI_API_KEY and User-Agent 'aistudio-build'
 */
const defaultApiKey = process.env.GEMINI_API_KEY || '';

export function getGeminiClient(customKey?: string): GoogleGenAI | null {
  const key = customKey || process.env.GEMINI_API_KEY || defaultApiKey;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface GenerateMetadataOptions {
  language?: 'fa' | 'en' | 'both';
  tone?: string;
  model?: string;
  enableThinking?: boolean;
  customApiKey?: string;
}

/**
 * Helper to fetch an image URL on the server and convert it to Gemini inlineData base64 part
 */
async function fetchImagePart(imageUrl: string): Promise<{
  inlineData: { mimeType: string; data: string };
} | null> {
  if (!imageUrl) return null;

  try {
    // If it's already a base64 data URL
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    }

    // Otherwise fetch the remote image URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.includes('png')
      ? 'image/png'
      : contentType.includes('webp')
      ? 'image/webp'
      : 'image/jpeg';

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      inlineData: {
        mimeType,
        data: base64,
      },
    };
  } catch (err: any) {
    console.warn(`[Gemini Multimodal] Could not fetch image for multimodal analysis: ${err.message}`);
    return null;
  }
}

/**
 * Stage 2: Multimodal Gemini Analysis & SEO Copywriting (Reading text AND seeing the product image)
 */
export async function analyzeProductMultimodal(
  product: ProductData,
  options: GenerateMetadataOptions = {}
): Promise<PipelineAnalysisResponse & { metadata: PinMetadata }> {
  const {
    language = 'fa',
    tone = 'viral',
    model = 'gemini-3.8-flash',
    enableThinking = false,
    customApiKey,
  } = options;
  const ai = getGeminiClient(customApiKey);

  if (!ai) {
    console.warn('GEMINI_API_KEY not configured. Using dynamic fallback generator.');
    return generateFallbackPipelineResponse(product);
  }

  // Determine model: if thinking is enabled, use gemini-3.1-pro-preview
  const effectiveModel = enableThinking ? 'gemini-3.1-pro-preview' : (model || 'gemini-3.8-flash');

  // 1. Ingest Product Image as visual reference
  const primaryImageUrl = product.images?.[0] || '';
  const imagePart = await fetchImagePart(primaryImageUrl);

  const languageInstruction =
    language === 'en'
      ? 'Produce all Pinterest metadata in natural, compelling American e-commerce English.'
      : language === 'both'
      ? 'Produce Persian as primary title/description with English subtitles or translations where relevant.'
      : 'تمامی متون، عناوین، دیسکریپشن‌ها و هشتگ‌ها به زبان فارسی روان، جذاب، تجاری و سئو شده پینترست تولید شوند.';

  const promptText = `You are a World-Class Pinterest Merchandiser, Multimodal Brand Strategist, and Viral SEO Specialist.
${imagePart ? 'You are provided with BOTH the actual product image and the extracted text details. Look closely at the packaging shape, container color, materials, brand typography, and aesthetic.' : 'You are analyzing the product data.'}

PRODUCT DETAILS:
- Title: ${product.title} (${product.titleEn || ''})
- Brand: ${product.brand || 'Unbranded'}
- Price: ${product.price} (Discount: ${product.discount || 'None'})
- Category: ${product.category}
- Target Audience: ${product.targetAudience}
- Key Features: ${product.keyFeatures ? product.keyFeatures.join(' | ') : 'High quality'}
- Specs: ${product.ingredientsOrSpecs ? product.ingredientsOrSpecs.join(' | ') : ''}
- Tone style requested: ${tone}

LANGUAGE REQUIREMENT:
${languageInstruction}

PINTEREST PIPELINE OBJECTIVES:
1. "seo_metadata":
   - "pin_title": Main high-intent title under 100 characters combining Problem/Benefit + Product Name + Brand.
   - "pin_titles": Array of 3 distinct styles:
     * Style 1: Problem-Solving & Core Benefit (حل مشکل و مزیت اصلی)
     * Style 2: LSI Keywords & High Search Volume (کلمات کلیدی سئو و نام تجاری)
     * Style 3: High-CTR Viral Curiosity (کنجکاوی‌برانگیز و کلیک‌خور)
   - "pin_description": Comprehensive 300-500 character description containing LSI keywords, bullet benefits, and clear Call to Action (CTA).
   - "pin_descriptions": Array of 2 styles (E-commerce Conversion and Lifestyle Storytelling).
   - "alt_text": Detailed visual description for Pinterest internal visual search indexing and accessibility.
   - "call_to_action": Urgent action-driving CTA button text (e.g. "برای مشاهده تخفیف و خرید روی لینک کلیک کنید 🛒").
   - "tags": 4 to 6 trending niche Pinterest hashtags (e.g. ["#روتین_پوستی", "#خرید_آنلاین", "#pinterestfinds"]).
   - "pinterest_boards": 3 recommended Pinterest board names.

2. "poster_elements":
   - "main_headline": A short, punchy 2-to-4 word hook headline to print on the vertical 9:16 poster (e.g. "پوستی شفاف در ۷ روز" or "پایان برق اضافه پوست!").
   - "sub_headline": Secondary 3-5 word benefit subtitle (e.g. "سبک، فاقد چربی با SPF بالا").
   - "badge_text": Short highlight badge (e.g. "پرفروش‌ترین انتخاب", "فاقد چربی", or "۳۰٪ تخفیف ویژه").
   - "palette_recommendation":
     * "background_tone": Natural descriptive harmony tone (e.g. "گرم، شنی و تراورتن مینیمال").
     * "accent_color": Complementary hex color code (e.g. "#E11D48" or "#D4AF37").

3. "image_generation_prompt":
   - High-end commercial photography prompt designed for generating a vertical 9:16 Pinterest poster background/pedestal harmonizing with the product's color and category.
   - Example: "Commercial product photography of skincare bottle placed on a beige travertine podium, soft morning sunlight casting elegant botanical shadows, organic textured background, luxury spa aesthetic, ultra-realistic, vertical 9:16 aspect ratio."`;

  try {
    const contents: any = imagePart
      ? { parts: [imagePart, { text: promptText }] }
      : promptText;

    const requestConfig: any = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seo_metadata: {
            type: Type.OBJECT,
            properties: {
              pin_title: { type: Type.STRING },
              pin_titles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['style', 'text'],
                },
              },
              pin_description: { type: Type.STRING },
              pin_descriptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['style', 'text'],
                },
              },
              alt_text: { type: Type.STRING },
              call_to_action: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              pinterest_boards: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['pin_title', 'pin_description', 'alt_text', 'tags'],
          },
          poster_elements: {
            type: Type.OBJECT,
            properties: {
              main_headline: { type: Type.STRING },
              sub_headline: { type: Type.STRING },
              badge_text: { type: Type.STRING },
              palette_recommendation: {
                type: Type.OBJECT,
                properties: {
                  background_tone: { type: Type.STRING },
                  accent_color: { type: Type.STRING },
                },
                required: ['background_tone', 'accent_color'],
              },
            },
            required: ['main_headline', 'sub_headline', 'badge_text', 'palette_recommendation'],
          },
          image_generation_prompt: { type: Type.STRING },
        },
        required: ['seo_metadata', 'poster_elements', 'image_generation_prompt'],
      },
    };

    // If thinking is enabled or gemini-3.1-pro-preview is selected, set thinkingLevel to HIGH and do not set maxOutputTokens
    if (effectiveModel === 'gemini-3.1-pro-preview' || enableThinking) {
      requestConfig.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const response = await ai.models.generateContent({
      model: effectiveModel,
      contents,
      config: requestConfig,
    });

    const textOutput = response.text?.trim() || '{}';
    const parsed = JSON.parse(textOutput);

    // Map into PinMetadata for compatibility
    const metadata: PinMetadata = {
      titles:
        parsed.seo_metadata.pin_titles && parsed.seo_metadata.pin_titles.length > 0
          ? parsed.seo_metadata.pin_titles
          : [
              { style: 'عنوان اصلی پینترست', text: parsed.seo_metadata.pin_title },
              { style: 'سئو با کلمات کلیدی', text: `${parsed.seo_metadata.pin_title} | خرید آنلاین` },
              { style: 'جذاب و پرکلیک', text: `راز محبوبیت ${product.title} در پینترست ✨` },
            ],
      descriptions:
        parsed.seo_metadata.pin_descriptions && parsed.seo_metadata.pin_descriptions.length > 0
          ? parsed.seo_metadata.pin_descriptions
          : [
              { style: 'توصیف فروشگاهی جامع', text: parsed.seo_metadata.pin_description },
              { style: 'سبک زندگی و معرفی', text: `${parsed.seo_metadata.pin_description}\n\n${parsed.seo_metadata.tags?.join(' ')}` },
            ],
      callToAction: parsed.seo_metadata.call_to_action || 'برای مشاهده قیمت و خرید روی لینک کلیک کنید 🛒',
      altText: parsed.seo_metadata.alt_text || `تصویر محصول ${product.title}`,
      overlayHooks: [
        parsed.poster_elements.main_headline,
        parsed.poster_elements.sub_headline,
        parsed.poster_elements.badge_text,
      ],
      pinterestBoards: parsed.seo_metadata.pinterest_boards || ['ایده‌های خرید', 'محصولات پرفروش پینترست'],
      trendingHashtags: parsed.seo_metadata.tags || ['#خرید_آنلاین', '#pinterestfinds'],
      imageGenerationPrompt: parsed.image_generation_prompt,
      paletteRecommendation: parsed.poster_elements.palette_recommendation,
    };

    return {
      seo_metadata: parsed.seo_metadata,
      poster_elements: parsed.poster_elements,
      image_generation_prompt: parsed.image_generation_prompt,
      metadata,
    };
  } catch (err: any) {
    console.error('[Gemini Multimodal Service] Analysis error:', err.message);
    return generateFallbackPipelineResponse(product);
  }
}

/**
 * Standard generator compatibility wrapper
 */
export async function generatePinterestMetadata(
  product: ProductData,
  options: GenerateMetadataOptions = {}
): Promise<PinMetadata> {
  const result = await analyzeProductMultimodal(product, options);
  return result.metadata;
}

/**
 * Stage 3: Generates an aesthetic studio backdrop using Gemini Image Generation
 * Uses the custom image_generation_prompt engineered by Gemini Multimodal
 */
export async function generateStudioBackdropFromPrompt(
  prompt: string,
  customApiKey?: string
): Promise<string> {
  const ai = getGeminiClient(customApiKey);
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const finalPrompt = prompt.includes('vertical 9:16')
    ? prompt
    : `${prompt}, empty center pedestal ready for product placement, luxury minimalist aesthetic, no text, vertical 9:16 aspect ratio.`;

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-image',
    contents: {
      parts: [{ text: finalPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: '9:16',
      },
    },
  });

  const candidate = imageResponse.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error('مدل هوش مصنوعی تصویری بازنگرداند.');
}

/**
 * Generates an aesthetic studio backdrop by style or prompt
 */
export async function generateStudioBackdrop(
  category: string,
  brand: string,
  style = 'minimal_travertine',
  customPrompt?: string,
  customApiKey?: string
): Promise<string> {
  if (customPrompt && customPrompt.length > 20) {
    return generateStudioBackdropFromPrompt(customPrompt, customApiKey);
  }

  const stylePrompts: Record<string, string> = {
    minimal_travertine:
      'Minimalist luxury product studio podium, neutral warm travertine stone pedestal, soft diffused morning sunlight, natural architectural shadows, empty pedestal ready for product placement, vertical 9:16 aspect ratio, clean luxury aesthetic, no text, no artifacts.',
    luxury_dark:
      'Sleek dark obsidian and matte charcoal pedestal in a moody luxury studio, dramatic architectural rim lighting, soft reflections, minimalist luxury aesthetic, vertical 9:16 composition, empty pedestal in center, no text.',
    botanical_spa:
      'Organic aesthetic spa pedestal with soft natural eucalyptus leaf shadows, warm off-white lime wash plaster texture, morning golden hour light, vertical 9:16 portrait orientation, empty center platform, clean zen atmosphere, no text.',
    vibrant_modern:
      'Contemporary modern studio set with soft pastel geometric arches, sculptural podium, soft gradient ambient illumination, high-end editorial commercial aesthetic, vertical 9:16 layout, clean center space, no text.',
  };

  const promptText = `${stylePrompts[style] || stylePrompts.minimal_travertine} Commercial photography quality for ${category || 'product'} by ${brand || 'brand'}.`;
  return generateStudioBackdropFromPrompt(promptText, customApiKey);
}

/**
 * Synthesizes messy extracted webpage text into structured product fields
 */
export async function synthesizeProductDetails(
  url: string,
  rawData: {
    title?: string;
    desc?: string;
    brand?: string;
    price?: string;
    domFeatures?: string[];
    cleanBodyText?: string;
  },
  customApiKey?: string,
  enableThinking = false
): Promise<Partial<ProductData>> {
  const ai = getGeminiClient(customApiKey);
  if (!ai) {
    return {
      title: rawData.title || 'محصول',
      brand: rawData.brand || '',
      price: rawData.price || '',
      keyFeatures: rawData.domFeatures || [],
    };
  }

  const prompt = `You are an expert E-Commerce Merchandiser and Pinterest Automation Specialist.
Here is scraped data from a real product webpage:
- URL: ${url}
- Extracted Title: ${rawData.title || 'Not specified'}
- Extracted Description: ${rawData.desc || 'Not specified'}
- Extracted Brand: ${rawData.brand || 'Not specified'}
- Extracted Price: ${rawData.price || 'Not specified'}
- Extracted Key Bullets: ${rawData.domFeatures?.join(' | ') || 'None'}
- Webpage Body Text Excerpt: ${rawData.cleanBodyText?.slice(0, 2000) || ''}

Analyze the text and extract accurate product information in Persian (with English title if applicable).
Respond in pure JSON with this exact schema:
{
  "title": "Clean, attractive, commercial product title in Persian",
  "titleEn": "Clean product title in English",
  "brand": "Store or brand name",
  "price": "Formatted price (e.g. ۴۵۰,۰۰۰ تومان or $49.99)",
  "originalPrice": "Original price if discounted, or empty string",
  "discount": "Discount tag like '۳۰٪ تخفیف ویژه' or empty string",
  "category": "E-commerce product category in Persian (e.g. لوازم آرایشی، پوشاک، دیجیتال، دکوراسیون)",
  "targetAudience": "Target customer demographic in Persian",
  "keyFeatures": ["Key feature/benefit 1", "Key feature/benefit 2", "Key feature/benefit 3", "Key feature/benefit 4"],
  "ingredientsOrSpecs": ["Spec/Ingredient 1", "Spec/Ingredient 2"]
}`;

  try {
    const modelToUse = enableThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';
    const config: any = {
      responseMimeType: 'application/json',
    };

    if (enableThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config,
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed;
  } catch (err: any) {
    console.error('[Gemini Service] Product synthesis error:', err.message);
    return {
      title: rawData.title,
      brand: rawData.brand,
      price: rawData.price,
      keyFeatures: rawData.domFeatures,
    };
  }
}

/**
 * Fallback generator grounded in the actual product attributes
 */
function generateFallbackPipelineResponse(
  product: ProductData
): PipelineAnalysisResponse & { metadata: PinMetadata } {
  const mainHeadline = 'راز داشتن بهترین نتیجه';
  const subHeadline = product.keyFeatures?.[0] || '۱۰۰٪ تضمین کیفیت و اصالت کالا';
  const badgeText = product.discount || 'پرفروش‌ترین انتخاب';

  const metadata: PinMetadata = {
    titles: [
      {
        style: 'حل مشکل و مزیت اصلی (Problem/Solution)',
        text: `بهترین راه‌حل برای ${product.targetAudience || 'خرید مطمئن'} | ${product.title}`,
      },
      {
        style: 'سئو تخصصی و کلمات کلیدی (SEO & Brand)',
        text: `خرید آنلاین ${product.title} برند ${product.brand} با ارسال سریع`,
      },
      {
        style: 'جذاب و کلیک‌خور (Viral Curiosity CTR)',
        text: `چرا همه در پینترست این ${product.title} را پیشنهاد می‌کنند؟ ✨`,
      },
    ],
    descriptions: [
      {
        style: 'توصیف فروشگاهی جامع (E-commerce SEO)',
        text: `${product.title} از برند معتبر ${product.brand}. ویژگی‌های کلیدی: ${product.keyFeatures?.join(' · ')}. قیمت مناسب ${product.price}. برای مشاهده تخفیف و خرید روی لینک کلیک کنید 🛒\n\n#خرید_آنلاین #پینترست #${product.brand.replace(/\s+/g, '_')} #تخفیف`,
      },
      {
        style: 'سبک زندگی لوکس (Lifestyle Aesthetic)',
        text: `یک انتخاب کم‌نظیر برای ارتقای سبک زندگی و دکوراسیون. طراحی مدرن و کیفیت ساخت عالی. هم‌اکنون با ارسال سریع در دسترس است ✨\n\n#محصولات_ترند #ایده_خرید #pinterestfinds`,
      },
    ],
    callToAction: 'برای مشاهده قیمت و خرید روی لینک کلیک کنید 🛒',
    altText: `تصویر تبلیغاتی محصول ${product.title} برند ${product.brand} روی استند مینیمال`,
    overlayHooks: [mainHeadline, subHeadline, badgeText],
    pinterestBoards: [product.category || 'ایده‌های خرید', 'محصولات پرفروش پینترست'],
    trendingHashtags: ['#خرید_آنلاین', '#پینترست', '#تخفیف_ویژه', '#pinterestfinds'],
    imageGenerationPrompt: `Commercial product photography of ${product.title} placed on a beige travertine podium, soft morning sunlight casting elegant botanical shadows, organic textured background, luxury aesthetic, ultra-realistic, vertical 9:16 aspect ratio.`,
    paletteRecommendation: {
      background_tone: 'گرم، شنی و تراورتن مینیمال',
      accent_color: '#E11D48',
    },
  };

  return {
    seo_metadata: {
      pin_title: metadata.titles[0].text,
      pin_description: metadata.descriptions[0].text,
      alt_text: metadata.altText,
      call_to_action: metadata.callToAction,
      tags: metadata.trendingHashtags,
      pinterest_boards: metadata.pinterestBoards,
      pin_titles: metadata.titles,
      pin_descriptions: metadata.descriptions,
    },
    poster_elements: {
      main_headline: mainHeadline,
      sub_headline: subHeadline,
      badge_text: badgeText,
      palette_recommendation: {
        background_tone: 'گرم، شنی و تراورتن مینیمال',
        accent_color: '#E11D48',
      },
    },
    image_generation_prompt: metadata.imageGenerationPrompt!,
    metadata,
  };
}
