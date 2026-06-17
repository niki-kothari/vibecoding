import React, { useState, useEffect, useRef } from 'react';
import { Swatch, ModelStyle, DrapeStyle, BackgroundStyle, BrandingConfig, FabricAnalysis, CatalogItem } from '../types';
import { MODEL_PRESETS, DRAPE_PRESETS, BACKGROUND_PRESETS } from '../data';
import { Sparkles, ShoppingBag, Eye, RefreshCw, Wand2, Plus, ArrowRight, Tag, Bookmark, Check, Download, Share2, HelpCircle } from 'lucide-react';

interface CatalogStudioProps {
  activeSwatch: Swatch;
  analysis: FabricAnalysis | null;
  onCatalogItemGenerated: (item: CatalogItem) => void;
  isAnalyzing: boolean;
}

export default function CatalogStudio({ activeSwatch, analysis, onCatalogItemGenerated, isAnalyzing }: CatalogStudioProps) {
  // Model Parameters state
  const [modelStyle, setModelStyle] = useState<ModelStyle>('traditional');
  const [drapeStyle, setDrapeStyle] = useState<DrapeStyle>('nivi');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('palace');

  // Branding Customization state
  const [shopName, setShopName] = useState<string>('Shree Balaji Fabrics, Surat');
  const [sku, setSku] = useState<string>('SBF-SILK-408');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [wholesalePrice, setWholesalePrice] = useState<string>('₹ 550 / Saree');
  const [showBorderBadge, setShowBorderBadge] = useState<boolean>(true);
  const [borderBadgeText, setBorderBadgeText] = useState<string>('BEST SELLER');
  const [watermarkStyle, setWatermarkStyle] = useState<'center' | 'bottom_right' | 'none'>('bottom_right');
  const [customPromoText, setCustomPromoText] = useState<string>('Min MOQ: 30 Saree sets');

  const [loading, setLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isInteractiveCanvas, setIsInteractiveCanvas] = useState<boolean>(true);

  // Sync SKU and prices with analysis once parsed
  useEffect(() => {
    if (analysis) {
      const generatedSku = `SBF-${analysis.material.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSku(generatedSku);
      setWholesalePrice(`₹ ${analysis.suggestedWholesaleRange.min} (Surat Factory Net)`);
    }
  }, [analysis]);

  // Set default mockup image based on swatch selected
  useEffect(() => {
    if (activeSwatch) {
      if (activeSwatch.id === 'banarasi-brocade') {
        setGeneratedImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=700');
      } else if (activeSwatch.id === 'gujarat-bandhani') {
        setGeneratedImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=700');
      } else if (activeSwatch.id === 'organza-floral') {
        setGeneratedImage('https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=700');
      } else {
        setGeneratedImage('https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=700');
      }
    }
  }, [activeSwatch]);

  const handleGenerateLookbook = async () => {
    setLoading(true);

    // Formulate descriptive engineering prompt
    const chosenModel = MODEL_PRESETS.find(m => m.id === modelStyle);
    const chosenDrape = DRAPE_PRESETS.find(d => d.id === drapeStyle);
    const chosenBackground = BACKGROUND_PRESETS.find(b => b.id === backgroundStyle);

    const detailedPrompt = `High fidelity editorial catalog portrait photography: A graceful ${chosenModel?.age || '25 years old'} Indian model with ${chosenModel?.skintone || 'glowing skin'}, posing ${chosenModel?.pose || 'gracefully'}. She is elegantly styled in a saree made of ${analysis?.material || activeSwatch.material || 'fine silk'} featuring intricate ${analysis?.patternType || activeSwatch.patternType || 'embroidery'}. The saree is beautiful and ${chosenDrape?.promptMod || 'neat drape style'}. The model is ${chosenBackground?.promptMod || 'scenic landscape studio background'}. Commercial textile catalog aesthetic, golden hour lighting, cinematic luxury dress.`;

    try {
      const response = await fetch('/api/generate-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: detailedPrompt,
          modelStyle,
          backgroundStyle,
          drapeStyle,
          swatchId: activeSwatch.id
        })
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);

        // Build a fresh B2B Catalog item
        const newItem: CatalogItem = {
          id: `cat-${Date.now()}`,
          swatchId: activeSwatch.id,
          swatchImageUrl: activeSwatch.imageUrl,
          title: analysis?.title || `${activeSwatch.name} Elegant Edition`,
          material: analysis?.material || activeSwatch.material,
          patternType: analysis?.patternType || activeSwatch.patternType,
          weaveType: analysis?.weaveType || 'Surat Modern Weave',
          wholesaleMinPrice: analysis?.suggestedWholesaleRange.min || 450,
          wholesaleMaxPrice: analysis?.suggestedWholesaleRange.max || 900,
          description: analysis?.description || activeSwatch.description,
          modelStyle,
          drapeStyle,
          backgroundStyle,
          createdAt: new Date().toISOString(),
          ratingScore: analysis?.marketPopularity || 94,
          fabricDetails: {
            zariWork: analysis?.patternType || 'Interlocking zari',
            borderWidth: 'Sleek (3 Inches)',
            weightGrams: 420 + Math.floor(Math.random() * 200),
            suratFactoryLoc: 'Avadh Textile Market, Ring Road, Surat'
          },
          branding: {
            shopName,
            sku,
            showWholesalePrice: showPrice,
            wholesalePrice,
            showBorderBadge,
            borderBadgeText,
            watermarkStyle,
            customPromoText
          },
          modelImageUrl: data.imageUrl
        };

        onCatalogItemGenerated(newItem);
      }
    } catch (err) {
      console.error("Generator endpoint failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRawImage = () => {
    // Generate a downloadable copy
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${sku}-sareesense-catalog.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="catalog-studio" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
      {/* Parameters Panel - Left */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Step 2: Customize Visuals & Model Styling
          </h3>
          <p className="text-xs text-slate-500">Select model, drape style, and custom textile branding details.</p>
        </div>

        {/* Model Scenery Settings */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Style & Presentation</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MODEL_PRESETS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModelStyle(m.id)}
                className={`text-left p-3 rounded-xl border transition-all text-xs ${
                  modelStyle === m.id
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-800 line-clamp-1">{m.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{m.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Draping Format */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Traditional Draping Style</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DRAPE_PRESETS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDrapeStyle(d.id)}
                className={`text-left p-3 rounded-xl border transition-all text-xs ${
                  drapeStyle === d.id
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-800 line-clamp-1">{d.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{d.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Atmosphere */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scenic Environment Backdrop</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {BACKGROUND_PRESETS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackgroundStyle(bg.id)}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs relative ${
                  backgroundStyle === bg.id
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3.5 h-3.5 rounded-full ${bg.colorBg} border border-slate-200 block shadow-inner`} />
                  <span className="font-bold text-slate-800 line-clamp-1">{bg.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{bg.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Branding & Overlay custom parameters */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Wholesale Branding Config</span>
            <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-semibold">B2B Overlays</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Mill Logo / Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Millennium Fabrics, Surat"
                className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Saree SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-ZARI-902"
                className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Border Badge Banner</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBorderBadge(!showBorderBadge)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors font-bold ${
                    showBorderBadge ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {showBorderBadge ? 'ON' : 'OFF'}
                </button>
                <input
                  type="text"
                  disabled={!showBorderBadge}
                  value={borderBadgeText}
                  onChange={(e) => setBorderBadgeText(e.target.value)}
                  placeholder="EXECUTIVE HIT"
                  className="w-full text-xs border border-slate-205 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Wholesale Price Badge</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrice(!showPrice)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors font-bold ${
                    showPrice ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {showPrice ? 'ON' : 'OFF'}
                </button>
                <input
                  type="text"
                  disabled={!showPrice}
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  placeholder="₹ 450 (MOQ 40 Sets)"
                  className="w-full text-xs border border-slate-205 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Watermark Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'center', 'bottom_right'] as const).map((wt) => (
                  <button
                    key={wt}
                    type="button"
                    onClick={() => setWatermarkStyle(wt)}
                    className={`px-2 py-1.5 rounded-lg border text-xs text-center transition-colors font-bold capitalize ${
                      watermarkStyle === wt ? 'bg-indigo-950 text-white border-indigo-950' : 'bg-slate-100 text-slate-655 border-slate-200 hover:bg-slate-200/60'
                    }`}
                  >
                    {wt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Promotional Offer Disclaimer</label>
              <input
                type="text"
                value={customPromoText}
                onChange={(e) => setCustomPromoText(e.target.value)}
                placeholder="MOQ: 1 Box set (4 unique colors)"
                className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Generate Engine trigger */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGenerateLookbook}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Weaving Custom Saree Studio...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Instantly Generate model-worn Photo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Workspace Preview - Right */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900 shadow-xl overflow-hidden relative group">
          {/* Top subtle visual strip */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Live B2B Model Viewer
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadRawImage}
                title="Download Custom Image"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Realistic Canvas Preview Frame */}
          <div className="relative aspect-[3/4] bg-radial from-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-3 z-10 p-6 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center" />
                  <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Gemini Draping Fabric...</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Creating model folds, shadow matching, and Studio Milieus</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {/* Generated raw photo */}
                <img
                  src={generatedImage}
                  alt="Saree design model"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Simulated Center Watermark Overlay - Center */}
                {watermarkStyle === 'center' && (
                  <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                    <div className="bg-black/50 border border-white/20 backdrop-blur-[1px] text-white/50 text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-lg -rotate-12 border-dashed">
                      {shopName || "SAREESENSE STUDIO"}
                    </div>
                  </div>
                )}

                {/* Interactive Merchant Corner Pricing Badge overlay */}
                {showPrice && (
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2.5 rounded-xl border border-white/10 shadow-lg select-none pointer-events-none flex flex-col space-y-0.5 animate-fade-in max-w-[170px]">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">WHOLESALE RATE</span>
                    <span className="text-xs font-extrabold text-white tracking-tight">{wholesalePrice}</span>
                    <span className="text-[9px] text-slate-400 line-clamp-1">{customPromoText}</span>
                  </div>
                )}

                {/* Interactive Border Badge Overlay (Top Corner) */}
                {showBorderBadge && (
                  <div className="absolute top-4 left-4 bg-red-600 text-red-50 font-bold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded shadow-md border border-red-500">
                    {borderBadgeText}
                  </div>
                )}

                {/* Interactive Bottom Right Branding Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 select-none pointer-events-none max-w-[150px]">
                  <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tight truncate">{shopName}</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">SKU: {sku}</p>
                  <div className="flex items-center gap-1 mt-1 border-t border-slate-100 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSwatch.colorHex }} />
                    <span className="text-[8px] text-slate-450 truncate">{activeSwatch.name}</span>
                  </div>
                </div>

                {/* Quick Swatch Overlay (Faded representation on shoulder corner to simulate real fabric) */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-xl border-2 border-white/80 shadow-md overflow-hidden bg-slate-200">
                  <div className="w-full h-full transform scale-110" dangerouslySetInnerHTML={{ __html: activeSwatch.imageUrl }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center">
                    <span className="text-[7px] text-white font-bold pb-0.5 font-mono">SWATCH</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time calculated specifications summary */}
        {analysis && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-50 pb-3 font-sans">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Material Appraisal</h4>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{analysis.title}</div>
              </div>
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-3 py-1 text-xs font-bold leading-none">
                {analysis.marketPopularity}% Match
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Determined Weave</span>
                <span className="font-bold text-slate-700">{analysis.weaveType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Fabric Composition</span>
                <span className="font-bold text-slate-700">{analysis.material}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Pattern Motif</span>
                <span className="font-bold text-slate-700">{analysis.patternType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Estimated Lead Time</span>
                <span className="font-bold text-slate-700">~{analysis.productionEstDays} Factory Days</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
              {analysis.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.seoTags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-indigo-50 border border-indigo-100/40 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
