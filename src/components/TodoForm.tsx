import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Tag } from 'lucide-react';
import { CATEGORIES, Priority, Todo } from '../types';
import { User } from 'firebase/auth';

interface TodoFormProps {
  onAddTodo: (todoData: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  currentUser?: User | null;
}

export function TodoForm({ onAddTodo, currentUser }: TodoFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Personal');
  const [dueDate, setDueDate] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // Auto-fill user details from authenticated context when signed in
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || '');
      setUserEmail(currentUser.email || '');
    } else {
      setUserName('');
      setUserEmail('');
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddTodo({
      text: text.trim(),
      priority,
      category,
      dueDate: dueDate || undefined,
      userName: userName.trim() || undefined,
      userEmail: userEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset input states, keep preferences for ease or reset to defaults
    setText('');
    setDueDate('');
    setPriority('medium');
    setCategory('Personal');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#e5e5df] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]" id="todo-form">
      <div className="flex flex-col gap-3">
        {/* Main query bar */}
        <div className="flex gap-2" id="form-main-input-wrapper">
          <input
            id="todo-input"
            type="text"
            placeholder="What needs to be done?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#faf9f6] text-[#1c1c1a] placeholder-[#a6a69a] border border-[#e5e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ba180] focus:border-[#8ba180] text-sm transition-all"
            maxLength={120}
            required
          />
          <button
            id="todo-submit-btn"
            type="submit"
            className="px-5 py-3 bg-[#5a7350] hover:bg-[#465b3e] text-white font-medium text-sm rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-98 shadow-[0_2px_4px_rgba(90,115,80,0.15)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Action Pills & Options Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1" id="form-options-row">
          <button
            id="toggle-options-btn"
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-xs font-mono font-medium text-[#787870] hover:text-[#5a7350] flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f6] hover:bg-[#f4f3ef] border border-[#e5e5df] rounded-lg transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-[#8ba180]" />
            <span>{showOptions ? 'Hide Settings' : 'Task Settings'}</span>
            <span className="text-[10px] bg-[#e5e5df] text-[#5e5e56] px-1.5 py-0.2 rounded font-sans">
              {category} • {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          </button>

          {dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-[#5a7350] font-mono px-2.5 py-1 bg-[#f0f9eb] border border-[#e1f3d8] rounded-lg" id="active-due-date-badge">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due: {dueDate}</span>
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="text-[#a6a69a] hover:text-[#e06c75] font-sans font-bold ml-1.5 cursor-pointer"
                title="Clear date"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Options Container */}
        {showOptions && (
          <div className="mt-2 pt-4 border-t border-[#f4f4f1] flex flex-col gap-4" id="form-options-box">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority Selector */}
              <div id="option-priority-group">
                <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                  Priority Level
                </label>
                <div className="flex gap-1" id="priority-choices">
                  {(['low', 'medium', 'high'] as const).map((p) => {
                    const isActive = priority === p;
                    const borderColors = {
                      low: isActive ? 'border-[#8ba180] bg-[#f0f9eb] text-[#529b2e]' : 'border-[#e5e5df] text-[#5e5e56] hover:bg-[#faf9f6]',
                      medium: isActive ? 'border-[#d48c2a] bg-[#fdf6ec] text-[#d48c2a]' : 'border-[#e5e5df] text-[#5e5e56] hover:bg-[#faf9f6]',
                      high: isActive ? 'border-[#e06c75] bg-[#fef0f0] text-[#e06c75]' : 'border-[#e5e5df] text-[#5e5e56] hover:bg-[#faf9f6]',
                    };

                    return (
                      <button
                        key={p}
                        type="button"
                        id={`prio-${p}-btn`}
                        onClick={() => setPriority(p)}
                        className={`flex-1 text-xs py-2 px-2.5 font-medium border rounded-lg transition-all capitalize cursor-pointer text-center ${borderColors[p]}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selector */}
              <div id="option-category-group">
                <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                  Category tag
                </label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-white text-[#1c1c1a] border border-[#e5e5df] rounded-lg focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all cursor-pointer font-sans"
                >
                  {CATEGORIES.filter((cat) => cat !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date Input picker */}
              <div id="option-duedate-group">
                <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                  Due Date
                </label>
                <div className="relative" id="due-date-picker-wrapper">
                  <input
                    id="duedate-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-white text-[#1c1c1a] border border-[#e5e5df] rounded-lg focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* User details inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-dashed border-[#e5e5df]" id="assignee-details-grid">
              <div id="option-username-group">
                <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                  Assignee / User Name
                </label>
                <input
                  id="username-input"
                  type="text"
                  placeholder="e.g. Niki Bhogar"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-white text-[#1c1c1a] border border-[#e5e5df] rounded-lg focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all"
                  maxLength={100}
                />
              </div>

              <div id="option-useremail-group">
                <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="useremail-input"
                  type="email"
                  placeholder="e.g. niki@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full text-xs py-2 px-2.5 bg-white text-[#1c1c1a] border border-[#e5e5df] rounded-lg focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Notes/Important Details textarea */}
            <div id="option-notes-group" className="w-full">
              <label className="block text-xs font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider">
                Task Notes / Necessary Important Details
              </label>
              <textarea
                id="notes-input"
                placeholder="Include description, notes, links or list instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs py-2 px-2.5 bg-white text-[#1c1c1a] border border-[#e5e5df] rounded-lg focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all font-sans resize-none"
                maxLength={1500}
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
