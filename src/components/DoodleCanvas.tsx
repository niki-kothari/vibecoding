import { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, Undo2, Download, Save } from 'lucide-react';

const DOODLE_STORAGE_KEY = '_planner_doodle_data_';
const GALLERY_STORAGE_KEY = '_planner_doodle_gallery_';

interface GalleryItem {
  id: string;
  dataUrl: string;
  createdAt: string;
}

export function DoodleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4a4a4b'); // Default graphite gray
  const [brushSize, setBrushSize] = useState(2);
  const [history, setHistory] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Supported palette colors
  const colors = [
    { name: 'Graphite', hex: '#4a4a4b' }, // Graphite Pencil
    { name: 'Sage', hex: '#6b8260' },     // Forest/Eucalyptus Green
    { name: 'Rose', hex: '#be6b73' },     // Warm Rose/Pink
    { name: 'Sky', hex: '#587c9c' },      // Slate Blue
  ];

  // Fit canvas to containers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retrieve drawing from local storage
    const savedDoodle = localStorage.getItem(DOODLE_STORAGE_KEY);

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = (rect?.width || 300) - 2;
      const height = 150; // Fixed budget height for doodle block

      // Save content before resize
      const tempImg = new Image();
      const currentData = canvas.toDataURL();

      tempImg.onload = () => {
        canvas.width = width;
        canvas.height = height;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Re-draw after resize
        ctx.drawImage(tempImg, 0, 0);
      };
      tempImg.src = currentData;
    };

    // First time render sizing
    canvas.width = (canvas.parentElement?.clientWidth || 300) - 2;
    canvas.height = 150;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If there is a saved state, draw it
    if (savedDoodle) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        // Save to undo history initially
        setHistory([savedDoodle]);
      };
      img.src = savedDoodle;
    }

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Sync to local storage
  const saveToStorage = (dataUrl: string) => {
    try {
      localStorage.setItem(DOODLE_STORAGE_KEY, dataUrl);
    } catch (e) {
      console.warn('Doodle exceeded storage quota, skipped saving:', e);
    }
  };

  const getCoordinates = (e: any): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set brush context
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();

    const { x, y } = getCoordinates(e);
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling when drawing on touch screens
    if (e.touches) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      saveToStorage(dataUrl);
      
      // Update undo history with a limit of 10 states
      setHistory((prev) => {
        const next = [...prev, dataUrl];
        if (next.length > 10) next.shift();
        return next;
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(DOODLE_STORAGE_KEY);
    setHistory([]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length <= 1) {
      clearCanvas();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      saveToStorage(previousState);
      setHistory(newHistory);
    };
    img.src = previousState;
  };

  useEffect(() => {
    const savedGallery = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (savedGallery) {
      try {
        setGallery(JSON.parse(savedGallery));
      } catch (e) {
        console.error('Failed to parse doodle gallery:', e);
      }
    }
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `doodle-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem: GalleryItem = {
      id: `doodle-${Date.now()}`,
      dataUrl,
      createdAt: timestamp,
    };

    const updated = [newItem, ...gallery].slice(0, 4); // Keep top 4 saved doodles for layout spacing
    setGallery(updated);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLoadFromGallery = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      saveToStorage(dataUrl);
      setHistory((prev) => [...prev, dataUrl].slice(-10));
    };
    img.src = dataUrl;
  };

  const handleDeleteFromGallery = (id: string, e: any) => {
    e.stopPropagation(); // Avoid loading the doodle
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="bg-[#fcfaf5] border border-[#e8dfcf] rounded-2xl p-4 flex flex-col h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)]" ref={containerRef} id="planner-doodle-card">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-[#eadeca]" id="doodle-header-row">
        <h3 className="text-sm font-architect text-[#847864] uppercase tracking-wider font-semibold" id="doodle-card-title">
          Doodle pad
        </h3>
        
        {/* Undo, Store, Download, Clear utility controls */}
        <div className="flex items-center gap-1.5" id="doodle-actions">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1 text-[#a5957d] hover:text-[#6b583e] hover:bg-[#f4ebe0] rounded-md transition-colors cursor-pointer disabled:opacity-40"
            title="Undo stroke"
            id="doodle-undo-btn"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSaveToGallery}
            className="p-1 text-[#a5957d] hover:text-[#6b583e] hover:bg-[#f4ebe0] rounded-md transition-colors cursor-pointer"
            title="Store doodle in local gallery"
            id="doodle-save-gallery-btn"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1 text-[#a5957d] hover:text-[#6b583e] hover:bg-[#f4ebe0] rounded-md transition-colors cursor-pointer"
            title="Download canvas as PNG file to local drive"
            id="doodle-download-btn"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-1 text-[#a5957d] hover:text-[#cc5c65] hover:bg-[#fbdfe2] rounded-md transition-colors cursor-pointer"
            title="Clear doodle canvas"
            id="doodle-clear-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full border border-[#f0e7d5] bg-dots bg-[#fcfbf9] rounded-lg overflow-hidden cursor-crosshair h-[150px] mb-2.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]" id="canvas-drawing-area">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none"
          id="drawing-interactive-canvas"
        />
      </div>

      {/* Palette Selectors */}
      <div className="flex items-center justify-between gap-1 mb-2" id="doodle-palette-row">
        <div className="flex items-center gap-1.5" id="doodle-colors-wrapper">
          {colors.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer flex items-center justify-center`}
              style={{
                backgroundColor: c.hex,
                borderColor: color === c.hex ? '#9d8a74' : '#eadbc8',
                transform: color === c.hex ? 'scale(1.2)' : 'scale(1)',
                boxShadow: color === c.hex ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
              title={c.name}
              id={`color-btn-${c.name.toLowerCase()}`}
            >
              {color === c.hex && (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Thickness selection */}
        <div className="flex items-center gap-1.5 text-xs text-[#a5957d]" id="brush-weight-control">
          <span className="font-mono text-[10px]">Brush</span>
          <div className="flex bg-[#f2e7d7] rounded-md p-0.5 gap-0.5" id="brush-weight-pills">
            {([1, 2, 4] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setBrushSize(sz)}
                className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                  brushSize === sz
                    ? 'bg-white text-[#6b583e] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                    : 'text-[#84735c] hover:text-[#5e4f3a]'
                }`}
                id={`brush-size-${sz}-btn`}
              >
                {sz === 1 ? 'Thin' : sz === 2 ? 'Mid' : 'Thick'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <div className="mt-1 pt-2 border-t border-dashed border-[#eadeca]" id="doodle-gallery-container flex flex-col">
          <p className="text-[9px] font-mono uppercase tracking-wider text-[#a5957d] mb-1 font-bold">
            Saved Board (Local):
          </p>
          <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar" id="doodle-gallery-list">
            {gallery.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadFromGallery(item.dataUrl)}
                className="relative group w-11 h-11 border border-[#f0e7d5] rounded-md overflow-hidden bg-white cursor-pointer hover:border-[#9d8a74] transition-all bg-dots shadow-sm shrink-0"
                title="Tap to load this sketch"
                id={`gallery-item-${item.id}`}
              >
                <img
                  src={item.dataUrl}
                  alt="Saved doodle"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={(e) => handleDeleteFromGallery(item.id, e)}
                  className="absolute top-0 right-0 bg-[#cc5c65] text-white w-3.5 h-3.5 rounded-bl flex items-center justify-center text-[9px] font-semibold opacity-0 group-hover:opacity-100 hover:bg-[#b04b53] transition-all"
                  title="Remove saved sketch"
                  id={`gallery-delete-${item.id}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
