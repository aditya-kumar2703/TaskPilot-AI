import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'assistant', label: 'AI Pilot', icon: MessageSquare, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      className="bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 font-sans"
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Header Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1"
            >
              <span className="font-sans font-black text-lg tracking-tighter text-slate-900">TaskPilot</span>
              <span className="font-sans font-black text-lg tracking-tighter text-blue-600">AI</span>
            </motion.div>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {item.badge && !isCollapsed && (
                <span className="ml-auto px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-md pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 mt-auto">
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="w-full h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
              AK
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-slate-800">Aditya Kajal</span>
              <span className="text-xs text-slate-500 truncate">Senior UX Lead</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
