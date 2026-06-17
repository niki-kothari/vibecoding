import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Check, Trash2, Edit2, AlertCircle, Bookmark, X, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo } from '../types';

interface TodoItemProps {
  key?: string | number;
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (id: string, updatedFields: Partial<Todo>) => void;
  currentUser?: {
    uid: string;
    email?: string | null;
  } | null;
}

export function TodoItem({ todo, onToggleComplete, onDeleteTodo, onUpdateTodo, currentUser }: TodoItemProps) {
  const isOwner = !currentUser || (() => {
    if (todo.userEmail && currentUser.email) {
      return todo.userEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    if (todo.userId) {
      return todo.userId === currentUser.uid;
    }
    return true; // starter or local-only tasks
  })();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
  const [editUserName, setEditUserName] = useState(todo.userName || '');
  const [editUserEmail, setEditUserEmail] = useState(todo.userEmail || '');
  const [editNotes, setEditNotes] = useState(todo.notes || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setEditDueDate(todo.dueDate || '');
    setEditUserName(todo.userName || '');
    setEditUserEmail(todo.userEmail || '');
    setEditNotes(todo.notes || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdateTodo(todo.id, {
      text: editText.trim(),
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate || undefined,
      userName: editUserName.trim() || undefined,
      userEmail: editUserEmail.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Utility to check if a due date is past today's date
  const isOverdue = todo.dueDate && !todo.completed && (() => {
    const todayStr = '2026-06-02'; // Using metadata current year context
    return todo.dueDate < todayStr;
  })();

  const priorityColors = {
    high: {
      bg: 'bg-[#fef0f0]',
      text: 'text-[#e06c75]',
      border: 'border-[#fde2e2]',
      indicator: 'bg-[#e06c75]',
    },
    medium: {
      bg: 'bg-[#fdf6ec]',
      text: 'text-[#d48c2a]',
      border: 'border-[#fdf6ec]',
      indicator: 'bg-[#d48c2a]',
    },
    low: {
      bg: 'bg-[#f0f9eb]',
      text: 'text-[#5a7350]',
      border: 'border-[#e1f3d8]',
      indicator: 'bg-[#8ba180]',
    },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group flex flex-col p-4 bg-white border border-[#e5e5df] rounded-xl transition-all shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:border-[#d5d5cd] ${
        todo.completed ? 'opacity-70 bg-[#faf9f6]' : ''
      }`}
      id={`todo-item-${todo.id}`}
    >
      {isEditing ? (
        /* Edit state layout */
        <div className="flex flex-col gap-3" id={`edit-container-${todo.id}`}>
          <div className="flex items-center gap-2" id={`edit-input-row-${todo.id}`}>
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm px-3 py-2 bg-[#faf9f6] border border-[#e5e5df] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8ba180] text-[#1c1c1a]"
              id={`edit-text-input-${todo.id}`}
              placeholder="Task name"
              required
            />
            <div className="flex gap-1" id={`edit-action-icons-${todo.id}`}>
              <button
                type="button"
                onClick={handleSave}
                className="p-2 text-white bg-[#5a7350] hover:bg-[#465b3e] rounded-lg cursor-pointer transition-colors"
                id={`save-edit-btn-${todo.id}`}
                title="Save Changes"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-[#787870] bg-[#faf9f6] hover:bg-[#e5e5df] border border-[#e5e5df] rounded-lg cursor-pointer transition-colors"
                id={`cancel-edit-btn-${todo.id}`}
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick options adjust in edit mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" id={`edit-options-grid-${todo.id}`}>
            <div>
              <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Priority</label>
              <select
                id={`edit-priority-${todo.id}`}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Category</label>
              <select
                id={`edit-category-${todo.id}`}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a]"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Due Date</label>
              <input
                id={`edit-duedate-${todo.id}`}
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a]"
              />
            </div>
          </div>

          {/* Quick User details adjust in edit mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2" id={`edit-userdata-grid-${todo.id}`}>
            <div>
              <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Assignee Name</label>
              <input
                id={`edit-username-${todo.id}`}
                type="text"
                placeholder="Name"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Assignee Email</label>
              <input
                id={`edit-useremail-${todo.id}`}
                type="email"
                placeholder="Email"
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a]"
              />
            </div>
          </div>

          {/* Quick Notes/Details textarea in edit mode */}
          <div id={`edit-notes-group-${todo.id}`} className="mt-2 text-left">
            <label className="block text-[10px] font-mono text-[#8a8a82] mb-1">Task Notes / Details</label>
            <textarea
              id={`edit-notes-${todo.id}`}
              placeholder="Add details..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
              className="w-full text-xs py-1.5 px-2 bg-white border border-[#e5e5df] rounded-lg text-[#1c1c1a] font-sans resize-none"
            />
          </div>
        </div>
      ) : (
        /* Regular reading state layout */
        <div className="flex items-start justify-between gap-3" id={`todo-view-container-${todo.id}`}>
          {/* Checkbox and Text Container */}
          <div className="flex items-start gap-3 flex-1 min-w-0" id={`info-layout-${todo.id}`}>
            <button
              type="button"
              disabled={!isOwner}
              onClick={() => isOwner && onToggleComplete(todo.id)}
              className={`mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-full border border-[#c3c3b5] bg-white transition-all focus:outline-none ${
                isOwner ? 'hover:border-[#8ba180] cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
              id={`checkbox-${todo.id}`}
              title={isOwner ? 'Toggle Complete' : 'Read-only: This task belongs to another user'}
            >
              <AnimatePresence>
                {todo.completed && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute inset-0 flex items-center justify-center bg-[#5a7350] rounded-full text-white"
                    id={`checkbox-checked-indicator-${todo.id}`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Task core body */}
            <div className="flex-1 min-w-0" id={`task-content-${todo.id}`} onDoubleClick={isOwner ? handleStartEdit : undefined}>
              <p
                id={`todo-text-${todo.id}`}
                className={`text-sm text-[#1c1c1a] font-sans break-words ${
                  todo.completed ? 'line-through text-[#8a8a82] select-none' : ''
                }`}
              >
                {todo.text}
              </p>

              {/* Tag Badges row */}
              <div className="flex flex-wrap gap-2 mt-2" id={`badges-row-${todo.id}`}>
                {/* Category label */}
                <div
                  className="flex items-center gap-1 text-[11px] font-medium text-[#787870] px-1.5 py-0.5 bg-[#f4f4f1] border border-[#e5e5df] rounded-md"
                  id={`cat-badge-${todo.id}`}
                >
                  <Bookmark className="w-2.5 h-2.5" />
                  <span>{todo.category}</span>
                </div>

                {/* Priority Label */}
                <span
                  id={`priority-badge-${todo.id}`}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${priorityColors[todo.priority].bg} ${priorityColors[todo.priority].text} ${priorityColors[todo.priority].border}`}
                >
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </span>

                 {/* Due Date label */}
                {todo.dueDate && (
                  <div
                    id={`duedate-badge-${todo.id}`}
                    className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md border ${
                      isOverdue
                        ? 'bg-[#fef0f0] border-[#fde2e2] text-[#e06c75] font-semibold animate-pulse'
                        : todo.completed
                        ? 'bg-[#faf9f6] border-[#e4e4e7] text-[#a1a1aa]'
                        : 'bg-[#faf9f6] border-[#e5e5df] text-[#5e5e56]'
                    }`}
                  >
                    {isOverdue ? (
                      <AlertCircle className="w-3 h-3 text-[#e06c75]" />
                    ) : (
                      <Calendar className="w-2.5 h-2.5" />
                    )}
                    <span>{todo.dueDate}</span>
                    {isOverdue && <span className="font-mono text-[9px] uppercase">Overdue</span>}
                  </div>
                )}

                {/* Completed date/time badge */}
                {todo.completed && todo.completedAt && (
                  <div
                    id={`completed-badge-${todo.id}`}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-1.5 py-0.5 bg-[#f0f9eb] border border-[#e1f3d8] text-[#5a7350] rounded-md"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>✓ Completed {new Date(todo.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}

                {/* Assignee / Creator profile details badge */}
                {(todo.userName || todo.userEmail) && (
                  <div
                    id={`assignee-badge-${todo.id}`}
                    className="flex items-center gap-1.5 text-[11px] text-[#716e61] font-mono px-1.5 py-0.5 bg-[#fcfaf4] border border-[#e8dec9] rounded-md"
                    title={`Assignee Details: ${todo.userName || ''} (${todo.userEmail || ''})`}
                  >
                    <span>👤</span>
                    <span className="truncate max-w-[150px]">
                      {todo.userName || 'Assignee'}{' '}
                      {todo.userEmail ? `<${todo.userEmail}>` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Collapsible/indented Notes layout block */}
              {todo.notes && (
                <div 
                  className="mt-2.5 text-xs text-[#6e6e66] bg-[#faf8f2] border-l-2 border-[#d5ccbc] pl-2.5 pr-1.5 py-1.5 rounded-r-md leading-relaxed font-sans"
                  id={`notes-content-${todo.id}`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#a3947f] mb-0.5 font-bold">Details</p>
                  <p className="whitespace-pre-wrap">{todo.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (Shown on hover desktop/always visible mobile) */}
          {isOwner ? (
            <div
              className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              id={`actions-row-${todo.id}`}
            >
              <button
                type="button"
                onClick={handleStartEdit}
                className="p-1.5 text-[#787870] hover:text-[#5a7350] hover:bg-[#faf9f6] rounded-md transition-all cursor-pointer"
                id={`edit-trigger-${todo.id}`}
                title="Edit Task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTodo(todo.id)}
                className="p-1.5 text-[#787870] hover:text-[#e06c75] hover:bg-[#faf9f6] rounded-md transition-all cursor-pointer"
                id={`delete-trigger-${todo.id}`}
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center text-[#91816b] bg-[#fbf9f4] border border-[#eadeca] rounded-md px-2 py-1 text-[10px] font-mono font-medium gap-1 shrink-0" title="This task belongs to another user (Read-only)">
              <Lock className="w-3 h-3" />
              <span>Read-only</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// AnimatePresence helper export for rendering transition animations in lists
export { AnimatePresence };
