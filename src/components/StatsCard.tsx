import { CheckCircle2, ListTodo, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Todo } from '../types';

interface StatsProps {
  todos: Todo[];
}

export function StatsCard({ todos }: StatsProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-[#e5e5df] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]" id="todo-stats-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1c1c1a]" id="stats-title">
            Your Progress
          </h2>
          <p className="text-sm font-mono text-[#787870]" id="stats-subtitle">
            {completed} of {total} tasks completed
          </p>
        </div>
        
        {total > 0 && percentage === 100 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f0f9eb] border border-[#e1f3d8] rounded-full text-[#529b2e] text-xs font-medium self-start md:self-auto" id="stats-trophy">
            <Trophy className="w-3.5 h-3.5" />
            <span>All done! Perfect day.</span>
          </div>
        ) : total > 0 ? (
          <div className="text-right" id="stats-ratio">
            <span className="text-2xl font-bold tracking-tight text-[#1c1c1a] font-sans">
              {percentage}%
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f4f4f5] border border-[#e4e4e7] rounded-full text-[#71717a] text-xs font-medium self-start md:self-auto" id="stats-empty-pill">
            <ListTodo className="w-3.5 h-3.5" />
            <span>Add some goals for today</span>
          </div>
        )}
      </div>

      <div className="relative w-full h-2 bg-[#f4f4f1] rounded-full overflow-hidden" id="stats-progress-bg">
        <motion.div
          id="stats-progress-bar"
          className="h-full bg-gradient-to-r from-[#8ba180] to-[#5a7350] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#f4f4f1]" id="stats-metrics-grid">
        <div className="text-center" id="metric-total">
          <p className="text-xs font-mono text-[#8a8a82]">Total Tasks</p>
          <p className="text-lg font-semibold text-[#1c1c1a] mt-0.5">{total}</p>
        </div>
        <div className="text-center border-x border-[#f4f4f1]" id="metric-pending">
          <p className="text-xs font-mono text-[#8a8a82]">Active</p>
          <p className="text-lg font-semibold text-[#d48c2a] mt-0.5">{total - completed}</p>
        </div>
        <div className="text-center" id="metric-done">
          <p className="text-xs font-mono text-[#8a8a82]">Completed</p>
          <p className="text-lg font-semibold text-[#5a7350] mt-0.5">{completed}</p>
        </div>
      </div>
    </div>
  );
}
