import { Swatch, ModelStyle, DrapeStyle, BackgroundStyle, CatalogItem } from './types';

// Let's create beautiful SVG data URIs for traditional swatches so we don't rely only on external links
export const SAMPLE_SWATCHES: Swatch[] = [
  {
    id: 'banarasi-brocade',
    name: 'Royal Banarasi Silk Brocade',
    material: 'Pure Katan Silk',
    patternType: 'Golden Zari Weaving',
    colorHex: '#be123c', // Deep Rose Red
    description: 'Intricately woven design featuring beautiful floral meenakari craft and dense golden zari borders.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23881337"/><circle cx="50" cy="50" r="10" fill="%23eab308"/><circle cx="150" cy="50" r="10" fill="%23eab308"/><circle cx="50" cy="150" r="10" fill="%23eab308"/><circle cx="150" cy="150" r="10" fill="%23eab308"/><circle cx="100" cy="100" r="25" fill="%23ca8a04"/><path d="M 0,0 L 200,200 M 200,0 L 0,200" stroke="%23ca8a04" stroke-width="2" stroke-dasharray="5 5"/><path d="M 100,0 L 100,200 M 0,100 L 200,100" stroke="%23eab308" stroke-width="1.5"/></svg>'
  },
  {
    id: 'gujarat-bandhani',
    name: 'Surat Bandhani Georgette',
    material: 'Georgette Crepe',
    patternType: 'Tie and Dye Bandhej Dotting',
    colorHex: '#ea580c', // Bright Orange
    description: 'Premium tie-dye design with traditional Rajasthani and Gujarati white and yellow dots & heavy gota patti border.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23c2410c"/><g fill="%23fef08a" stroke="%23ffffff" stroke-width="1"><circle cx="40" cy="40" r="4"/><circle cx="48" cy="40" r="4"/><circle cx="44" cy="48" r="4"/><circle cx="140" cy="40" r="4"/><circle cx="148" cy="40" r="4"/><circle cx="144" cy="48" r="4"/><circle cx="40" cy="140" r="4"/><circle cx="48" cy="140" r="4"/><circle cx="44" cy="148" r="4"/><circle cx="140" cy="140" r="4"/><circle cx="148" cy="140" r="4"/><circle cx="144" cy="148" r="4"/><circle cx="100" cy="100" r="6"/><circle cx="92" cy="100" r="4"/><circle cx="108" cy="100" r="4"/><circle cx="100" cy="92" r="4"/><circle cx="100" cy="108" r="4"/></g></svg>'
  },
  {
    id: 'kalamkari-cotton',
    name: 'Andhra Kalamkari Hand-drawn',
    material: 'Chanderi Silk-Cotton',
    patternType: 'Natural Dye Pen Artistry',
    colorHex: '#78350f', // Warm Ochre / Brown
    description: 'Printed block/handcrafted pen kalamkari highlighting beautiful peacock motifs and ancient mythology borders.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%237c2d12"/><path d="M 0,100 Q 50,50 100,100 T 200,100" fill="none" stroke="%23fbbf24" stroke-width="4"/><path d="M 0,120 Q 50,70 100,120 T 200,120" fill="none" stroke="%231e3a8a" stroke-width="2"/><g fill="%23f59e0b"><circle cx="100" cy="70" r="16"/><path d="M100,70 Q120,40 100,20 Q80,40 100,70 Z"/></g><circle cx="50" cy="150" r="8" fill="%2310b981"/></svg>'
  },
  {
    id: 'organza-floral',
    name: 'Surat Pastel Organza Print',
    material: 'Glass Organza',
    patternType: 'Digital Floral Print with Zari',
    colorHex: '#db2777', // Soft Pink
    description: 'Ultra-lightweight sheer glass organza saree with elegant pastel digital peony prints and luxury metallic thread details.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23fce7f3"/><g fill="%23ec4899" opacity="0.8"><path d="M 50,40 C 35,20 20,40 50,60 C 80,40 65,20 50,40 Z"/><path d="M 150,140 C 135,120 120,140 150,160 C 180,140 165,120 150,140 Z"/><circle cx="50" cy="50" r="6" fill="%23facc15"/><circle cx="150" cy="150" r="6" fill="%23facc15"/></g><path d="M 0,180 L 200,180" stroke="%23ca8a04" stroke-width="8"/><path d="M 0,180 L 200,180" stroke="%23eaeaea" stroke-width="2" stroke-dasharray="4 4"/></svg>'
  },
  {
    id: 'kanjeevaram-gold',
    name: 'Kanjeevaram Temple Border Silk',
    material: 'Pure Mulberry Silk',
    patternType: 'Heavy Temple Korvai Border',
    colorHex: '#047857', // Forest/Zari Green
    description: 'A masterpiece from Kanchipuram detailing traditional temple gopuram motifs, interlocking borders, and heavy gold zari pallu.',
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23064e3b"/><path d="M 0,160 L 40,120 L 80,160 L 120,120 L 160,160 L 200,120" stroke="%23ca8a04" stroke-width="4" fill="none"/><rect x="0" y="160" width="200" height="40" fill="%23451a03"/><path d="M 0,175 L 200,175" stroke="%23eab308" stroke-width="3" stroke-dasharray="10 5"/><rect x="25" y="40" width="150" height="60" rx="5" fill="none" stroke="%23eab308" stroke-width="2"/></svg>'
  }
];

