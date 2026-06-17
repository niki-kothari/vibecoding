import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Todo, Priority, HydrationLog } from '../types';
import { CheckSquare, AlertTriangle, Flame, GlassWater, BookOpen, Clock, Heart, Plus, Sparkles, Check, Trash2, Edit3, ArrowRight } from 'lucide-react';

interface WorkspaceDashboardProps {
  todos: Todo[];
  onAddTodo: (todo: { text: string; priority: Priority; category: string; dueDate?: string; userEmail?: string; userName?: string }) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  user: any;
  hydrationLogs: HydrationLog[];
  setHydrationLogs: React.Dispatch<React.SetStateAction<HydrationLog[]>>;
}

export function WorkspaceDashboard({
  todos,
  onAddTodo,
  onToggleComplete,
  onDeleteTodo,
  user,
  hydrationLogs,
  setHydrationLogs,
}: WorkspaceDashboardProps) {
  const getLocalDateStr = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const localTodayStr = getLocalDateStr();
  const currentHydration = hydrationLogs.find(l => l.date === localTodayStr)?.count || 0;

  // Local state for dashboard widgets
  const [quickTaskText, setQuickTaskText] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [quickCategory, setQuickCategory] = useState<string>('Work');
  const [quickDueDate, setQuickDueDate] = useState('');
  
  const [waterCount, setWaterCount] = useState(currentHydration);
  const [notesCount, setNotesCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [recentDoodles, setRecentDoodles] = useState<any[]>([]);
  const [quickNotes, setQuickNotes] = useState('');

  // Settle numbers on mount and observe local storage Changes
  useEffect(() => {
    // 1. Water Count
    const savedWater = localStorage.getItem('_planner_water_count_v1_');
    if (savedWater) {
      setWaterCount(parseInt(savedWater, 10));
    }

    // 2. Notes Content and length
    const savedNotes = localStorage.getItem('_planner_scratchpad_notes_');
    if (savedNotes) {
      setQuickNotes(savedNotes);
      setNotesCount(savedNotes.trim().length);
    }

    // 3. Doodle Gallery Count and data
    const savedGallery = localStorage.getItem('_planner_doodle_gallery_');
    if (savedGallery) {
      try {
        const parsed = JSON.parse(savedGallery);
        setGalleryCount(parsed.length);
        setRecentDoodles(parsed);
      } catch (e) {
        console.warn(e);
      }
    }

    // Listen to local storage updates to sync widgets instantly
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === '_planner_water_count_v1_') {
        setWaterCount(parseInt(e.newValue || '0', 10));
      }
      if (e.key === '_planner_scratchpad_notes_') {
        setQuickNotes(e.newValue || '');
        setNotesCount((e.newValue || '').trim().length);
      }
      if (e.key === '_planner_doodle_gallery_') {
        try {
          const parsed = JSON.parse(e.newValue || '[]');
          setGalleryCount(parsed.length);
          setRecentDoodles(parsed);
        } catch (_) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Polling interval fallback for internal React switches
    const interval = setInterval(() => {
      const sw = localStorage.getItem('_planner_water_count_v1_');
      const sn = localStorage.getItem('_planner_scratchpad_notes_');
      const sd = localStorage.getItem('_planner_doodle_gallery_');
      if (sw !== null) setWaterCount(parseInt(sw, 10));
      if (sn !== null) {
        setQuickNotes(sn);
        setNotesCount(sn.trim().length);
      }
      if (sd !== null) {
        try {
          const p = JSON.parse(sd);
          setGalleryCount(p.length);
          setRecentDoodles(p);
        } catch (_) {}
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Update notes helper
  const handleQuickNoteUpdate = (val: string) => {
    setQuickNotes(val);
    setNotesCount(val.trim().length);
    localStorage.setItem('_planner_scratchpad_notes_', val);
  };

  // Quick log water glass helper
  const handleAddGlass = async () => {
    const nextCount = Math.min(waterCount + 1, 10);
    setWaterCount(nextCount);
    localStorage.setItem('_planner_water_count_v1_', nextCount.toString());
    
    // Update global hydration history locally first
    const today = getLocalDateStr();
    setHydrationLogs(prev => {
      const existing = prev.find(l => l.date === today);
      if (existing) {
        return prev.map(l => l.date === today ? { ...l, count: nextCount } : l);
      }
      return [...prev, { date: today, count: nextCount }];
    });

    if (user) {
      try {
        const docRef = doc(db, 'hydrations', today);
        await setDoc(docRef, {
          date: today,
          userId: user.uid,
          count: nextCount,
          target: 10,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'hydrations');
      }
    }

    window.dispatchEvent(new Event('storage'));
  };

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue and Today & Tomorrow counts
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

  const overdueCount = todos.filter((t) => t.dueDate && t.dueDate < todayStr && !t.completed).length;
  const todayTomorrowCount = todos.filter(
    (t) => t.dueDate && (t.dueDate === todayStr || t.dueDate === tomorrowStr) && !t.completed
  ).length;

  // Categories frequency count
  const categories: Record<string, number> = { Work: 0, Personal: 0, Health: 0, Other: 0 };
  todos.forEach((t) => {
    if (categories[t.category] !== undefined) {
      categories[t.category]++;
    }
  });

  // Priorities count
  const priorities: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  todos.forEach((t) => {
    if (priorities[t.priority] !== undefined) {
      priorities[t.priority]++;
    }
  });

  // Handle Quick Task submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskText.trim()) return;

    onAddTodo({
      text: quickTaskText.trim(),
      priority: quickPriority,
      category: quickCategory,
      dueDate: quickDueDate || undefined,
    });

    setQuickTaskText('');
    setQuickDueDate('');
  };

  // SVG Radial Ring helper
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn" id="dashboard-view-panel">
      
      {/* Dynamic Productivity Mantra Banner */}
      <div className="bg-gradient-to-r from-[#8ba180]/30 to-[#587c9c]/20 border border-[#e8dfcf] p-4.5 rounded-2xl flex items-center justify-between gap-4" id="dashboard-mantra-banner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/80 rounded-xl border border-[#e3d5c1] shadow-sm">
            <Sparkles className="w-5 h-5 text-[#6c8361]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#847864] font-bold">Daily Mindful Insight</span>
            <p className="text-xs font-hand text-[#564e43] text-sm font-semibold mt-0.5" id="insight-motto">
              {completionRate === 100 && totalTasks > 0
                ? "✨ Incredible work, Niki! Your workspace checklist is flawless. Take some deep breaths and stay mindful!"
                : completionRate >= 70
                ? "🌱 You're flowing with magnificent focus today. Almost everything is in order!"
                : activeTasks > 0
                ? `📝 You have ${activeTasks} purposeful objectives lined up. Sip some water and let's conquer them step-by-step.`
                : "🍃 Clear slate, calm mind. Create a goal when you're ready to flow."}
            </p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="text-[10px] font-mono text-[#8c7e6c]" id="dashboard-sync-indicator">
          {user ? (
            <span className="bg-[#edf7ee] border border-[#cbe8ce] px-2.5 py-0.5 rounded-full text-[#439647] font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 bg-[#439647] rounded-full animate-ping" />
              Live Workspace Active
            </span>
          ) : (
            <span className="bg-[#f0ece5] border border-[#d2cbba] px-2.5 py-0.5 rounded-full text-[#7a6f5e] font-semibold flex items-center gap-1 shrink-0">
              Local Mode
            </span>
          )}
        </div>
      </div>

      {/* Numerical Bento Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="dashboard-bento-metrics">
        
        {/* Metric 1: Productivity Circle Stats */}
        <div className="bg-white border border-[#eadeca] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden" id="bento-productivity-circle">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#a1927c] mb-2 font-bold">Progress Rate</span>
          
          <div className="relative w-24 h-24 flex items-center justify-center" id="svg-ring-container">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer background ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-transparent"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#f3ece2"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Colored progress line */}
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8ba180" />
                  <stop offset="100%" stopColor="#5a7350" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" id="stat-ratio-label">
              <span className="text-xl font-bold text-[#2c2c2a]">{completionRate}%</span>
              <span className="text-[8px] font-mono text-[#a1927c]">Completed</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active & Completed tasks */}
        <div className="bg-[#fdfbf7] border border-[#eadeca] rounded-2xl p-4 flex flex-col justify-between shadow-sm" id="bento-tasks-breakdown">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#a1927c] font-bold">Tasks Balance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold font-sans text-[#5a7350]">{completedTasks}</span>
              <span className="text-[#a1927c] text-xs font-mono">/ {totalTasks} finished</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#f4ebdf] flex items-center justify-between text-[11px] font-mono text-[#8a7f6e]">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-[#5a7350]" />
              <span>{activeTasks} Pending</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Water Tracker Metric */}
        <div className="bg-[#f6faff] border border-[#e3edf7] rounded-2xl p-4 flex flex-col justify-between shadow-sm" id="bento-hydration-status">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#82afd2] font-bold">Hydration Base</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold font-sans text-[#2b5c8f]">{waterCount}</span>
              <span className="text-[#8ca0b1] text-xs font-mono">/ 10 glasses</span>
            </div>
          </div>
          <button
            onClick={handleAddGlass}
            disabled={waterCount >= 10}
            className={`w-full text-center py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              waterCount >= 10
                ? 'bg-[#edf7ee] text-[#439647] border border-[#cbe8ce]'
                : 'bg-[#add2ec]/40 hover:bg-[#add2ec] text-[#2b5c8f] border border-[#bde2fc]'
            }`}
          >
            <GlassWater className="w-3 h-3" />
            <span>{waterCount >= 10 ? 'Fully Hydrated!' : 'Quick Log Glass +1'}</span>
          </button>
        </div>

        {/* Metric 4: Scribble Gallery count */}
        <div className="bg-[#fffcf7] border border-[#eedecb] rounded-2xl p-4 flex flex-col justify-between shadow-sm animate-fadeIn" id="bento-scribbles-gallery">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#c18641] font-bold">Planner Storage</span>
            <div className="flex flex-col gap-1 mt-1.5" id="inner-metrics">
              <div className="flex justify-between text-xs font-mono text-[#847864]">
                <span>Saved Drawings:</span>
                <span className="font-bold text-[#2c2c2a]">{galleryCount} sketches</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-[#847864]">
                <span>Notes Size:</span>
                <span className="font-bold text-[#2c2c2a]">{notesCount} chars</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#f4ebdf] text-[9.5px] font-mono text-[#ad9e8d] flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#be6b73]" />
            <span>Daily Streak: 1 day</span>
          </div>
        </div>

      </div>

      {/* Main Core Section Layout - Visual Charts & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-graphics-row">
        
        {/* Visual Charts Block (Span 7/12) */}
        <div className="lg:col-span-7 bg-white border border-[#eadeca] rounded-2xl p-5 shadow-sm flex flex-col gap-5" id="dashboard-visual-analytics">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#f3ebde]" id="analytics-header">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#847864] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8a8174]" />
                Interactive Category & Priority Analytics
              </h3>
              <p className="text-[10px] font-mono text-[#a1927c]">Visual layout frequency models from your active todo list</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="charts-distribution">
            
            {/* Category breakdown SVG meters */}
            <div className="flex flex-col gap-3" id="category-frequency">
              <span className="text-[10px] font-mono font-bold text-[#8a7f6e] uppercase tracking-wide">Category Distribution</span>
              <div className="flex flex-col gap-2.5 pt-1.5" id="cat-lines">
                {(Object.entries(categories) as [string, number][]).map(([cat, val]) => {
                  const maxVal = Math.max(...Object.values(categories), 1);
                  const pct = Math.round((val / maxVal) * 100);
                  const catColors: Record<string, string> = {
                    Work: 'bg-[#587c9c]',
                    Personal: 'bg-[#6b8260]',
                    Health: 'bg-[#be6b73]',
                    Other: 'bg-[#d8a436]',
                  };

                  return (
                    <div key={cat} className="flex flex-col gap-1" id={`analytic-cat-bar-${cat}`}>
                      <div className="flex justify-between text-xs font-mono text-[#564e43]" id={`label-row-${cat}`}>
                        <span className="font-medium flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${catColors[cat]}`} />
                          {cat}
                        </span>
                        <span className="font-bold text-[#1c1c1a]" id={`value-${cat}`}>{val} tasks</span>
                      </div>
                      <div className="w-full h-2 bg-[#f4ece2] rounded-full overflow-hidden" id="bg-bar">
                        <motion.div
                          className={`h-full ${catColors[cat]} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority breakdown vertical gauge */}
            <div className="flex flex-col gap-3" id="priority-frequency">
              <span className="text-[10px] font-mono font-bold text-[#8a7f6e] uppercase tracking-wide">Priority Matrix</span>
              <div className="flex flex-col gap-3.5 pt-1" id="prio-gauge">
                {(Object.entries(priorities) as [Priority, number][]).map(([prio, val]) => {
                  const totalPrioCount = Math.max(totalTasks, 1);
                  const pct = Math.round((val / totalPrioCount) * 100);
                  const prioColors: Record<Priority, string> = {
                    high: 'bg-[#ce5c65]',
                    medium: 'bg-[#d98135]',
                    low: 'bg-[#847f78]',
                  };

                  return (
                    <div key={prio} className="flex flex-col gap-1" id={`analytic-prio-bar-${prio}`}>
                      <div className="flex justify-between text-xs font-mono text-[#564e43]">
                        <span className="capitalize font-semibold">{prio} Priority</span>
                        <span className="font-bold text-[#1c1c1a]">{val} ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-[#f5efe5] rounded-lg overflow-hidden" id="bg-prio">
                        <motion.div
                          className={`h-full ${prioColors[prio]} rounded-lg`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Active Planner Task View list (Overview list of 3 items max) */}
          <div className="mt-2 pt-3 border-t border-[#f3ebde]">
            <span className="text-[10px] font-mono font-bold text-[#8a7f6e] uppercase tracking-wide block mb-2">Active Planner Targets</span>
            <div className="flex flex-col gap-2" id="active-list-preview">
              {todos.filter(t => !t.completed).slice(0, 3).map(todo => {
                const isOwner = !user || (() => {
                  if (todo.userEmail && user.email) {
                    return todo.userEmail.toLowerCase() === user.email.toLowerCase();
                  }
                  if (todo.userId) {
                    return todo.userId === user.uid;
                  }
                  return true; // starter / local-only tasks
                })();
                return (
                  <div key={todo.id} className="flex items-center justify-between bg-[#faf8f4] border border-[#eadeca]/60 px-3 py-2 rounded-xl text-xs text-[#2c2c2a] hover:bg-white hover:shadow-sm" id={`dashboard-preview-task-${todo.id}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isOwner ? (
                        <button
                          onClick={() => onToggleComplete(todo.id)}
                          className="w-4.5 h-4.5 rounded-full border border-[#8ba180] flex items-center justify-center cursor-pointer hover:bg-[#fcfcf9]"
                          title="Mark complete"
                          id={`dashboard-check-btn-${todo.id}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-transparent hover:bg-[#8ba180]/40" />
                        </button>
                      ) : (
                        <div className="w-4.5 h-4.5 text-[#8ba180] flex items-center justify-center shrink-0 select-none" title="Read-only: Owned by another user">
                          🔒
                        </div>
                      )}
                      <span className="truncate font-medium font-sans text-xs" title={todo.text}>{todo.text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" id="preview-labels">
                      <span className="text-[8px] font-mono uppercase bg-white border border-[#eadeca] px-1.5 py-0.5 rounded text-[#847864]">{todo.category}</span>
                      {isOwner && (
                        <button
                          onClick={() => onDeleteTodo(todo.id)}
                          className="p-1 hover:text-[#cc5c65] text-[#bdaea1] rounded-md transition-all cursor-pointer"
                          title="Delete task"
                          id={`dashboard-delete-btn-${todo.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {todos.filter(t => !t.completed).length === 0 && (
                <span className="text-center py-2 text-[11px] font-hand text-[#ad9e8d] italic">No active workspace tasks! All caught up!</span>
              )}
            </div>
          </div>

        </div>

        {/* Quick Task Capture & Action Console (Span 5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="dashboard-shortcuts">
          
          {/* Quick Task Adding form Card */}
          <div className="bg-[#fdfbf6] border border-[#eadeca] rounded-2xl p-5 shadow-sm" id="dashboard-quick-add">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#847864] mb-3 pb-1.5 border-b border-[#f3ebde] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#8a8174]" />
              Quick Capture Console
            </h3>

            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3" id="quick-add-form">
              <div id="text-box-wrapper">
                <label className="text-[10px] font-mono text-[#a1927c] mb-1 block">New Task Aim</label>
                <input
                  type="text"
                  value={quickTaskText}
                  onChange={(e) => setQuickTaskText(e.target.value)}
                  placeholder="🍃 Enter a quick goal..."
                  className="w-full bg-[#fdfdfc] border border-[#e8dfcf] rounded-xl px-3.5 py-2 text-xs text-[#2c2c2a] focus:outline-none focus:ring-1 focus:ring-[#8ba180] font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3" id="select-row">
                <div>
                  <label className="text-[10px] font-mono text-[#a1927c] mb-1 block">Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full bg-[#fdfdfc] border border-[#e8dfcf] rounded-xl px-2 py-1.5 text-xs text-[#2c2c2a] focus:outline-none"
                  >
                    <option value="Work">💼 Work</option>
                    <option value="Personal">🌿 Personal</option>
                    <option value="Health">🧘 Health</option>
                    <option value="Other">✨ Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#a1927c] mb-1 block">Priority</label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as Priority)}
                    className="w-full bg-[#fdfdfc] border border-[#e8dfcf] rounded-xl px-2 py-1.5 text-xs text-[#2c2c2a] focus:outline-none"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#a1927c] mb-1 block">Due Date (Optional)</label>
                <input
                  type="date"
                  value={quickDueDate}
                  onChange={(e) => setQuickDueDate(e.target.value)}
                  className="w-full bg-[#fdfdfc] border border-[#e8dfcf] rounded-xl px-3 py-1.5 text-xs text-[#2c2c2a] focus:outline-none focus:ring-1 focus:ring-[#8ba180] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!quickTaskText.trim()}
                className="w-full py-2 bg-[#5a7350] hover:bg-[#43563b] disabled:opacity-40 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer mt-1"
              >
                Capture Task Aim
              </button>
            </form>
          </div>

          {/* Notebook Quick scratchpad buffer preview widget */}
          <div className="bg-[#f3f7fa] border border-[#d2dfeb] rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm" id="dashboard-scratchpad-snippet">
            <div className="flex items-center justify-between pb-1 text-[#4b6a8a]" id="note-preview-header">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#547da3]" />
                Scratchpad Notes Buffer
              </span>
              <span className="text-[9px] font-mono text-[#7ea0bd]">Autosaves sync</span>
            </div>
            <textarea
              value={quickNotes}
              onChange={(e) => handleQuickNoteUpdate(e.target.value)}
              placeholder="🍃 Scribble some notes directly from the dashboard..."
              className="w-full h-[95px] bg-[#fdfdfd] border border-[#d2dfeb] rounded-xl p-2.5 text-xs text-[#2d4b68] font-hand focus:outline-none resize-none"
            />
          </div>

        </div>

      </div>

      {/* Drawing Pad quick preview strip (If gallery doodles exist) */}
      {recentDoodles.length > 0 && (
        <div className="bg-[#fcfaf5] border border-[#eedecb] rounded-2xl p-4" id="dashboard-gallery-strip">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#a5957d] mb-2 block font-extrabold">Recent Scribble gallery cards</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="scribble-cards-list">
            {recentDoodles.slice(0, 4).map((doodle) => (
              <div key={doodle.id} className="border border-[#ebdcc9] bg-white rounded-xl p-2.5 flex flex-col gap-2 relative group shadow-sm bg-dots" id={`dashboard-gallery-card-${doodle.id}`}>
                <div className="w-full h-24 overflow-hidden rounded-lg bg-[#faf8f4] border border-[#eedecb]">
                  <img src={doodle.dataUrl} alt="Quick thumbnail doodle" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-[#a5957d]" id="footer-g">
                  <span>Saved {doodle.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
