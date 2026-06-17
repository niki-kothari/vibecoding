import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { BookOpen, ArrowLeft, ArrowRight, MapPin, Award, Scale, HelpCircle, CheckCircle } from 'lucide-react';

interface LookbookViewerProps {
  catalogItems: CatalogItem[];
}

export default function LookbookViewer({ catalogItems }: LookbookViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [themeColor, setThemeColor] = useState<string>('#881337'); // Rose/Red by default

  const totalPages = catalogItems.length + 1; // Slide 0 is Cover, subsequent slides are items

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (catalogItems.length === 0) {
    return (
      <div id="lookbook-empty" className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center mt-6">
        <BookOpen className="mx-auto text-slate-300 mb-3" size={42} />
        <h4 className="text-sm font-bold text-slate-700">Digital Lookbook Empty</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Analyze fabric swatches and generate at least one model catalog item to instantly populate your 3D Digital Trade Lookbook.
        </p>
      </div>
    );
  }

  // Active item
  const activeItem = currentPage > 0 ? catalogItems[currentPage - 1] : null;

  return (
    <div id="lookbook-viewer" className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl mt-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-400" size={20} />
            3D Digital Wholesale Lookbook
          </h3>
          <p className="text-xs text-slate-400">Flip leaves to preview the digital brochure shared on WhatsApp to retail partners.</p>
        </div>

        {/* Catalog Theme Selector */}
        <div className="flex items-center gap-2.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">Lookbook Cover Theme:</span>
          <div className="flex items-center gap-1.5">
            {[
              { hex: '#881337', label: 'Crimson' },
              { hex: '#064e3b', label: 'Zari Emerald' },
              { hex: '#4f46e5', label: 'Indigo' },
              { hex: '#7c2d12', label: 'Saffron Rust' },
              { hex: '#0f172a', label: 'Signature Charcoal' }
            ].map((clr) => (
              <button
                key={clr.hex}
                onClick={() => setThemeColor(clr.hex)}
                title={clr.label}
                className={`w-4 h-4 rounded-full border border-white/20 transition-all ${
                  themeColor === clr.hex ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: clr.hex }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lookbook Bound Format binder */}
      <div className="relative mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-[#121824] rounded-2xl overflow-hidden border border-slate-800 min-h-[500px] shadow-2xl relative">
          
          {/* Middle Binder Spine */}
          <div className="hidden md:absolute inset-y-0 left-1/2 -ml-[2px] w-[4px] bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 z-20 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" />

          {/* PAGE LEFT */}
          <div className="p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-950 bg-gradient-to-br from-slate-950 to-slate-900/80 prose-sm relative overflow-hidden">
            {currentPage === 0 ? (
              /* COVER PAGE LEFT DESIGN */
              <div className="my-auto space-y-6 relative z-10">
                <div 
                  className="w-12 h-1.5 rounded-full"
                  style={{ backgroundColor: themeColor }}
                />
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                    SURAT DIRECT WHOLESALE CATALOG
                  </span>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 leading-tight">
                    Shubharambh Saree Portfolio
                  </h1>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                  Premium collection designed for direct-factory retail fulfillment. Crafted utilizing high density automated weaving grids, zari embroideries, and elite drapes.
                </p>

                <div className="border-t border-slate-800 pt-4 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-indigo-400" />
                    <span>Ring Road & Avadh Textile Markets, Surat, Gujarat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={13} className="text-indigo-400" />
                    <span>Mill Master Approved Quality Assurance (IS-9001)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE ITEM SPECS LEFT PAGE */
              activeItem && (
                <div className="my-auto space-y-6 relative z-10 text-white">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest block">
                      WHOLESALE PRODUCT CATALOG PAGE
                    </span>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 leading-snug">
                      {activeItem.title}
                    </h2>
                    <span className="text-xs text-slate-400 mt-1 block font-medium">
                      Fabrics Spec: {activeItem.material} with {activeItem.weaveType}
                    </span>
                  </div>

                  {/* Saree details grid */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block mb-0.5 font-medium">Borders Width</span>
                      <span className="font-semibold text-slate-200">{activeItem.fabricDetails.borderWidth}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5 font-medium">Weave Weight</span>
                      <span className="font-semibold text-slate-200">{activeItem.fabricDetails.weightGrams} Grams (Soft feel)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block mb-0.5 font-medium">Surat Mill Origin</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1">
                        <MapPin size={10} className="text-indigo-400" />
                        {activeItem.fabricDetails.suratFactoryLoc}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-slate-800 pt-2">
                      <span className="text-slate-400 block mb-1 font-medium">Zari & Detailing spec</span>
                      <p className="text-[11px] text-slate-300 leading-normal m-0 font-medium">
                        Heavy {activeItem.fabricDetails.zariWork} embedded meticulously on {activeItem.drapeStyle} pallu folds.
                      </p>
                    </div>
                  </div>

                  {/* Swatch closeness thumbnail */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-800 overflow-hidden shrink-0">
                      <div className="w-full h-full transform scale-110" dangerouslySetInnerHTML={{ __html: activeItem.swatchImageUrl }} />
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-400 block font-mono">SWATCH PATTERN SPEC</span>
                      <span className="font-semibold text-white truncate max-w-[170px] block mt-0.5">
                        {activeItem.patternType || 'Scanned Zari Motif'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Corner numbers */}
            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500">
              {currentPage === 0 ? "SHUBHARAMBH" : `PAGE. 0${currentPage * 2 - 1}`}
            </div>
          </div>

          {/* PAGE RIGHT */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-bl from-slate-950 to-slate-900/80 relative overflow-hidden">
            {currentPage === 0 ? (
              /* COVER PAGE RIGHT DESIGN */
              <div className="my-auto space-y-4 text-center z-10 flex flex-col items-center">
                <div 
                  className="w-48 h-64 rounded-xl border-4 border-slate-700/50 shadow-xl overflow-hidden relative"
                  style={{ borderColor: `${themeColor}cc` }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400"
                    alt="Cover model saree design"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 text-left">
                    <div className="text-white text-xs">
                      <h3 className="font-bold m-0 text-white leading-normal">Katan Silk Edition</h3>
                      <p className="text-[10px] text-slate-300 m-0">SKU-ZARI-9020</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono mt-2">
                  <span>Contains {catalogItems.length} curated wholesale sarees</span>
                </div>
              </div>
            ) : (
              /* SPECIFIC CATALOG ITEM MODEL MODEL RIGHT */
              activeItem && (
                <div className="my-auto relative flex flex-col items-center z-10">
                  <div className="relative w-full aspect-[3/4.2] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                    <img
                      src={activeItem.modelImageUrl}
                      alt="Catalog draped saree"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Badge Banner */}
                    {activeItem.branding.showBorderBadge && (
                      <div className="absolute top-3 left-3 bg-red-600 text-red-50 font-bold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded shadow-md border border-red-500">
                        {activeItem.branding.borderBadgeText}
                      </div>
                    )}

                    {/* Saree price overlay */}
                    {activeItem.branding.showWholesalePrice && (
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
                        <span className="text-[8px] text-indigo-400 font-bold block leading-none">B2B NET PRICE</span>
                        <span className="text-xs font-bold text-white leading-none block mt-0.5">{activeItem.branding.wholesalePrice}</span>
                      </div>
                    )}

                    {/* Watermark identifier */}
                    {activeItem.branding.watermarkStyle === 'center' && (
                      <div className="absolute inset-0 flex items-center justify-center select-none animate-fade-in">
                        <div className="border border-white/20 bg-black/45 text-white/50 text-[9px] uppercase px-3 py-1.5 rotate-12 font-mono">
                          {activeItem.branding.shopName}
                        </div>
                      </div>
                    )}

                    {/* SKU Corner watermark */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/90 py-1 px-2 rounded font-mono text-[8px] text-slate-400">
                      SKU: {activeItem.branding.sku}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Corner numbers */}
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-500">
              {currentPage === 0 ? "EST. 2026" : `PAGE. 0${currentPage * 2}`}
            </div>
          </div>
        </div>

        {/* Catalog Binder Navigation buttons */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            <span>Previous Pages</span>
          </button>

          <div className="text-xs text-slate-400 font-mono">
            Catalog Page <span className="text-white font-bold">{currentPage + 1}</span> of <span className="text-white font-bold">{totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold disabled:opacity-40"
          >
            <span>Next Pages</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