export interface ModelPreset {
  id: ModelStyle;
  name: string;
  description: string;
  skintone: string;
  age: string;
  pose: string;
}

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'traditional',
    name: 'Traditional Indian Elegance',
    description: 'Classic studio model with elegant bridal-themed hair, detailed bindi, and traditional jewelry.',
    skintone: 'Rich Golden Indian Skin Tone',
    age: '24-28 years old',
    pose: 'Gracefully holding saree pallu on shoulder'
  },
  {
    id: 'contemporary',
    name: 'Contemporary Fusion Model',
    description: 'Modern workspace makeup, minimal sleek jewelry, and relaxed elegant hair representing the urban market.',
    skintone: 'Warm Beige Skin Tone',
    age: '22-26 years old',
    pose: 'Chic editorial standing pose looking at camera'
  },
  {
    id: 'festive_royal',
    name: 'Royal Heritage Festive Model',
    description: 'Grand luxury royal jewelry, heavy traditional maang tikka, bridal styling, and deep expressive eyes.',
    skintone: 'Royal Dusky Indian Skin Tone',
    age: '25-30 years old',
    pose: 'Stately side profile showing beautiful shoulder pleats'
  },
  {
    id: 'studio',
    name: 'Sleek Catalog/E-commerce Model',
    description: 'High-contrast studio lighting, neutral poses, neat hair, and focus entirely on the garment weave.',
    skintone: 'Classic Wheatish Skin Tone',
    age: '23-27 years old',
    pose: 'Clean straight commercial look displaying border details clearly'
  }
];

export interface DrapePreset {
  id: DrapeStyle;
  name: string;
  description: string;
  promptMod: string;
}

export const DRAPE_PRESETS: DrapePreset[] = [
  {
    id: 'nivi',
    name: 'Classic Nivi Drape',
    description: 'Standard drape originating from Andhra Pradesh, displaying the pallu neatly pleated over the left shoulder.',
    promptMod: 'draped in elegant Nivi style, with neat saree pleats resting gracefully over the left shoulder'
  },
  {
    id: 'gujarati',
    name: 'Gujarati Sidha Pallu',
    description: 'Traditional Gujarati style, displaying the decorative pallu in the front over the right shoulder.',
    promptMod: 'draped in classic Sidha Pallu style with the golden and colorful rich pallu spread across the front'
  },
  {
    id: 'lehenga',
    name: 'Festive Lehenga Wrap',
    description: 'Fusion drape styled to look like a lehenga skirt, showcasing fabric volume and grand flare.',
    promptMod: 'draped in beautiful voluminous lehenga-style wrap showing high pleat density and heavy waist detailing'
  },
  {
    id: 'bengali',
    name: 'Bengali Athpourey style',
    description: 'Traditional heavy-crepe drape with a large key bunch ornament on the shoulder corner.',
    promptMod: 'draped in gorgeous traditional Bengali Athpourey box-pleat format with majestic side folds'
  }
];

export interface BackgroundPreset {
  id: BackgroundStyle;
  name: string;
  description: string;
  colorBg: string;
  promptMod: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'haveli',
    name: 'Heritage Rajasthani Haveli',
    description: 'Rustic wooden doors, carved pillars, and rich warm daylight filtering onto textured stone walls.',
    colorBg: 'bg-amber-100',
    promptMod: 'standing in the sandstone courtyard of a heritage Rajasthani Haveli with antique arches'
  },
  {
    id: 'palace',
    name: 'Royal Palace Archway',
    description: 'Luxury marble walls, royal Mughal arch structures, and distant sunset view over water gardens.',
    colorBg: 'bg-orange-50',
    promptMod: 'set against a royal Mughal palace balcony overlooking serene lake fountains at sunset'
  },
  {
    id: 'minimalist',
    name: 'Modern Minimalist Studio',
    description: 'Warm cream clean aesthetics, soft curves, and beautiful subtle botanical shadows on plaster.',
    colorBg: 'bg-stone-100',
    promptMod: 'in a modern high-end architectural studio background with soft warm plaster textures and abstract shapes'
  },
  {
    id: 'festive_lights',
    name: 'Diwali Festive Glow',
    description: 'Golden bokeh, beautifully lit clay diyas, marigold flower garlands, and grand festive atmosphere.',
    colorBg: 'bg-rose-950/20',
    promptMod: 'adorned in a festive Diwali night atmosphere with golden warm glowing bokeh lights and marigold decorations'
  },
  {
    id: 'studio_grey',
    name: 'Neutral Catalog Studio',
    description: 'Professional high-contrast soft grey backdrop suited for wholesale brochures and online B2B websites.',
    colorBg: 'bg-slate-200',
    promptMod: 'in a professional commercial fashion photography studio with neutral grey cyclorama wall and studio lighting'
  }
];

