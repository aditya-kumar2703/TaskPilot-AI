import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Task } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
}

export default function AnalyticsView({ tasks }: AnalyticsViewProps) {
  
  // Calculate stats based on tasks
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;
  
  const totalFocusMins = tasks.reduce((acc, curr) => {
    return acc + (curr.completed ? curr.estimatedDuration : curr.progress / 100 * curr.estimatedDuration);
  }, 0);
  const focusHours = totalFocusMins / 60;

  // Execution Score Calculation
  const executionScore = Math.max(
    0, 
    Math.min(
      100, 
      Math.round(
        (completedTasks.length * 40 + 
        tasks.filter(t => t.progress > 50).length * 20 + 
        tasks.filter(t => t.aiRisk === 'low').length * 20) / Math.max(tasks.length, 1) * 1.25
      )
    )
  );

  // Chart 1 Data: Weekly Productivity
  const weeklyData = [
    { name: 'Mon', tasks: 3, hours: 4.5 },
    { name: 'Tue', tasks: 4, hours: 5.2 },
    { name: 'Wed', tasks: 2, hours: 3.0 },
    { name: 'Thu', tasks: 5, hours: 6.8 },
    { name: 'Fri', tasks: 4, hours: 4.8 },
    { name: 'Sat', tasks: 1, hours: 1.5 },
    { name: 'Sun', tasks: 0, hours: 0 },
  ];

  // Chart 2 Data: Task Categories distribution
  const categoriesMap = tasks.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#2563EB', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];
  const categoryData = Object.keys(categoriesMap).map((key, index) => ({
    name: key,
    value: categoriesMap[key],
    color: COLORS[index % COLORS.length],
  }));

  const defaultCategoryData = [
    { name: 'Work', value: 4, color: '#2563EB' },
    { name: 'Personal', value: 2, color: '#8B5CF6' },
    { name: 'Study', value: 3, color: '#F59E0B' },
    { name: 'Health', value: 1, color: '#10B981' },
  ];

  const finalCategoryData = categoryData.length > 0 ? categoryData : defaultCategoryData;

  // Chart 3 Data: Deadline Risk Trends (Area Chart)
  const riskTrends = [
    { week: 'Wk 23', highRisk: 4, completedOnTime: 8 },
    { week: 'Wk 24', highRisk: 3, completedOnTime: 11 },
    { week: 'Wk 25', highRisk: 5, completedOnTime: 9 },
    { week: 'Wk 26', highRisk: 2, completedOnTime: 14 },
    { week: 'Wk 27', highRisk: 1, completedOnTime: 15 },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Grid */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight">System Performance Analytics</h1>
        <p className="text-sm text-slate-500 mt-2">Deep statistics examining completion rates, focus indices, and AI-modeled risk trends.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Execution Score */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-48">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Execution Index</span>
            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-6xl font-sans font-black text-slate-900 tracking-tight">{executionScore}</span>
            <span className="text-sm font-mono font-bold text-slate-400">/100</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Highly optimal completion trajectory
          </span>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-48">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Success Rate</span>
            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 flex items-center justify-center">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-6xl font-sans font-black text-slate-900 tracking-tight">{completionRate}%</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Zap className="h-4 w-4 text-amber-500" />
            Milestones completed on schedule
          </span>
        </div>

        {/* Card 3: Focus Hours */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-48">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Active Focus</span>
            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-6xl font-sans font-black text-slate-900 tracking-tight">{focusHours.toFixed(1)}</span>
            <span className="text-sm font-mono font-bold text-slate-400">Hours</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Flame className="h-4 w-4 text-rose-500" />
            Focus session streaks preserved
          </span>
        </div>

      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Weekly Productivity Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-mono">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Productivity Distribution</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mins vs Tasks</span>
          </div>

          <div className="h-80 w-full text-xs font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="tasks" fill="#2563EB" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                <Bar dataKey="hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Focus Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Categories distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-mono">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Categories</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weighting</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-sans font-black text-slate-900 tracking-tight">{tasks.length}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono mt-1">Total Tasks</span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            {finalCategoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 font-bold">{cat.value} deliverables</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Deadline Risk Trends (Area Chart) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-mono">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Model Risk Over Time</h3>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">High risk vs completed</span>
          </div>

          <div className="h-72 w-full text-xs font-mono mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff' }} 
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="highRisk" stroke="#EF4444" fillOpacity={1} fill="url(#colorRisk)" name="Urgent High-Risk Items" />
                <Area type="monotone" dataKey="completedOnTime" stroke="#10B981" fillOpacity={1} fill="url(#colorComp)" name="Deliveries Met On-Time" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
