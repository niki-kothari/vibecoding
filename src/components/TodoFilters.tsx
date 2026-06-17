import { Search, SortAsc, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, TodoFilter, TodoSort } from '../types';

interface TodoFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sort: TodoSort;
  setSort: (sort: TodoSort) => void;
}

export function TodoFilters({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  sort,
  setSort,
}: TodoFiltersProps) {
  return (
    <div className="bg-white border border-[#e5e5df] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-4" id="todo-filters-panel">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3" id="filters-search-sort-row">
        <div className="relative flex-1" id="search-input-wrapper">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a6a69a]" id="search-icon-span">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="filters-search-input"
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#faf9f6] text-[#1c1c1a] placeholder-[#a6a69a] border border-[#e5e5df] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8ba180] focus:border-[#8ba180] text-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8a8a82] hover:text-[#1c1c1a] cursor-pointer"
              id="clear-search-btn"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2" id="sort-dropdown-wrapper">
          <span className="text-xs font-mono text-[#8a8a82] flex items-center gap-1">
            <SortAsc className="w-3.5 h-3.5" />
            <span>Sort by</span>
          </span>
          <select
            id="filters-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as TodoSort)}
            className="px-3 py-2 bg-[#faf9f6] text-[#1c1c1a] border border-[#e5e5df] rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#8ba180] focus:outline-none focus:border-[#8ba180] transition-all cursor-pointer font-sans"
          >
            <option value="created-desc">Date Created (Newest)</option>
            <option value="created-asc">Date Created (Oldest)</option>
            <option value="due-date">Due Date</option>
            <option value="priority">Priority Level</option>
            <option value="user">User / Assignee</option>
          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#f4f4f1]" />

      {/* Categories scroll & Status Filters */}
      <div className="flex flex-col gap-3.5" id="filters-controls-container">
        {/* Status Tab buttons */}
        <div id="status-filters-group">
          <div className="flex bg-[#faf9f6] p-1 border border-[#e5e5df] rounded-xl gap-1" id="status-tabs-container">
            {(['all', 'active', 'completed'] as const).map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  id={`status-tab-${f}`}
                  onClick={() => setFilter(f)}
                  className={`flex-1 text-center py-2 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1c1c1a] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#e5e5df]'
                      : 'text-[#787870] hover:text-[#1c1c1a]'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories scroll row */}
        <div id="category-filter-group">
          <p className="text-[11px] font-mono text-[#8a8a82] mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filter Category</span>
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 scroll-smooth" id="category-scroller">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`cat-filter-btn-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5a7350] text-white border-[#5a7350]'
                      : 'bg-white text-[#5e5e56] border-[#e5e5df] hover:bg-[#faf9f6]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
