import { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

const NOTES_STORAGE_KEY = '_planner_scratchpad_notes_';

export function NotesArea() {
  const [content, setContent] = useState('');

  // Load from storage
  useEffect(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) {
      setContent(saved);
    }
  }, []);

  const handleUpdate = (val: string) => {
    setContent(val);
    localStorage.setItem(NOTES_STORAGE_KEY, val);
  };

  return (
    <div className="bg-[#f2f6fa] border border-[#d9e2ea] rounded-2xl p-4 flex flex-col h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)]" id="planner-notes-card">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-[#c6d4df]" id="notes-header">
        <div className="flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-[#59758f]" />
          <h3 className="text-sm font-architect text-[#59758f] uppercase tracking-wider font-semibold" id="notes-title">
            Quick Notes
          </h3>
        </div>
        {content && (
          <span className="text-[9px] font-mono text-[#8ca0b1]">
            Autosaved
          </span>
        )}
      </div>

      {/* Textarea on blue dots grid */}
      <div className="relative flex-1" id="notes-textarea-wrapper">
        <textarea
          value={content}
          onChange={(e) => handleUpdate(e.target.value)}
          placeholder="🍃 Type some quick thoughts, phone numbers, or grocery lists here. They are saved instantly!"
          className="w-full h-[150px] bg-dots bg-[#f5f8fc] border border-[#e2eaf1] rounded-xl p-3 text-sm text-[#273d52] placeholder-[#8ea0b1]/70 font-hand focus:outline-none focus:ring-1 focus:ring-[#8fa6bd] resize-none leading-relaxed shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)]"
          id="notes-scratchpad-input"
        />
      </div>
    </div>
  );
}
