export interface ProductData {
  title: string;
  titleEn?: string;
  brand: string;
  price: string;
  priceUsd?: string;
  originalPrice?: string;
  discount?: string;
  category: string;
  targetAudience: string;
  keyFeatures: string[];
  ingredientsOrSpecs?: string[];
  images: string[];
  sourceUrl: string;
}

export interface SeoMetadata {
  pin_title: string;
  pin_titles?: PinTitleItem[];
  pin_description: string;
  pin_descriptions?: PinDescItem[];
  alt_text: string;
  call_to_action?: string;
  tags: string[];
  pinterest_boards?: string[];
}

export interface PaletteRecommendation {
  background_tone: string;
  accent_color: string;
}

export interface PosterElements {
  main_headline: string;
  sub_headline: string;
  badge_text: string;
  palette_recommendation: PaletteRecommendation;
}

export interface PipelineAnalysisResponse {
  seo_metadata: SeoMetadata;
  poster_elements: PosterElements;
  image_generation_prompt: string;
}

export interface PinTitleItem {
  style: string;
  text: string;
}

export interface PinDescItem {
  style: string;
  text: string;
}

export interface PinMetadata {
  titles: PinTitleItem[];
  descriptions: PinDescItem[];
  callToAction: string;
  altText: string;
  overlayHooks: string[];
  pinterestBoards: string[];
  trendingHashtags: string[];
  imageGenerationPrompt?: string;
  paletteRecommendation?: PaletteRecommendation;
}

export type PosterTemplateStyle =
  | 'luxury_editorial'
  | 'minimal_studio'
  | 'bold_sale'
  | 'organic_lifestyle'
  | 'tech_dark';

export interface PosterDesignConfig {
  aspectRatio: '9:16' | '2:3';
  templateStyle: PosterTemplateStyle;
  selectedImageIndex: number;
  customBackdropUrl?: string;
  primaryColor: string;
  accentColor: string;
  badgeText: string;
  hookText: string;
  priceText: string;
  titleText: string;
  brandText: string;
  ctaText: string;
  removeBackground: boolean;
  showDiscountBadge: boolean;
  showPriceBadge: boolean;
  fontFamily: 'vazir' | 'serif' | 'sans';
  imageGenerationPrompt?: string;
}

export interface UserSession {
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

export interface SavedPinRecord {
  id: string;
  timestamp: number;
  product: ProductData;
  metadata: PinMetadata;
  selectedTitle: string;
  selectedDesc: string;
  posterDataUrl?: string;
}
