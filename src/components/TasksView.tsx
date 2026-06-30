import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Check, 
  Loader2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Grid,
  List as ListIcon,
  ChevronRight,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, CategoryType, PriorityType, SubTask } from '../types';
import { fetchSubtaskBreakdown } from '../utils/ai';

interface TasksViewProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'progress' | 'aiRisk' | 'subtasks' | 'completed'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
}

export default function TasksView({ 
  tasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  toggleComplete 
}: TasksViewProps) {
  
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  // Task Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // New/Edit task form states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<PriorityType>('medium');
  const [formCategory, setFormCategory] = useState<CategoryType>('Work');
  const [formDeadline, setFormDeadline] = useState('');
  const [formDuration, setFormDuration] = useState(60);

  // Subtask accordion states
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpandSubtasks = (id: string) => {
    setExpandedTaskIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormCategory('Work');
    setFormDeadline(new Date().toISOString().split('T')[0]);
    setFormDuration(60);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormDeadline(task.deadline);
    setFormDuration(task.estimatedDuration);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        category: formCategory,
        deadline: formDeadline,
        estimatedDuration: Number(formDuration),
      });
    } else {
      addTask({
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        category: formCategory,
        deadline: formDeadline,
        estimatedDuration: Number(formDuration),
      });
    }
    setIsModalOpen(false);
  };

  // AI break task into subtasks action
  const handleAISubtaskBreakdown = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setLoadingTaskId(taskId);
    try {
      const result = await fetchSubtaskBreakdown(task);
      
      const newSubtasks: SubTask[] = result.subtasks.map((st, index) => ({
        id: `st-${taskId}-${index}-${Date.now()}`,
        title: st.title,
        completed: false,
        estimatedDuration: st.estimatedDuration,
      }));

      updateTask({
        ...task,
        subtasks: newSubtasks,
        aiRisk: result.aiRisk,
        aiRiskReason: result.aiRiskReason,
        progress: 0,
      });

      // Expand to show subtasks automatically
      setExpandedTaskIds(prev => ({ ...prev, [taskId]: true }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  // Toggle single subtask complete
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const progress = task.subtasks.length > 0 
      ? Math.round((completedCount / task.subtasks.length) * 100) 
      : 100;

    updateTask({
      ...task,
      subtasks: updatedSubtasks,
      progress,
      completed: progress === 100 ? true : task.completed,
    });
  };

  // Priority styling helper
  const getPriorityBadge = (p: PriorityType) => {
    const styles = {
      high: 'bg-red-50 text-red-600 border-red-100',
      medium: 'bg-amber-50 text-amber-600 border-amber-100',
      low: 'bg-blue-50 text-blue-600 border-blue-100',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${styles[p]} uppercase tracking-wider`}>
        {p}
      </span>
    );
  };

  // Risk styling helper
  const getRiskBadge = (r: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-600 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${styles[r] || styles.low} uppercase tracking-wider flex items-center gap-1`}>
        <AlertTriangle className="h-3 w-3" />
        AI: {r}
      </span>
    );
  };

  // Kanban Categories
  const kanbanColumns = [
    { id: 'todo', title: 'To Do', filter: (t: Task) => !t.completed && t.progress === 0 },
    { id: 'progress', title: 'In Progress', filter: (t: Task) => !t.completed && t.progress > 0 },
    { id: 'completed', title: 'Completed', filter: (t: Task) => t.completed },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight">Deliverables Workspace</h1>
          <p className="text-sm text-slate-500 mt-2">Manage, prioritize, and orchestrate deliverables with autonomous AI decomposition.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* View Toggle */}
          <div className="bg-slate-100/80 p-1.5 rounded-xl flex items-center gap-1 border border-slate-200/50">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid className="h-4.5 w-4.5" />
            </button>
          </div>
          <button 
            onClick={openNewTaskModal}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Primary Workspace View */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          /* List View */
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No deliverables defined in workspace. Use the "New Task" trigger above to launch.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-6 md:p-8 flex flex-col hover:bg-slate-50/50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Left Block */}
                      <div className="flex items-start gap-4 min-w-0">
                        <button 
                          onClick={() => toggleComplete(task.id)}
                          className="h-6 w-6 rounded-md border-2 border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 bg-white transition-all shrink-0 mt-0.5"
                        >
                          {task.completed && <Check className="h-4 w-4 text-emerald-600" />}
                        </button>

                        <div className="min-w-0">
                          <h3 className={`text-base font-bold text-slate-800 tracking-tight transition-colors ${task.completed ? 'line-through text-slate-400' : 'group-hover:text-blue-700'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Control / Badge Row */}
                      <div className="flex flex-wrap items-center gap-4 shrink-0 mt-3 md:mt-0">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          {getRiskBadge(task.aiRisk)}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-300" />
                            {task.estimatedDuration}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-300" />
                            {task.deadline}
                          </span>
                        </div>

                        {/* Custom Task Action Controls */}
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleAISubtaskBreakdown(task.id)}
                            disabled={loadingTaskId === task.id}
                            title="AI Pilot Milestone Breakdown"
                            className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-40 border border-transparent hover:border-purple-100"
                          >
                            {loadingTaskId === task.id ? (
                              <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-4.5 w-4.5" />
                            )}
                          </button>
                          <button 
                            onClick={() => openEditTaskModal(task)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-4 pl-8 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <button 
                            onClick={() => toggleExpandSubtasks(task.id)}
                            className="text-slate-500 font-bold hover:text-slate-700 flex items-center gap-1"
                          >
                            <ChevronRight className={`h-3 w-3 transition-transform ${expandedTaskIds[task.id] ? 'rotate-90' : ''}`} />
                            Milestones ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                          </button>
                          <span className="font-bold text-slate-700">{task.progress}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>

                        {/* Expandable Subtask List */}
                        {expandedTaskIds[task.id] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1 pt-2"
                          >
                            {task.subtasks.map((st) => (
                              <div key={st.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-600 transition-colors">
                                <button 
                                  onClick={() => handleToggleSubtask(task.id, st.id)}
                                  className="text-slate-300 hover:text-emerald-500 transition-colors shrink-0"
                                >
                                  {st.completed ? (
                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-4.5 w-4.5" />
                                  )}
                                </button>
                                <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                  {st.title}
                                </span>
                                <span className="ml-auto text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {st.estimatedDuration}m
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* AI Risk Reasoning snippet */}
                    {task.aiRiskReason && !task.completed && (
                      <div className="mt-3 ml-8 p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>TaskPilot Pilot Analysis:</strong> {task.aiRiskReason}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* Kanban Board View */
          <motion.div 
            key="kanban-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {kanbanColumns.map((col) => {
              const columnTasks = tasks.filter(col.filter);
              return (
                <div key={col.id} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/60 flex flex-col h-[650px] shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5 font-mono">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{col.title}</span>
                    <span className="px-2.5 py-0.5 bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-bold rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {columnTasks.map((task) => (
                      <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all space-y-4 relative group cursor-pointer hover:border-slate-300">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-sm font-bold text-slate-800 leading-snug tracking-tight group-hover:text-blue-700 transition-colors">
                            {task.title}
                          </span>
                          <button 
                            onClick={() => toggleComplete(task.id)}
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 bg-white'
                            }`}
                          >
                            {task.completed && <Check className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {getPriorityBadge(task.priority)}
                          {getRiskBadge(task.aiRisk)}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-300" />
                            {task.estimatedDuration}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-300" />
                            {task.deadline}
                          </span>
                        </div>

                        {/* Quick controls on hover */}
                        <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2 flex gap-1">
                          <button 
                            onClick={() => openEditTaskModal(task)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-8 relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4 mb-6">
              {editingTask ? 'Edit Deliverable' : 'Establish New Task'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Title</label>
                <input 
                  type="text"
                  required
                  placeholder="Review system specs"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Define scope boundaries, constraints, and operational guidelines..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 resize-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Priority</label>
                  <select 
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityType)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Deadline</label>
                  <input 
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Est. Duration (mins)</label>
                  <input 
                    type="number"
                    min={15}
                    max={480}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 transition-all text-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow rounded-xl transition-all"
                >
                  {editingTask ? 'Save Modifications' : 'Launch Deliverable'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
