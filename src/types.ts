export interface Swatch {
  id: string;
  name: string;
  imageUrl: string;
  material: string;
  patternType: string;
  colorHex: string;
  description: string;
}

export type ModelStyle = 'traditional' | 'contemporary' | 'festive_royal' | 'studio';

export type DrapeStyle = 'nivi' | 'gujarati' | 'lehenga' | 'bengali';

export type BackgroundStyle = 'haveli' | 'palace' | 'minimalist' | 'festive_lights' | 'studio_grey';

export interface BrandingConfig {
  shopName: string;
  sku: string;
  showWholesalePrice: boolean;
  wholesalePrice: string;
  showBorderBadge: boolean;
  borderBadgeText: string;
  watermarkStyle: 'center' | 'bottom_right' | 'none';
  customPromoText: string;
}

export interface FabricAnalysis {
  title: string;
  material: string;
  patternType: string;
  weaveType: string;
  colorFamily: string;
  suggestedWholesaleRange: {
    min: number;
    max: number;
  };
  marketPopularity: number; // 1-100
  productionEstDays: number;
  description: string;
  seoTags: string[];
  recommendedImagePrompt: string;
}

export interface CatalogItem {
  id: string;
  swatchId: string;
  swatchImageUrl: string;
  title: string;
  material: string;
  patternType: string;
  weaveType: string;
  wholesaleMinPrice: number;
  wholesaleMaxPrice: number;
  description: string;
  modelStyle: ModelStyle;
  drapeStyle: DrapeStyle;
  backgroundStyle: BackgroundStyle;
  branding: BrandingConfig;
  modelImageUrl: string; // The generated model wearing saree
  createdAt: string;
  ratingScore: number;
  fabricDetails: {
    zariWork: string;
    borderWidth: string;
    weightGrams: number;
    suratFactoryLoc: string;
  };
}

export interface Lookbook {
  id: string;
  catalogName: string;
  items: CatalogItem[];
  themeColor: string;
  coverImage: string;
}
