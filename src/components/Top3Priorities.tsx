import { Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo } from '../types';

interface Top3Props {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  user?: any;
}

export function Top3Priorities({ todos, onToggleComplete, user }: Top3Props) {
  // Pull top 3 high-priority incomplete todos. 
  // If there are fewer, fill with medium-priority incomplete todos.
  const highPrios = todos.filter((t) => t.priority === 'high' && !t.completed);
  const midPrios = todos.filter((t) => t.priority === 'medium' && !t.completed);
  const lowPrios = todos.filter((t) => t.priority === 'low' && !t.completed);

  const combined = [...highPrios, ...midPrios, ...lowPrios].slice(0, 3);

  // Fill up empty slots up to 3 for visual display
  const displayItems = Array.from({ length: 3 }).map((_, i) => {
    return combined[i] || null;
  });

  return (
    <div className="bg-[#fef7ee] border border-[#eee0cc] rounded-2xl p-4 flex flex-col justify-between h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)] min-w-0 w-full" id="planner-top-priorities">
      <div>
        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-dashed border-[#ead2ba]" id="top3-title-row">
          <Star className="w-4 h-4 text-[#d48c2a] fill-[#d48c2a]/20" />
          <h3 className="text-sm font-architect text-[#8c7457] uppercase tracking-wider font-semibold" id="top3-title">
            Top 3 Priorities
          </h3>
        </div>

        {/* Priorities lines stack */}
        <div className="flex flex-col gap-3 py-1" id="top3-slot-stack">
          {displayItems.map((item, index) => {
            return (
              <div
                key={item?.id || `empty-${index}`}
                className="flex items-center gap-3 min-h-[38px] relative group"
                id={`priority-slot-wrapper-${index}`}
              >
                {/* Number index label in handwriting style */}
                <span className="text-lg font-hand font-bold text-[#bfa07d] w-4 select-none" id={`prio-num-${index + 1}`}>
                  {index + 1}
                </span>

                {item ? (() => {
                  const isOwner = !user || (() => {
                    if (item.userEmail && user.email) {
                      return item.userEmail.toLowerCase() === user.email.toLowerCase();
                    }
                    if (item.userId) {
                      return item.userId === user.uid;
                    }
                    return true; // starter or local-only tasks
                  })();
                  return (
                    /* Set priority text item with interactive circle check */
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-white/50 hover:bg-white/95 border border-[#eadcce]/60 rounded-xl px-3 py-1.5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]" id={`priority-item-card-${item.id}`}>
                      <p className="text-sm text-[#3a322c] font-sans break-words whitespace-normal pr-4 flex-1 min-w-0" id={`prio-text-${item.id}`} title={item.text}>
                        {item.text}
                      </p>
                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() => onToggleComplete(item.id)}
                          className="flex-shrink-0 w-5 h-5 rounded-full border border-[#d48c2a] hover:bg-[#add2ec]/20 flex items-center justify-center cursor-pointer transition-all focus:outline-none"
                          title="Mark as completed"
                          id={`prio-complete-btn-${item.id}`}
                        >
                          <Check className="w-3 h-3 text-[#d48c2a] opacity-0 hover:opacity-100 transition-opacity stroke-[3]" />
                        </button>
                      ) : (
                        <div className="w-5 h-5 text-[#d48c2a] flex items-center justify-center shrink-0 select-none" title="Read-only: Owned by another user">
                          🔒
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  /* Empty state dashed notebook lines */
                  <div className="flex-1 border-b border-dashed border-[#e6d0bf] py-2 mt-1.5" id={`priority-empty-underline-${index}`}>
                    <span className="text-xs font-hand text-[#ad9985] italic opacity-60">
                      {index === 0 ? 'Add a high priority task...' : 'Next up today...'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-center border-t border-dashed border-[#ead2ba] pt-2" id="top3-footnote">
        <span className="text-[10px] uppercase font-mono text-[#aa9175]">
          Focused, one thing at a time.
        </span>
      </div>
    </div>
  );
}