// Provide pre-designed mock generated catalog items to give beautiful, high-fidelity layouts immediately
export const INITIAL_CATALOG: CatalogItem[] = [
  {
    id: 'cat-1',
    swatchId: 'banarasi-brocade',
    swatchImageUrl: SAMPLE_SWATCHES[0].imageUrl,
    title: 'Surat Rajgharan Banquet Silk',
    material: 'Pure Katan Silk Weave',
    patternType: 'Dense Golden Jari embroidery with Butas',
    weaveType: 'Classic Varanasi Jacquard Loom',
    wholesaleMinPrice: 1250,
    wholesaleMaxPrice: 1850,
    description: 'Surat premium heavy silk collection representing direct mill output, featuring intricate Banarasi-inspired golden zari work. Perfect for weddings and high-end bridal retailers.',
    modelStyle: 'traditional',
    drapeStyle: 'nivi',
    backgroundStyle: 'palace',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ratingScore: 98,
    fabricDetails: {
      zariWork: '90% Fine Golden Thread',
      borderWidth: 'Regular (4 Inches)',
      weightGrams: 850,
      suratFactoryLoc: 'Millennium Textile Market, Ring Road, Surat'
    },
    branding: {
      shopName: 'Shree Balaji Fabrics, Surat',
      sku: 'SBF-BANARASI-9020',
      showWholesalePrice: true,
      wholesalePrice: '₹ 1,399 / Saree',
      showBorderBadge: true,
      borderBadgeText: 'BRIDAL SPECIAL',
      watermarkStyle: 'bottom_right',
      customPromoText: 'MOQ: 40 PCS (Full Catalog Set)'
    },
    // We can use a highly refined Indian model photo. Let's make it a high-quality free royalty stock photo of an Indian woman wearing a red saree or generated-alike representation.
    // We can refer to a beautiful CDN model image or build a dynamic fallback beautifully
    modelImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'cat-2',
    swatchId: 'gujarat-bandhani',
    swatchImageUrl: SAMPLE_SWATCHES[1].imageUrl,
    title: 'Millennium Shubh-Laxmi Bandhej Gota',
    material: 'Surat Georgette Fabric',
    patternType: 'Traditional White Tie-Dye dots',
    weaveType: 'Surat Waterjet Powerloom & Gota Embroidery',
    wholesaleMinPrice: 420,
    wholesaleMaxPrice: 650,
    description: 'Perfect for retail festive demands. Highly durable, breathable Surat crinkled georgette base with classic Bandhani printing aesthetics and real-shiny gota border strips.',
    modelStyle: 'traditional',
    drapeStyle: 'gujarati',
    backgroundStyle: 'haveli',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ratingScore: 92,
    fabricDetails: {
      zariWork: 'Handicraft Gota Patti Borders',
      borderWidth: 'Slim (2.5 Inches)',
      weightGrams: 520,
      suratFactoryLoc: 'Avadh Textile Market, Sahara Gate, Surat'
    },
    branding: {
      shopName: 'Balaji Fabrics & Tex',
      sku: 'BB-BANDHNI-042',
      showWholesalePrice: true,
      wholesalePrice: '₹ 499 / Piece',
      showBorderBadge: true,
      borderBadgeText: 'SURAT DIRECT',
      watermarkStyle: 'center',
      customPromoText: 'Minimum Order Value: ₹ 20,000'
    },
    modelImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=700'
  },
  {
    id: 'cat-3',
    swatchId: 'organza-floral',
    swatchImageUrl: SAMPLE_SWATCHES[3].imageUrl,
    title: 'Meera Glass Organza Digital Glow',
    material: 'Sheer Gloss Organza',
    patternType: 'Metallic piping combined with pastel floral print',
    weaveType: 'Multi-filament Fine Warp Satin Loom',
    wholesaleMinPrice: 580,
    wholesaleMaxPrice: 850,
    description: 'Soft-as-air glass organza decorated with trending watercolor floral motifs and an exquisite thin golden borders. Perfect for modern boutiques and summer festive wear.',
    modelStyle: 'contemporary',
    drapeStyle: 'nivi',
    backgroundStyle: 'minimalist',
    createdAt: new Date().toISOString(),
    ratingScore: 96,
    fabricDetails: {
      zariWork: 'Thin Zari Lace piping',
      borderWidth: 'Ultra Slim (1.2 Inches)',
      weightGrams: 390,
      suratFactoryLoc: 'Radha Krishna Textile Market (RKTM), Ring Road, Surat'
    },
    branding: {
      shopName: 'Ambika Garments Wholesalers',
      sku: 'SKU-ORG-FLOW-88',
      showWholesalePrice: true,
      wholesalePrice: '₹ 650 (Net Price)',
      showBorderBadge: true,
      borderBadgeText: 'BOUTIQUE HIT',
      watermarkStyle: 'bottom_right',
      customPromoText: 'Select from 6 Pastel Colors'
    },
    modelImageUrl: 'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=700'
  }
];
