import React, { useState, useEffect } from 'react';
import { Swatch, CatalogItem, FabricAnalysis } from './types';
import { INITIAL_CATALOG, SAMPLE_SWATCHES } from './data';
import SwatchSelector from './components/SwatchSelector';
import CatalogStudio from './components/CatalogStudio';
import LookbookViewer from './components/LookbookViewer';
import ShareModal from './components/ShareModal';
import { Sparkles, ShoppingBag, BookOpen, Layers, IndianRupee, Send, Warehouse, ShieldAlert, BadgeCheck, Trash2, Search, Filter } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'lookbook' | 'inventory'>('studio');
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch>(SAMPLE_SWATCHES[0]);
  const [analysis, setAnalysis] = useState<FabricAnalysis | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Active sharing item State
  const [sharingItem, setSharingItem] = useState<CatalogItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');

  // Trigger analysis whenever a swatch is selected (preset or custom)
  const handleSwatchSelected = async (swatch: Swatch, isCustom: boolean) => {
    setSelectedSwatch(swatch);
    setIsAnalyzing(true);
    
    // Extract base64 and mime mapping if available
    let base64Data = "";
    let mimeType = "image/png";
    
    if (swatch.imageUrl.startsWith('data:')) {
      const parts = swatch.imageUrl.split(',');
      base64Data = parts[1] || "";
      const mimeMatch = swatch.imageUrl.match(/data:(.*?);/);
      mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    }

    try {
      const res = await fetch('/api/analyze-fabric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          mimeType,
          swatchName: swatch.name
        })
      });
      const data = await res.json();
      if (data.result) {
        setAnalysis(data.result);
      }
    } catch (err) {
      console.error("Analysis server connection error, creating default blueprint:", err);
      // Construct fallback analysis
      setAnalysis({
        title: `${swatch.name} Premium Edition`,
        material: swatch.material,
        patternType: swatch.patternType,
        weaveType: 'Powerloom Jacquard weave',
        colorFamily: 'Multi-color Indian accents',
        suggestedWholesaleRange: { min: 450, max: 950 },
        marketPopularity: 92,
        productionEstDays: 6,
        description: swatch.description,
        seoTags: ['#SuratDirectSaree', '#WholesaleTextiles', '#LuxuryDrapedSaree'],
        recommendedImagePrompt: `A gorgeous Indian fashion model wearing a high-end customized ${swatch.name} designer saree, studio lighting, professional e-commerce product posing.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial swatch calibration on load
  useEffect(() => {
    handleSwatchSelected(SAMPLE_SWATCHES[0], false);
  }, []);

  const handleCatalogItemGenerated = (newItem: CatalogItem) => {
    setCatalogItems([newItem, ...catalogItems]);
    // Switch to inventory to let them see their created catalog item!
    setActiveTab('inventory');
  };

  const handleShareClick = (item: CatalogItem) => {
    setSharingItem(item);
    setIsShareOpen(true);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this catalog SKU from your database?")) {
      setCatalogItems(catalogItems.filter(item => item.id !== id));
    }
  };

  // Materials extracted dynamically for filters
  const uniqueMaterials = Array.from(new Set(catalogItems.map(c => c.material.split(' ')[0])));

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.branding.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = selectedMaterial === 'all' || item.material.startsWith(selectedMaterial);
    return matchesSearch && matchesMaterial;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Top Surat Market Badge Banner */}
      <div className="bg-indigo-950 text-indigo-200 px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-indigo-900 shadow-inner">
        <Warehouse size={13} className="text-indigo-400" />
        <span>Surat Textile Market Central Hub (Millennium & Avadh Markets) - Live Wholesale Dispatch Active</span>
        <span className="hidden sm:inline bg-indigo-800 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ml-2">B2B Trade Mode</span>
      </div>

      {/* Main Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span>S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 font-sans">
                SareeSense <span className="text-indigo-600">AI</span>
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold tracking-wider px-2 py-0.5 rounded uppercase">B2B Wholesale</span>
              </h1>
              <p className="text-[11px] text-slate-500">Premium Catalog Maker &amp; digital 3D Lookbooks for Surat Textile Mills</p>
            </div>
          </div>

          {/* Core Metrics Summary */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs text-slate-500 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto justify-around sm:justify-end">
            <div className="text-center sm:text-right">
              <span className="text-slate-400 block uppercase text-[9px] tracking-widest font-semibold">Active Swatches</span>
              <strong className="text-xs text-slate-800 font-bold">{SAMPLE_SWATCHES.length} Loaded</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center sm:text-right">
              <span className="text-slate-400 block uppercase text-[9px] tracking-widest font-semibold">Digital Catalogs</span>
              <strong className="text-xs text-indigo-600 font-extrabold">{catalogItems.length} Created</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center sm:text-right">
              <span className="text-slate-400 block uppercase text-[9px] tracking-widest font-semibold">Surat Connection</span>
              <strong className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                <BadgeCheck size={14} /> Live
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        
        {/* Workspace Quick-Menu Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Layers size={14} />
              <span>Weaving Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('lookbook')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'lookbook'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <BookOpen size={14} />
              <span>3D Digital Lookbook</span>
              <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Flipping</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Active Catalog Inventory</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {catalogItems.length}
              </span>
            </button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Connected to Local Surat Mill Engine v2.5</span>
          </div>
        </div>

        {/* Dynamic Tab Workspace */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* Swatch analysis loader */}
            {isAnalyzing && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800">
                    <Sparkles size={16} className="animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">AI Appraising Threads & Weaving weight...</h4>
                    <p className="text-[10px] text-slate-500">Scanning border patterns for suggested wholesale price markup ranges</p>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-indigo-200 rounded-full overflow-hidden block">
                  <div className="w-1/2 h-full bg-indigo-600 rounded-full animate-infinite-scroll" />
                </div>
              </div>
            )}

            {/* Selector component */}
            <SwatchSelector
              onSwatchSelected={handleSwatchSelected}
              isLoading={isAnalyzing}
            />

            {/* Customizer Studio */}
            <CatalogStudio
              activeSwatch={selectedSwatch}
              analysis={analysis}
              onCatalogItemGenerated={handleCatalogItemGenerated}
              isAnalyzing={isAnalyzing}
            />
          </div>
        )}

        {activeTab === 'lookbook' && (
          <LookbookViewer catalogItems={catalogItems} />
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Filter and Search toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog by SKU, material, title..."
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 text-slate-800 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                  <Filter size={13} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-mono">Fabric Material:</span>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="text-xs font-semibold bg-transparent border-none outline-none text-slate-800 cursor-pointer"
                  >
                    <option value="all">Show All Fabrics</option>
                    {uniqueMaterials.map((mat, i) => (
                      <option key={i} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Saree Catalog Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <ShoppingBag className="mx-auto text-slate-300 mb-3" size={42} />
                <h4 className="text-sm font-bold text-slate-700">No active products found</h4>
                <p className="text-xs text-slate-400 mt-1">Try resetting search filters or upload a fresh design swatch in Weaving Studio!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleShareClick(item)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col relative"
                  >
                    {/* Model Photo container of saree */}
                    <div className="aspect-[3/4] w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.modelImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Floating custom badges */}
                      {item.branding.showBorderBadge && (
                        <div className="absolute top-3 left-3 bg-red-600 text-red-50 font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border border-red-500 font-mono">
                          {item.branding.borderBadgeText}
                        </div>
                      )}

                      {/* Small Swatch overlay bubble in top corner */}
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow">
                        <div className="w-full h-full scale-110" dangerouslySetInnerHTML={{ __html: item.swatchImageUrl }} />
                      </div>

                      {/* Bottom row overlay with key information */}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/5 text-white flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[10px] text-indigo-400 font-bold tracking-wider m-0 uppercase font-mono">SKU: {item.branding.sku}</p>
                          <h3 className="text-xs font-bold text-white tracking-tight truncate m-0 mt-0.5 font-sans">{item.title}</h3>
                        </div>
                        {item.branding.showWholesalePrice && (
                          <div className="shrink-0 text-right">
                            <span className="text-[8px] text-slate-400 block tracking-widest uppercase mb-0.5">WHOLESALE</span>
                            <span className="text-xs font-extrabold text-white">{item.branding.wholesalePrice.split('/')[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Saree catalog textual summary */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5 bg-white">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {item.material}
                          </span>
                          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
                            {item.weaveType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="border-t border-slate-150 pt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Surat Base: {item.fabricDetails.suratFactoryLoc.split(',')[0]}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Trash button */}
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                          
                          <span className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px] transition-colors">
                            <Send size={11} />
                            <span>Share B2B</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sharing Dialog */}
      {sharingItem && (
        <ShareModal
          item={sharingItem}
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false);
            setSharingItem(null);
          }}
        />
      )}

      {/* Elegant Indian-Themed Wholesale Footer footer */}
      <footer className="h-12 bg-white border-t border-slate-200 mt-12 px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Ready
          </div>
          <div className="border-l border-slate-200 pl-4 hidden sm:block">
            Rendering Engine: <span className="font-semibold">V3.4 Turbo-Textile</span>
          </div>
        </div>
        <div className="flex gap-4">
          <span>SareeSense AI Premium Studio</span>
          <span className="font-semibold">Support: +91 98765 43210</span>
        </div>
      </footer>
    </div>
  );
}
