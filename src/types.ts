export type PriorityType = 'high' | 'medium' | 'low';
export type RiskType = 'critical' | 'high' | 'moderate' | 'low';
export type CategoryType = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedDuration: number; // in minutes
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: PriorityType;
  deadline: string; // YYYY-MM-DD
  estimatedDuration: number; // in minutes
  aiRisk: RiskType;
  aiRiskReason?: string;
  progress: number; // 0 to 100
  completed: boolean;
  category: CategoryType;
  subtasks: SubTask[];
  scheduledTime?: string; // e.g., "10:00 AM"
  scheduledDuration?: number; // in minutes
  completedAt?: string; // ISO date string
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reasoning?: string; // AI internal reasoning shown in premium collapse/card
  suggestions?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  dailyGoalHours: number;
}

export interface SystemSettings {
  profile: UserProfile;
  theme: 'light' | 'dark';
  notifications: {
    browser: boolean;
    email: boolean;
    aiAlerts: boolean;
  };
  googleCalendarConnected: boolean;
  geminiPreferences: {
    model: string;
    temperature: number;
    autoReplan: boolean;
    riskAnalysis: boolean;
  };
}

export interface AnalyticsSummary {
  executionScore: number;
  completionRate: number;
  focusHours: number;
  weeklyProductivity: { day: string; tasks: number; hours: number }[];
  categories: { name: string; value: number; color: string }[];
  riskTrends: { week: string; highRisk: number; completedOnTime: number }[];
}
