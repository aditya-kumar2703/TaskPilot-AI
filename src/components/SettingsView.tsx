import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Calendar, 
  Sparkles, 
  Save, 
  Check 
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

export default function SettingsView({ settings, setSettings }: SettingsViewProps) {
  
  // Local form states matching global system settings
  const [name, setName] = useState(settings.profile.name);
  const [email, setEmail] = useState(settings.profile.email);
  const [role, setRole] = useState(settings.profile.role);
  const [goalHours, setGoalHours] = useState(settings.profile.dailyGoalHours);

  // Gemini model settings
  const [model, setModel] = useState(settings.geminiPreferences.model);
  const [temp, setTemp] = useState(settings.geminiPreferences.temperature);

  // Success indicator
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        name,
        email,
        role,
        dailyGoalHours: Number(goalHours),
      },
      geminiPreferences: {
        ...prev.geminiPreferences,
        model,
        temperature: temp,
      }
    }));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleNotification = (key: 'browser' | 'email' | 'aiAlerts') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      }
    }));
  };

  const toggleAutoReplan = () => {
    setSettings(prev => ({
      ...prev,
      geminiPreferences: {
        ...prev.geminiPreferences,
        autoReplan: !prev.geminiPreferences.autoReplan,
      }
    }));
  };

  const toggleRiskAnalysis = () => {
    setSettings(prev => ({
      ...prev,
      geminiPreferences: {
        ...prev.geminiPreferences,
        riskAnalysis: !prev.geminiPreferences.riskAnalysis,
      }
    }));
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: nextTheme }));
  };

  const toggleCalendarConnection = () => {
    setSettings(prev => ({
      ...prev,
      googleCalendarConnected: !prev.googleCalendarConnected,
    }));
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-sm text-slate-500 mt-2">Tweak operational controls, user metadata, integrations, and server-side model properties.</p>
        </div>
        {isSaved && (
          <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-100 font-mono">
            <Check className="h-4.5 w-4.5 text-emerald-500" />
            PREFERENCES SAVED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile and Theme Controls */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 flex items-center gap-2 font-mono">
            <User className="h-4.5 w-4.5 text-blue-600" />
            User Identity
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Email Coordinates</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Operational Role</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Daily Goal Hours</label>
                <input 
                  type="number" 
                  min={1} 
                  max={12}
                  value={goalHours}
                  onChange={(e) => setGoalHours(Number(e.target.value))}
                  className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="h-4.5 w-4.5" />
                Save Core Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Global UI & Themes Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 mb-5 flex items-center gap-2 font-mono">
              <Sun className="h-4.5 w-4.5 text-blue-600" />
              Interface Theme
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">Choose your preferred visual aesthetic. The system currently targets a pristine Google Blue & Soft Indigo light template.</p>
          </div>

          <div className="my-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 font-mono">
              <span className="text-sm font-bold text-slate-700 capitalize">{settings.theme} Mode Active</span>
              <button 
                onClick={handleToggleTheme}
                className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-600 transition-all border border-slate-200 shadow-sm hover:shadow"
              >
                {settings.theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">AUTO-SYNCED WITH WORKSPACE</span>
        </div>

        {/* Google Calendar & Integrations */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 flex items-center gap-2 font-mono">
            <Calendar className="h-4.5 w-4.5 text-blue-600" />
            Integrations Horizon
          </h3>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-sm font-bold text-slate-700">Google Calendar</span>
              <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                settings.googleCalendarConnected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {settings.googleCalendarConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enable two-way synchronization between your local planner schedules and Google Workspace Calendar slots.
            </p>
            <button 
              onClick={toggleCalendarConnection}
              className={`w-full py-3 rounded-xl font-bold text-sm border transition-all ${
                settings.googleCalendarConnected 
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              {settings.googleCalendarConnected ? 'Disconnect Calendar' : 'Connect Workspace Account'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 flex items-center gap-2 font-mono">
            <Bell className="h-4.5 w-4.5 text-blue-600" />
            Notification Nodes
          </h3>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Browser Focus Alerts</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">Reminders for upcoming focus blocks</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.browser}
                onChange={() => toggleNotification('browser')}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Email Digest Reports</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">Weekly productivity stats sent on Sundays</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.email}
                onChange={() => toggleNotification('email')}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Proactive AI Alerts</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">Immediate warning alerts for high deadline risks</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications.aiAlerts}
                onChange={() => toggleNotification('aiAlerts')}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Gemini API Preferences */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-100 flex items-center gap-2 font-mono">
            <Sparkles className="h-4.5 w-4.5 text-blue-600" />
            Server Gemini Core Config
          </h3>

          <div className="space-y-5 pt-1">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Active Gemini Model</label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-all appearance-none"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fast, Efficient)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Low Latency)</option>
              </select>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                <span>Temperature (Creativity)</span>
                <span>{temp.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min={0.1} 
                max={1.0} 
                step={0.1}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Auto Re-Scheduler</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">Enable automatic schedule balancing</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.geminiPreferences.autoReplan}
                onChange={toggleAutoReplan}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Continuous Risk Audit</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">Actively scan tasks for missing items</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.geminiPreferences.riskAnalysis}
                onChange={toggleRiskAnalysis}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
