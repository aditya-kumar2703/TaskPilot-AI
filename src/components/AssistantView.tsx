import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  User, 
  Copy, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, ChatMessage } from '../types';
import { fetchAssistantResponse } from '../utils/ai';
import ReactMarkdown from 'react-markdown';

interface AssistantViewProps {
  tasks: Task[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AssistantView({ 
  tasks, 
  chatHistory, 
  setChatHistory 
}: AssistantViewProps) {
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeReasoningId, setActiveReasoningId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    { text: 'Plan my day', icon: '📅' },
    { text: 'Analyze my workload', icon: '📊' },
    { text: 'Reprioritize everything', icon: '⚡' },
    { text: 'Break my assignment', icon: '🧩' },
    { text: 'Create study schedule', icon: '🎓' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetchAssistantResponse(
        textToSend,
        chatHistory,
        tasks
      );

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoning: response.reasoning,
        suggestions: response.suggestions,
      };

      setChatHistory(prev => [...prev, assistantMsg]);
      // Open reasoning automatically on fresh response
      if (response.reasoning) {
        setActiveReasoningId(assistantMsg.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: 'msg-default',
        sender: 'assistant',
        text: '### Hello! I am TaskPilot AI. \nI am your autonomous productivity pilot. I continuously evaluate your workspace task loads, estimate deadline risks, and help you schedule optimal focus sessions.\n\nAsk me to **plan your day**, **re-prioritize your tasks**, or **deconstruct a complex assignment** into smaller components.',
        timestamp: '09:00 AM',
      }
    ]);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative font-sans">
      
      {/* Header Controls */}
      <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white z-10 font-mono">
        <div className="flex items-center gap-2">
          <div className="h-6.5 w-6.5 rounded bg-blue-50 flex items-center justify-center text-blue-600">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">AI Pilot Terminal</span>
        </div>
        <button 
          onClick={clearChat}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Chat
        </button>
      </div>

      {/* Message History Scroller */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            const isReasoningOpen = activeReasoningId === msg.id;

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser 
                    ? 'bg-slate-950 text-white border-slate-900 font-bold text-xs' 
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-purple-600" />}
                </div>

                {/* Message Bubble Column */}
                <div className="space-y-2 max-w-full">
                  <div className={`p-4 rounded-lg text-sm relative border ${
                    isUser 
                      ? 'bg-slate-900 text-white border-slate-950 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-xs'
                  }`}>
                    <div className="prose prose-slate prose-sm max-w-none text-xs leading-relaxed markdown-body">
                      {isUser ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Meta actions */}
                    <div className={`flex justify-end gap-2 mt-3 pt-2 border-t text-[10px] font-mono ${
                      isUser ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>
                      <button 
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="hover:underline flex items-center gap-0.5"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Expandable Reasoning Block */}
                  {msg.reasoning && (
                    <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 max-w-2xl font-mono">
                      <button 
                        onClick={() => setActiveReasoningId(isReasoningOpen ? null : msg.id)}
                        className="w-full flex items-center justify-between text-[9px] font-black text-purple-700 uppercase tracking-widest"
                      >
                        <span className="flex items-center gap-1">
                          <BrainCircuit className="h-3.5 w-3.5" />
                          Risk Assessment Reasoning
                        </span>
                        {isReasoningOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      {isReasoningOpen && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium"
                        >
                          {msg.reasoning}
                        </motion.p>
                      )}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5 font-mono">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-500 hover:bg-slate-50 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-all shadow-xs"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* AI Loader Bubble */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-xl"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-purple-600 animate-pulse" />
              </div>
              <div className="bg-white p-4 rounded-lg text-sm border border-slate-200 rounded-tl-none shadow-xs flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Simulating Schedules...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Bar (Shown when history is small or empty) */}
      {chatHistory.length <= 1 && (
        <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
          <div className="flex flex-wrap gap-2 justify-center">
            {promptSuggestions.map((sug) => (
              <button
                key={sug.text}
                onClick={() => handleSendMessage(sug.text)}
                className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>{sug.icon}</span>
                {sug.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Formulation Console */}
      <div className="p-5 border-t border-slate-100 shrink-0 bg-white">
        <form onSubmit={handleFormSubmit} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Instruct TaskPilot AI... (E.g. Plan my day based on risks)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-5 py-3.5 text-sm font-medium bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-sm transition-all flex items-center gap-2 shadow-sm disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>

    </div>
  );
}
