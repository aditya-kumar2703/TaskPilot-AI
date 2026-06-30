import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { fetchReplannedSchedule } from '../utils/ai';

interface PlannerViewProps {
  tasks: Task[];
  updateTasks: (tasks: Task[]) => void;
}

export default function PlannerView({ tasks, updateTasks }: PlannerViewProps) {
  
  const [selectedDay, setSelectedDay] = useState<string>('2026-06-30'); // Tuesday
  const [isReplanning, setIsReplanning] = useState(false);
  const [plannerInsights, setPlannerInsights] = useState<string>(
    'Timeline aligned with current deadlines. Outstanding deliverables are placed in standard afternoon workspace slots.'
  );

  // June 29 to July 5, 2026 calendar dates
  const weekDays = [
    { name: 'Mon', dateNum: '29', dateStr: '2026-06-29' },
    { name: 'Tue', dateNum: '30', dateStr: '2026-06-30', isToday: true },
    { name: 'Wed', dateNum: '01', dateStr: '2026-07-01' },
    { name: 'Thu', dateNum: '02', dateStr: '2026-07-02' },
    { name: 'Fri', dateNum: '03', dateStr: '2026-07-03' },
    { name: 'Sat', dateNum: '04', dateStr: '2026-07-04' },
    { name: 'Sun', dateNum: '05', dateStr: '2026-07-05' },
  ];

  const hourlySlots = [
    { label: '08:00 AM' },
    { label: '09:00 AM' },
    { label: '10:00 AM' },
    { label: '11:00 AM' },
    { label: '12:00 PM' },
    { label: '01:00 PM' },
    { label: '02:00 PM' },
    { label: '03:00 PM' },
    { label: '04:00 PM' },
    { label: '05:00 PM' },
    { label: '06:00 PM' },
  ];

  // Map tasks to selected day's schedule
  const selectedDayTasks = tasks.filter(t => t.deadline === selectedDay);

  // Trigger server-side Gemini AI Replanner
  const handleAIReplan = async () => {
    setIsReplanning(true);
    try {
      const response = await fetchReplannedSchedule(tasks);
      
      // Update each task with the scheduled slot
      const updated = tasks.map(t => {
        const scheduleItem = response.scheduledTasks.find(st => st.taskId === t.id);
        if (scheduleItem) {
          return {
            ...t,
            scheduledTime: scheduleItem.scheduledTime.split(' - ')[0], // start time, e.g. "09:00 AM"
            scheduledDuration: t.estimatedDuration,
            aiRiskReason: scheduleItem.rationale,
          };
        }
        return t;
      });

      updateTasks(updated);
      setPlannerInsights(response.replanInsights);
    } catch (error) {
      console.error(error);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleGenerateMyDay = async () => {
    setIsReplanning(true);
    // Simulating advanced day layout and timeline distribution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Auto map outstanding items to today's date so they display visually
    const updated = tasks.map((t, idx) => {
      const slots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
      return {
        ...t,
        deadline: '2026-06-30', // Today
        scheduledTime: slots[idx % slots.length],
        scheduledDuration: t.estimatedDuration,
      };
    });

    updateTasks(updated);
    setPlannerInsights('Day schedule formulated automatically. Tasks synced perfectly to your calendar block templates.');
    setIsReplanning(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight">AI Orchestration Planner</h1>
          <p className="text-sm text-slate-500 mt-2">Map and synchronize scheduled focus blocks based on peak performance timelines.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0">
          <button 
            onClick={handleGenerateMyDay}
            disabled={isReplanning}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 flex items-center gap-2 shadow-sm"
          >
            Generate My Day
          </button>
          <button 
            onClick={handleAIReplan}
            disabled={isReplanning}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl transition-all flex items-center gap-2"
          >
            {isReplanning ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Sparkles className="h-4.5 w-4.5" />
            )}
            Replan My Schedule
          </button>
        </div>
      </div>

      {/* AI Planner Insights Block */}
      <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 p-5 rounded-2xl border border-purple-100/60 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
          <Zap className="h-5 w-5 animate-pulse text-purple-600" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest font-mono">Active Planner Recommendations</span>
          <p className="text-sm text-slate-700 leading-relaxed font-semibold">{plannerInsights}</p>
        </div>
      </div>

      {/* Calendar Timeline and Daily Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Timeline Selector */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">Weekly Horizon • June - July 2026</span>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200/50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-slate-700">This Week</span>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200/50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const isSelected = selectedDay === day.dateStr;
              // Check if any tasks due on this day
              const hasTasks = tasks.some(t => t.deadline === day.dateStr && !t.completed);
              const hasHighRisk = tasks.some(t => t.deadline === day.dateStr && (t.aiRisk === 'critical' || t.aiRisk === 'high'));

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDay(day.dateStr)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all relative border ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-1' 
                      : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200/50 text-slate-600 hover:shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{day.name}</span>
                  <span className="text-2xl font-sans font-black tracking-tight">{day.dateNum}</span>
                  
                  {/* Task Indicators */}
                  <div className="flex gap-1.5 mt-1">
                    {hasTasks && (
                      <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    )}
                    {hasHighRisk && (
                      <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`} />
                    )}
                  </div>

                  {day.isToday && (
                    <span className={`absolute -top-2 px-2 py-0.5 rounded border text-[9px] font-black tracking-widest shadow-sm ${
                      isSelected ? 'bg-white text-blue-600 border-blue-100' : 'bg-blue-600 text-white border-blue-700'
                    }`}>TODAY</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>        {/* Daily Schedule Hour Blocks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 font-mono">
            Daily Focus Blocks ({weekDays.find(d => d.dateStr === selectedDay)?.name})
          </h3>

          <div className="divide-y divide-slate-100/50 max-h-[500px] overflow-y-auto pr-3">
            {hourlySlots.map((slot) => {
              // Find if any task is scheduled in this hour
              const scheduledTask = tasks.find(t => t.deadline === selectedDay && t.scheduledTime === slot.label);

              return (
                <div key={slot.label} className="py-5 flex gap-5 items-start group font-mono relative">
                  {/* Timeline connector */}
                  <div className="absolute left-[39px] top-10 bottom-0 w-px bg-slate-100 -z-10 group-last:hidden" />
                  
                  <span className="text-[10px] font-bold text-slate-400 w-16 shrink-0 pt-2 text-right">{slot.label}</span>
                  
                  <div className="flex-1 font-sans">
                    {scheduledTask ? (
                      <div className={`p-4 rounded-2xl border transition-all hover:shadow-sm ${
                        scheduledTask.completed 
                          ? 'bg-emerald-50/30 border-emerald-100 text-slate-500' 
                          : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold tracking-tight ${scheduledTask.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {scheduledTask.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100/80 px-2.5 py-1 rounded-full text-slate-500">
                            {scheduledTask.estimatedDuration}m
                          </span>
                        </div>
                        
                        {scheduledTask.aiRiskReason && !scheduledTask.completed && (
                          <div className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{scheduledTask.aiRiskReason}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-3.5 border-2 border-dashed border-slate-100 rounded-xl hover:border-slate-300 transition-all flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-500 cursor-pointer font-mono bg-slate-50/30">
                        Block Slot focuses
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Inventory */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[600px]">
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 mb-5 font-mono shrink-0">
              Day's Deliverables
            </h3>

            {selectedDayTasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-slate-400 text-xs font-mono px-4">
                No focus items allocated for this date. Use the replanner to synchronize deliverables.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {selectedDayTasks.map(task => (
                  <div key={task.id} className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl flex flex-col gap-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-sm font-bold text-slate-800 leading-tight ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                      <span className={`text-[9px] font-mono font-black px-2 py-1 rounded uppercase tracking-wider shrink-0 ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600 font-bold border border-rose-100' : 'bg-slate-200 text-slate-700 font-bold border border-slate-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        {task.scheduledTime ? `Scheduled: ${task.scheduledTime}` : 'Unscheduled'}
                      </span>
                      {task.aiRisk === 'critical' || task.aiRisk === 'high' ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                          Risk
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-slate-100 mt-5 shrink-0">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Today's Target</span>
                <span className="text-sm font-black text-slate-800 tracking-tight mt-0.5">
                  {selectedDayTasks.filter(t => t.completed).length} / {selectedDayTasks.length} Done
                </span>
              </div>
              <div className="h-12 w-12 rounded-full border-[5px] border-slate-200 border-t-blue-600 flex items-center justify-center text-[10px] font-mono font-black text-slate-700 shadow-inner">
                {selectedDayTasks.length > 0 
                  ? `${Math.round(selectedDayTasks.filter(t => t.completed).length / selectedDayTasks.length * 100)}%` 
                  : '0%'}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
