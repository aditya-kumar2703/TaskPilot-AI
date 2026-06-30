import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  CalendarCheck, 
  Check, 
  BrainCircuit,
  Zap,
  ArrowUpRight,
  Flame,
  User,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Task, CategoryType, PriorityType } from '../types';
import { fetchDailyBrief } from '../utils/ai';
import ReactMarkdown from 'react-markdown';

interface DashboardViewProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'progress' | 'aiRisk' | 'subtasks' | 'completed'>) => void;
  toggleComplete: (id: string) => void;
  setActiveTab: (tab: string) => void;
  triggerAIAssistant: (initialPrompt: string) => void;
}

export default function DashboardView({ 
  tasks, 
  addTask, 
  toggleComplete, 
  setActiveTab,
  triggerAIAssistant 
}: DashboardViewProps) {
  
  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<PriorityType>('medium');
  const [quickCategory, setQuickCategory] = useState<CategoryType>('Work');
  const [quickDeadline, setQuickDeadline] = useState('');

  // AI Brief State
  const [aiBrief, setAiBrief] = useState<string>('');
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  useEffect(() => {
    // Generate default AI Brief or load from cache
    const stored = localStorage.getItem('taskpilot_cached_brief');
    if (stored) {
      setAiBrief(stored);
    } else {
      triggerBriefRegen();
    }
  }, [tasks.length]);

  const triggerBriefRegen = async () => {
    setIsBriefLoading(true);
    const brief = await fetchDailyBrief(tasks);
    setAiBrief(brief);
    localStorage.setItem('taskpilot_cached_brief', brief);
    setIsBriefLoading(false);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle,
      priority: quickPriority,
      category: quickCategory,
      deadline: quickDeadline || new Date().toISOString().split('T')[0],
      estimatedDuration: 60, // default 1 hour
    });

    setQuickTitle('');
    // Focus reset
  };

  // Calculate Metrics
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;
  
  // Execution Score Calculation
  // Considers priority completion, met deadlines, progress, and AI risks
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

  const totalFocusHours = tasks.reduce((acc, curr) => acc + (curr.completed ? curr.estimatedDuration : curr.progress / 100 * curr.estimatedDuration), 0) / 60;

  // Sorted list of urgent tasks
  const priorityTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    })
    .slice(0, 4);

  const upcomingDeadlines = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 font-sans"
    >
      {/* Editorial Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase font-mono">System Operational Slot</span>
          <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 mt-2 tracking-tight">Welcome back, Aditya.</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl leading-relaxed">
            You have <span className="text-blue-600 font-semibold">{tasks.filter(t => !t.completed).length} priority tasks</span> to address today. 1 high-risk deadline is modeled by the pilot.
          </p>
        </div>
        <div className="flex gap-2.5 mt-2 md:mt-0 shrink-0">
          <button 
            onClick={() => triggerAIAssistant("Plan my day based on outstanding items")}
            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Optimize My Day
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Grid: Execution Score Card & AI Daily Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Execution Score Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Execution Score</span>
            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
              +12% vs last week
            </span>
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-7xl font-sans font-black text-slate-900 tracking-tighter">{executionScore}</span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>

          <div className="space-y-4">
            {/* Custom progress gauge */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${executionScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-medium">You are in the <span className="font-bold text-slate-700">Top 2%</span> of productivity this week.</p>
          </div>
        </div>

        {/* AI Morning Briefing */}
        <div className="bg-white p-6 rounded-3xl border border-purple-100/60 shadow-sm md:col-span-2 flex flex-col justify-between relative hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-200">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-slate-900 font-sans font-black text-lg tracking-tight">AI Morning Briefing</h3>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider font-mono">TaskPilot Autonomous Analysis</span>
              </div>
            </div>
            <button 
              onClick={triggerBriefRegen}
              disabled={isBriefLoading}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isBriefLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 my-4 text-sm leading-relaxed text-slate-700 overflow-y-auto max-h-[160px] markdown-body font-sans">
            {isBriefLoading ? (
              <div className="space-y-3 py-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
              </div>
            ) : (
              <ReactMarkdown>{aiBrief}</ReactMarkdown>
            )}
          </div>

          <div className="pt-3 flex gap-2 border-t border-slate-100">
            <button 
              onClick={() => triggerAIAssistant("Optimize my active workspace roadmap")}
              className="px-3 py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-purple-700"
            >
              Approve Schedule
            </button>
            <button 
              onClick={() => triggerAIAssistant("Audit my schedule conflicts")}
              className="px-3 py-1 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg bg-white hover:bg-slate-50"
            >
              Ignore
            </button>
          </div>
        </div>

      </div>

      {/* Grid: Priority Tasks & Today's Timeline / Calendar Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Priority Tasks (Smart Priority) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white">
             <h3 className="font-sans font-black text-slate-900 tracking-tight text-sm">Smart Priority</h3>
             <button onClick={() => setActiveTab('tasks')} className="text-blue-600 text-[11px] font-bold hover:underline bg-blue-50 px-2 py-1 rounded">View All</button>
          </div>
          <div className="flex-1 overflow-hidden p-3 space-y-1 max-h-[340px] overflow-y-auto">
            {priorityTasks.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <CalendarCheck className="h-8 w-8 mb-2 text-slate-300" />
                No pending high priority deliverables.
              </div>
            ) : (
              priorityTasks.map((task) => (
                <div key={task.id} className="p-3 hover:bg-slate-50/80 rounded-2xl flex items-center gap-3 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                  <button 
                    onClick={() => toggleComplete(task.id)}
                    className="w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center text-slate-500 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 bg-white transition-all shrink-0"
                  >
                    {task.completed && <Check className="h-3 w-3 text-blue-600" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider font-mono ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.priority === 'high' ? 'High Risk' : task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Timeline (Dynamic Timeline) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white">
             <h3 className="font-sans font-black text-slate-900 tracking-tight text-sm">Dynamic Timeline</h3>
             <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
             </div>
          </div>
          <div className="flex-1 p-6 relative overflow-hidden">
             <div className="absolute left-[31px] top-6 bottom-6 w-px bg-slate-200"></div>
             <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-50 z-10 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">09:00 - 10:30</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">Deep Work Block</p>
                  </div>
                </div>
                <div className="flex gap-4 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-white z-10 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">10:30 - 11:00</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Buffer / Inbox Clear</p>
                  </div>
                </div>
                <div className="flex gap-4 relative">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 bg-white ring-4 ring-purple-50 z-10 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-600 uppercase font-mono tracking-wider">11:00 - 14:00 (Optimized)</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">API Documentation <span className="text-[10px] font-medium text-purple-500 italic">[AI Slot]</span></p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit className="h-24 w-24" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono z-10">Focus Efficiency</p>
            <div className="flex items-end justify-between z-10">
              <span className="text-4xl font-sans font-black tracking-tight">88.2%</span>
              <div className="flex items-end gap-1.5 pb-1">
                <div className="w-1.5 h-4 bg-slate-800 rounded-t-sm"></div>
                <div className="w-1.5 h-8 bg-slate-800 rounded-t-sm"></div>
                <div className="w-1.5 h-6 bg-slate-800 rounded-t-sm"></div>
                <div className="w-1.5 h-10 bg-blue-500/50 rounded-t-sm"></div>
                <div className="w-1.5 h-12 bg-blue-500 animate-pulse rounded-t-sm"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-sm flex-1 flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 font-mono">Weekly Progress</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-sans font-black tracking-tight">24</span>
                <span className="text-sm font-bold text-blue-200">/ 30 Tasks</span>
              </div>
            </div>
            <div className="w-full bg-blue-900/40 rounded-full h-2 mt-4 overflow-hidden">
               <div className="bg-white w-[80%] h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Pilot Quick Add Form & Calendar Synced Slot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Add Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:col-span-2 justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-sans font-black text-slate-900 tracking-tight text-lg border-b border-slate-100 pb-3 mb-5">Quick Workspace Entry</h3>
            <form onSubmit={handleQuickAdd} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Task Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Finalize project schema"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Deadline</label>
                  <input 
                    type="date" 
                    value={quickDeadline}
                    onChange={(e) => setQuickDeadline(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Priority</label>
                  <select 
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as PriorityType)}
                    className="w-full px-3 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Category</label>
                  <select 
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Pilot Stream Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Calendar Synced Preview card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Calendar Horizon</h3>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100/50 font-black px-2 py-0.5 rounded uppercase tracking-wider">Connected</span>
          </div>

          <div className="my-5 flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center bg-slate-50/70 p-3 rounded-2xl border border-slate-200/50 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-50"></span>
                <span className="text-xs font-bold text-slate-800">UI Review Sync</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-medium">10:00 AM</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50/70 p-3 rounded-2xl border border-slate-200/50 group hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-purple-600 ring-4 ring-purple-50"></span>
                <span className="text-xs font-bold text-slate-800">ML Training</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-medium">01:30 PM</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('planner')}
            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2.5 rounded-xl transition-colors mt-auto border border-transparent"
          >
            Go to Calendar Planner
          </button>
        </div>

      </div>
    </motion.div>
  );
}
