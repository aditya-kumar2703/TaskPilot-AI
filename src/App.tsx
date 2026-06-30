import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Sparkles, 
  User, 
  BrainCircuit, 
  ArrowUpRight, 
  Menu,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types and Components
import { Task, ChatMessage, SystemSettings } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import PlannerView from './components/PlannerView';
import AssistantView from './components/AssistantView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize System Architecture Design',
    description: 'Sketch out system nodes, block modules, state stores, and deployment pipeline for the next release.',
    priority: 'high',
    deadline: '2026-06-30', // Today
    estimatedDuration: 120, // 2 hours
    aiRisk: 'moderate',
    aiRiskReason: 'Simulated Risk: Tight timeline but highly actionable if chunked into subtasks early.',
    progress: 40,
    completed: false,
    category: 'Work',
    scheduledTime: '09:00 AM',
    scheduledDuration: 120,
    subtasks: [
      { id: 'sub-1-1', title: 'Outline database schemas and cache keys', completed: true, estimatedDuration: 40 },
      { id: 'sub-1-2', title: 'Define route constraints and rate limits', completed: false, estimatedDuration: 40 },
      { id: 'sub-1-3', title: 'Draft sequence diagrams for user auth flow', completed: false, estimatedDuration: 40 },
    ],
  },
  {
    id: 'task-2',
    title: 'Implement Real-time Analytics Module',
    description: 'Integrate the metrics reporting views with full-width line charts and live streaming events.',
    priority: 'high',
    deadline: '2026-07-02', // Wed
    estimatedDuration: 180, // 3 hours
    aiRisk: 'high',
    aiRiskReason: 'Critical warning: High density of tasks near Thursday milestone creates a capacity bottleneck.',
    progress: 0,
    completed: false,
    category: 'Work',
    subtasks: [],
  },
  {
    id: 'task-3',
    title: 'Refactor Workspace CSS Styling Engine',
    description: 'Clean up styling files, remove redundant margins, and enforce consistent typography pairings.',
    priority: 'low',
    deadline: '2026-06-29', // Yesterday
    estimatedDuration: 60,
    aiRisk: 'low',
    aiRiskReason: 'Task completed on schedule. No capacity warning active.',
    progress: 100,
    completed: true,
    category: 'Personal',
    completedAt: '2026-06-29T18:00:00Z',
    subtasks: [
      { id: 'sub-3-1', title: 'Enforce standard spacing tokens', completed: true, estimatedDuration: 30 },
      { id: 'sub-3-2', title: 'Audit contrast index across all pages', completed: true, estimatedDuration: 30 },
    ],
  },
  {
    id: 'task-4',
    title: 'Review Weekly Budget Allocation',
    description: 'Audit financial logs, balance expense records, and allocate resources for the next sprint.',
    priority: 'medium',
    deadline: '2026-07-03', // Fri
    estimatedDuration: 90,
    aiRisk: 'low',
    aiRiskReason: 'Adequate capacity remaining. Expected completion on-time.',
    progress: 0,
    completed: false,
    category: 'Finance',
    subtasks: [],
  },
  {
    id: 'task-5',
    title: 'Deep Work: Train ML Recommendation Engine',
    description: 'Optimize training datasets, deploy fine-tuning weights, and execute regression algorithms.',
    priority: 'high',
    deadline: '2026-07-03', // Fri
    estimatedDuration: 240, // 4 hours
    aiRisk: 'critical',
    aiRiskReason: 'Urgent risk! This represents 4 hours of intense focus. If delayed past Thursday, deadline is missed.',
    progress: 0,
    completed: false,
    category: 'Study',
    subtasks: [],
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  profile: {
    name: 'Aditya Kajal',
    email: 'adityakumarkajal12@gmail.com',
    avatar: 'AK',
    role: 'Senior UX Lead',
    dailyGoalHours: 6,
  },
  theme: 'light',
  notifications: {
    browser: true,
    email: true,
    aiAlerts: true,
  },
  googleCalendarConnected: true,
  geminiPreferences: {
    model: 'gemini-3.5-flash',
    temperature: 0.7,
    autoReplan: true,
    riskAnalysis: true,
  }
};

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: 'msg-default',
    sender: 'assistant',
    text: '### Hello! I am TaskPilot AI. \nI am your autonomous productivity pilot. I continuously evaluate your workspace task loads, estimate deadline risks, and help you schedule optimal focus sessions.\n\nAsk me to **plan your day**, **re-prioritize your tasks**, or **deconstruct a complex assignment** into smaller components.',
    timestamp: '09:00 AM',
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // States with LocalStorage Hydration
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('taskpilot_tasks');
    return stored ? JSON.parse(stored) : DEFAULT_TASKS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const stored = localStorage.getItem('taskpilot_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem('taskpilot_chat');
    return stored ? JSON.parse(stored) : DEFAULT_CHAT;
  });

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('taskpilot_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskpilot_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('taskpilot_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Global actions
  const addTask = (newTask: Omit<Task, 'id' | 'progress' | 'aiRisk' | 'subtasks' | 'completed'>) => {
    const created: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      progress: 0,
      aiRisk: 'moderate',
      aiRiskReason: 'Task entered workspace. Initializing AI capacity assessment...',
      completed: false,
      subtasks: [],
    };
    setTasks(prev => [created, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : t.progress === 100 ? 0 : t.progress,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));
  };

  const triggerAIAssistant = (initialPrompt: string) => {
    setActiveTab('assistant');
    // Pre-insert user and response
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: initialPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory(prev => [...prev, userMsg]);
    // Set a tiny timeout to let view mount, then trigger answer
    setTimeout(async () => {
      try {
        const { fetchAssistantResponse } = await import('./utils/ai');
        const response = await fetchAssistantResponse(initialPrompt, chatHistory, tasks);
        setChatHistory(prev => [...prev, {
          id: `msg-${Date.now()}-assistant`,
          sender: 'assistant',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reasoning: response.reasoning,
          suggestions: response.suggestions,
        }]);
      } catch (err) {
        console.error(err);
      }
    }, 100);
  };

  // High Risk Alert notifications count
  const urgentTasksCount = tasks.filter(t => !t.completed && (t.aiRisk === 'critical' || t.aiRisk === 'high')).length;

  return (
    <div className="flex bg-slate-50/50 min-h-screen text-slate-800 font-sans antialiased">
      
      {/* Collapsible Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Navigation */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
          
          {/* Left: Mobile menu triggers or Context indicator */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono shadow-sm">
              <span>Environment: Preview</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-5">
            
            {/* Global Search Bar mockup */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl w-64 hover:bg-white hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search deliverables..." 
                className="bg-transparent text-xs outline-none w-full text-slate-700 placeholder-slate-400 font-medium"
              />
            </div>

            {/* AI Risk Alarm Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors relative border border-transparent hover:border-slate-200/60"
              >
                <Bell className="h-4.5 w-4.5" />
                {urgentTasksCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-bounce shadow-sm" />
                )}
              </button>

              {/* Notification dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider font-mono">AI Pilot Warnings</span>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full border border-rose-100/50">
                      {urgentTasksCount} Risk Alarm
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {tasks.filter(t => !t.completed && (t.aiRisk === 'critical' || t.aiRisk === 'high')).map(t => (
                      <div key={t.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-2.5 hover:bg-rose-50 transition-colors">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 leading-snug">{t.title}</span>
                          <span className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{t.aiRiskReason}</span>
                        </div>
                      </div>
                    ))}

                    {urgentTasksCount === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        <span className="font-medium">All systems within nominal capacity limits.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Light/Dark mode toggle indicator */}
            <button 
              onClick={() => {
                const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
                setSettings(prev => ({ ...prev, theme: nextTheme }));
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200/60"
            >
              {settings.theme === 'light' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                AK
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-black text-slate-900 leading-none tracking-tight">{settings.profile.name}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 font-mono uppercase tracking-wider">{settings.profile.role}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic App Content Body */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  tasks={tasks} 
                  addTask={addTask} 
                  toggleComplete={toggleComplete} 
                  setActiveTab={setActiveTab}
                  triggerAIAssistant={triggerAIAssistant}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView 
                  tasks={tasks} 
                  addTask={addTask} 
                  updateTask={updateTask} 
                  deleteTask={deleteTask} 
                  toggleComplete={toggleComplete} 
                />
              )}

              {activeTab === 'planner' && (
                <PlannerView 
                  tasks={tasks} 
                  updateTasks={setTasks} 
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantView 
                  tasks={tasks} 
                  chatHistory={chatHistory} 
                  setChatHistory={setChatHistory} 
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView 
                  tasks={tasks} 
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  settings={settings} 
                  setSettings={setSettings} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating AI Assistant Action Trigger */}
        {activeTab !== 'assistant' && (
          <div className="fixed bottom-6 right-6 z-40">
            <button 
              onClick={() => setActiveTab('assistant')}
              className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform group relative"
            >
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
              <div className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md whitespace-nowrap">
                Ask TaskPilot AI
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
