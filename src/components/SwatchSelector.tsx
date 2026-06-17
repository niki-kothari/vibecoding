import React, { useState, useRef } from 'react';
import { Swatch } from '../types';
import { SAMPLE_SWATCHES } from '../data';
import { Sparkles, Upload, FileImage, ShieldCheck, RefreshCw } from 'lucide-react';

interface SwatchSelectorProps {
  onSwatchSelected: (swatch: Swatch, isCustom: boolean) => void;
  isLoading: boolean;
}

export default function SwatchSelector({ onSwatchSelected, isLoading }: SwatchSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_SWATCHES[0].id);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [customSwatchUrl, setCustomSwatchUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (swatch: Swatch) => {
    setSelectedId(swatch.id);
    setCustomSwatchUrl(null);
    onSwatchSelected(swatch, false);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG)');
      return;
    }

    setScanning(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomSwatchUrl(dataUrl);
      setSelectedId('custom');

      // Create a temporary custom swatch object
      const customSwatch: Swatch = {
        id: 'custom',
        name: file.name.replace(/\.[^/.]+$/, "") || 'Custom Fabric Swatch',
        imageUrl: dataUrl,
        material: 'Premium Custom Fabric',
        patternType: 'Scanned Pattern Print',
        colorHex: '#64748b',
        description: 'Custom fabric swatch uploaded by wholesaler.'
      };

      // Simulate a premium radar sweep fabric scan
      setTimeout(() => {
        setScanning(false);
        onSwatchSelected(customSwatch, true);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="swatch-selector" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            Step 1: Select Swatch or Pattern
          </h3>
          <p className="text-xs text-slate-500">Pick a trade material preset or drop your own fabric border swatch</p>
        </div>
        <div className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-100 uppercase tracking-wider">
          <Sparkles size={11} />
          <span>Surat Direct Scan</span>
        </div>
      </div>

      {/* Drag & Drop Upload Block */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {scanning ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
              <RefreshCw className="text-indigo-600 animate-spin" size={24} />
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 animate-bounce"></div>
            </div>
            <p className="text-xs font-semibold text-slate-700 animate-pulse">AI Appraising Weave Texture...</p>
            <p className="text-[10px] text-slate-400 text-center px-4">Calibrating silk threads & zari weight</p>
          </div>
        ) : customSwatchUrl ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-indigo-500 shadow-md">
              <img
                src={customSwatchUrl}
                alt="Custom uploaded swatch"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <ShieldCheck size={18} className="text-emerald-400 fill-black/30" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-800">Scanned: Custom Fabric Base</p>
            <span className="text-[10px] text-indigo-600 hover:underline font-bold">Click to change photograph</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2 transition-transform hover:scale-105">
              <Upload size={16} />
            </div>
            <p className="text-xs font-medium text-slate-700">
              <span className="text-indigo-600 font-bold">Click to upload swatches</span> or drag & drop files
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Supports camera snapshots of rolls, designs or zari borders</p>
          </div>
        )}

        {/* Laser scanner grid mock element */}
        {scanning && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)] animate-pulse" />
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surat Market Best-Sellers</span>
          {customSwatchUrl && (
            <button
              onClick={() => {
                setCustomSwatchUrl(null);
                handleSelectPreset(SAMPLE_SWATCHES[0]);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Reset to Presets
            </button>
          )}
        </div>
        
        {/* Preset Cards Scroll/Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SAMPLE_SWATCHES.map((sw) => (
            <button
              key={sw.id}
              onClick={() => handleSelectPreset(sw)}
              className={`group relative text-left rounded-xl overflow-hidden border p-2 transition-all duration-200 ${
                selectedId === sw.id && !customSwatchUrl
                  ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm bg-indigo-50/10'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Swatch visual render box */}
              <div className="aspect-square w-full rounded-lg bg-slate-100 overflow-hidden mb-2 relative">
                <div className="w-full h-full transform group-hover:scale-102 transition-all duration-300 flex items-center justify-center">
                  <div className="w-full h-full animate-fade-in" dangerouslySetInnerHTML={{ __html: sw.imageUrl }} />
                </div>
                {/* Visual material type tag */}
                <div className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                  {sw.material.split(' ')[0]}
                </div>
              </div>
              
              <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {sw.name}
              </p>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {sw.patternType}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
