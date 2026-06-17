import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, ReferenceLine, LabelList } from 'recharts';
import { Todo, HydrationLog, CATEGORIES, Priority } from '../types';
import { Calendar, Droplets, Target, PieChart as PieChartIcon } from 'lucide-react';

interface ReportsAnalyticsProps {
  todos: Todo[];
  hydrationLogs: HydrationLog[];
}

export function ReportsAnalytics({ todos, hydrationLogs }: ReportsAnalyticsProps) {
  const [reportType, setReportType] = useState<'hydration' | 'tasks' | 'distribution'>('tasks');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');

  // Colors for charts
  const COLORS = ['#add2ec', '#ce5c65', '#6c8361', '#fbdfe2', '#ebdcc9', '#8a7f6e', '#587c9c'];

  const getLocalDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Memoized data processing
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeDays = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
    
    if (reportType === 'hydration') {
      const data = [];
      for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateStr(d);
        const log = hydrationLogs.find(l => l.date === dateStr);
        data.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          glasses: log ? log.count : 0
        });
      }
      return data;
    } 
    
    if (reportType === 'tasks') {
      const data = [];
      for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateStr(d);
        const completedCount = todos.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)).length;
        data.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: completedCount
        });
      }
      return data;
    }

    if (reportType === 'distribution') {
      const categoryCounts: Record<string, number> = {};
      const priorityCounts: Record<string, number> = { high: 0, medium: 0, low: 0 };
      
      const filteredTodos = timeRange === 'all' ? todos : todos.filter(t => {
        const tDate = new Date(t.createdAt);
        const diffTime = Math.abs(today.getTime() - tDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= rangeDays;
      });

      filteredTodos.forEach(t => {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
      });

      return {
        categories: Object.keys(categoryCounts).map(k => ({ name: k, value: categoryCounts[k] })),
        priorities: Object.keys(priorityCounts).map(k => ({ name: k, value: priorityCounts[k] }))
      };
    }

    return [];
  }, [reportType, timeRange, todos, hydrationLogs]);

  return (
    <div className="lg:pl-8 flex flex-col gap-6" id="tab-reports-container">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mt-3 mb-6" id="reports-tab-header">
         <div className="relative inline-block px-12 py-3.5 mb-2.5">
           <div className="absolute inset-0 bg-[#e8e4f2]/80 rounded-[40px_10px_35px_15px] p-4 scale-y-95 scale-x-105 shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.4)]" />
           <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-amatic font-bold text-[#453c5c] tracking-[0.08em] uppercase select-none">
             Reports & Graphs
           </h1>
         </div>
         <div className="flex items-center gap-1.5 text-xs text-[#8c7e6c] font-mono border-b border-[#ebdcc9] pb-1 px-4">
           <span className="uppercase tracking-wider font-semibold">Activity Analytics</span>
         </div>
       </div>

      <div className="bg-white border border-[#eadeca] rounded-2xl p-5 shadow-sm flex flex-col gap-6" id="analytics-config-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 border-b border-[#f3ebde] pb-5">
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-mono font-bold text-[#8a7f6e] uppercase tracking-wide">Report Type</label>
             <div className="flex bg-[#fdfdfc] border border-[#e8dfcf] p-1 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
               <button
                 onClick={() => setReportType('tasks')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${reportType === 'tasks' ? 'bg-white shadow-sm border border-[#e8dfcf] text-[#453c5c]' : 'text-[#8a7f6e] hover:bg-[#f6f4f0]'}`}
               >
                 <Target className="w-3.5 h-3.5" />
                 Tasks Completed
               </button>
               <button
                 onClick={() => setReportType('hydration')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${reportType === 'hydration' ? 'bg-white shadow-sm border border-[#e8dfcf] text-[#2b5c8f]' : 'text-[#8a7f6e] hover:bg-[#f6f4f0]'}`}
               >
                 <Droplets className="w-3.5 h-3.5" />
                 Hydration
               </button>
               <button
                 onClick={() => setReportType('distribution')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${reportType === 'distribution' ? 'bg-white shadow-sm border border-[#e8dfcf] text-[#ce5c65]' : 'text-[#8a7f6e] hover:bg-[#f6f4f0]'}`}
               >
                 <PieChartIcon className="w-3.5 h-3.5" />
                 Distribution
               </button>
             </div>
           </div>

           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-mono font-bold text-[#8a7f6e] uppercase tracking-wide">Time Range</label>
             <select
               value={timeRange}
               onChange={(e) => setTimeRange(e.target.value as any)}
               className="bg-[#fdfdfc] border border-[#e8dfcf] rounded-xl px-3 py-1.5 text-xs text-[#2c2c2a] shadow-sm focus:outline-none"
             >
               <option value="7days">Last 7 Days</option>
               <option value="30days">Last 30 Days</option>
               <option value="all">All Time</option>
             </select>
           </div>
        </div>

        {/* Charts Container */}
        <div className="h-[320px] w-full" id="chart-render-area">
          {reportType === 'tasks' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-end border-b border-[#f3ebde] pb-3" id="tasks-summary">
                <div>
                  <h3 className="text-xl font-bold text-[#453c5c] font-amatic tracking-wider">Tasks Completion History</h3>
                  <p className="text-xs text-[#8a7f6e] font-mono">Number of tasks completed per day. A good way to measure productivity.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8c7e6c] font-mono uppercase font-bold tracking-wide">Total Completed</span>
                  <div className="text-2xl font-bold text-[#453c5c] font-sans">
                    {(chartData as any[]).reduce((sum, day) => sum + day.completed, 0)} <span className="text-sm text-[#8a7f6e] font-normal">tasks</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="75%">
                <LineChart data={chartData as any[]} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#8a7f6e'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 10, fill: '#8a7f6e'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e8dfcf', fontSize: '12px' }}
                    cursor={{stroke: '#e8dfcf', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8a7f6e' }} />
                  <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="#453c5c" strokeWidth={3} dot={{ r: 4, fill: '#453c5c', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#ce5c65', strokeWidth: 0 }}>
                    <LabelList dataKey="completed" position="top" fill="#8a7f6e" fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'hydration' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-end border-b border-[#f3ebde] pb-3" id="hydration-summary">
                <div>
                  <h3 className="text-xl font-bold text-[#453c5c] font-amatic tracking-wider">Daily Hydration Logs</h3>
                  <p className="text-xs text-[#8a7f6e] font-mono">Glasses of water drank on each day</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8c7e6c] font-mono uppercase font-bold tracking-wide">Today's Progress</span>
                  <div className="text-2xl font-bold text-[#2b5c8f] font-sans">
                    {((chartData as any[])[(chartData as any[]).length - 1]?.glasses) || 0} <span className="text-lg text-[#8a7f6e] font-normal">/ 10</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="75%">
                <BarChart data={chartData as any[]} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#8a7f6e'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 10, fill: '#8a7f6e'}} tickLine={false} axisLine={false} domain={[0, Math.max(10, Math.max(...(chartData as any[]).map(d => d.glasses)))]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e8dfcf', fontSize: '12px' }}
                    cursor={{fill: '#f6f4f0'}}
                  />
                  <ReferenceLine y={10} stroke="#453c5c" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal (10)', fill: '#453c5c', fontSize: 10 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8a7f6e' }} />
                  <Bar dataKey="glasses" name="Glasses Drinked" fill="#add2ec" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="glasses" position="top" fill="#8a7f6e" fontSize={10} formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'distribution' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-end border-b border-[#f3ebde] pb-3" id="distribution-summary">
                <div>
                  <h3 className="text-xl font-bold text-[#453c5c] font-amatic tracking-wider">Overall Task Distribution</h3>
                  <p className="text-xs text-[#8a7f6e] font-mono">Breakdown of your tasks by category and assigned priority.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-around h-full overflow-y-auto">
                <div className="flex flex-col items-center w-full md:w-1/2 h-[280px]">
                  <h3 className="text-xs font-mono font-bold text-[#8a7f6e] mb-2">Tasks by Category</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(chartData as any).categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {((chartData as any).categories || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8a7f6e', textTransform: 'capitalize' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center w-full md:w-1/2 h-[280px]">
                  <h3 className="text-xs font-mono font-bold text-[#8a7f6e] mb-2">Tasks by Priority</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(chartData as any).priorities}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {((chartData as any).priorities || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'high' ? '#ce5c65' : entry.name === 'medium' ? '#eedecb' : '#a1927c'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8a7f6e', textTransform: 'capitalize' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
