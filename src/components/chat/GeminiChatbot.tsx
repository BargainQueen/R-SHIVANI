import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AIChatMessage } from '../../types';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Info,
  PhoneCall,
} from 'lucide-react';

export const GeminiChatbot: React.FC = () => {
  const { currentUser, patientRecord, setUrgentModalOpen } = useApp();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${currentUser?.name?.split(' ')[0] || ''}! I am your **Postpartum Care Connect Assistant**, powered by Gemini AI.

I can help explain common postpartum recovery signs, soothing tips for baby ${patientRecord?.profile?.babyName || 'your newborn'}, medication schedules, and questions to ask during your doctor visits.

*How are you and baby feeling today?*`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUrgentFlag, setLastUrgentFlag] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Is my bleeding normal for my postpartum day?',
    'Tips for latching and soothing newborn fussiness',
    'Summarize my current medication schedule',
    'What red flag symptoms should I call 911 for?',
    'What should I ask Dr. Jenkins at my next visit?',
    'How do I know if my baby is getting enough milk?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Map previous messages to Gemini format
      const history = [...messages, userMsg].map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.text,
      }));

      const res = await api.chatWithGemini(history, currentUser?.id);

      const botMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toISOString(),
        isUrgentFlag: res.isUrgentFlag,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.isUrgentFlag) {
        setLastUrgentFlag(true);
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: `I'm having a brief issue connecting to the AI service. If you are experiencing concerning symptoms like high fever, severe headache with vision changes, or heavy bleeding, please contact emergency medical care (911) or your labor and delivery triage team immediately.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-130px)]">
      {/* Chat Header */}
      <div className="bg-white rounded-t-3xl p-5 border-t border-x border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <BotMessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-slate-900 text-base">Gemini Postpartum Assistant</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-teal-600" /> AI-Assisted Care
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized guidance calibrated to Day {patientRecord?.profile?.postpartumDay || 1} recovery
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `reset_${Date.now()}`,
                sender: 'assistant',
                text: `Conversation restarted. How can I help you today?`,
                timestamp: new Date().toISOString(),
              },
            ]);
            setLastUrgentFlag(false);
          }}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Emergency Warning Banner if red flag detected */}
      {lastUrgentFlag && (
        <div className="p-3 bg-rose-50 border-x border-rose-200 text-rose-950 flex items-center justify-between text-xs px-5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
            <span>
              <strong>Emergency Warning Triggered:</strong> Immediate emergency medical evaluation is strongly recommended.
            </span>
          </div>
          <button
            onClick={() => setUrgentModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] whitespace-nowrap hover:bg-rose-700 shadow-xs"
          >
            View Emergency Triage
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-50/70 p-4 sm:p-6 overflow-y-auto border-x border-slate-200/90 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-br-xs'
                    : m.isUrgentFlag
                    ? 'bg-rose-50 border-2 border-rose-300 text-slate-900 rounded-bl-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                }`}
              >
                {/* Formatted Text */}
                <div className="whitespace-pre-line space-y-2">{m.text}</div>

                <div
                  className={`text-[9px] mt-2 flex items-center justify-end space-x-1 ${
                    isUser ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 rounded-bl-xs shadow-xs flex items-center space-x-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Gemini is generating clinical response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-white border-x border-slate-200/90 p-2.5 overflow-x-auto no-scrollbar flex space-x-2">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs whitespace-nowrap transition-colors border border-slate-200/60 font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-b-3xl p-4 border border-slate-200/90 shadow-sm space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything about recovery, feeding, medications, or warning signs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-slate-400 inline" />
            <span>AI does not replace clinical judgment or diagnose medical conditions.</span>
          </span>
          <span className="hidden sm:inline">Emergency? Call 911 immediately.</span>
        </div>
      </div>
    </div>
  );
};
