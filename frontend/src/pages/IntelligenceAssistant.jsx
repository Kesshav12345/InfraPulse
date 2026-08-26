import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Database,
  RefreshCw,
  User
} from 'lucide-react';
import { api } from '../services/api';

const PROMPT_CHIPS = [
  'Which projects have the highest current risk?',
  'Which sectors show the highest cost escalation?',
  'Show projects with a slippage ratio above 1.8',
  'Why is Project 1000MW high risk?',
  'What is the overall portfolio cost overrun?'
];

export default function IntelligenceAssistant() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome to **InfraPulse Intelligence Assistant**. I provide factually verified, hallucination-free decision-support answers computed directly from the 21,863 longitudinal infrastructure project records.\n\nYou can ask about high-risk projects, sectoral cost escalations, slippage ratios, or specific project deep dives.",
      suggested_followups: PROMPT_CHIPS
    }
  ]);

  const handleSend = async (userText) => {
    const textToSend = (userText || query).trim();
    if (!textToSend || loading) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryIntelligence(textToSend);
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: res.answer,
          intent: res.intent,
          data: res.data,
          suggested_followups: res.suggested_followups || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: `⚠️ Error executing verified query: ${err.message || 'Unable to connect to intelligence backend.'}`,
          suggested_followups: PROMPT_CHIPS.slice(0, 3)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Bot size={22} className="text-blue-800" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Project Intelligence Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Natural language querying backed by structured analytical engine data with 0% numerical hallucination
          </p>
        </div>

        <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded inline-flex items-center gap-1.5 shadow-sm">
          <ShieldCheck size={14} className="text-emerald-700" /> Deterministic Execution
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1">
          <Sparkles size={13} className="text-amber-500" /> Suggested Inquiries:
        </span>
        {PROMPT_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-300 hover:border-blue-300 rounded-full transition shadow-xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="gov-card flex flex-col h-[520px] justify-between overflow-hidden shadow-sm">
        {/* Messages List */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-2xl rounded-lg p-4 text-xs shadow-xs ${
                  isUser
                    ? 'bg-blue-900 text-white font-medium'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}>
                  {/* Message Markdown-style content */}
                  <div className="prose prose-xs max-w-none space-y-2 whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Followups */}
                  {!isUser && msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggested_followups.map((f, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleSend(f)}
                          className="text-[11px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 px-2 py-0.5 rounded border border-slate-300 transition"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-blue-700" />
                <span>Executing verified database query...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder="Ask about project risks, cost overruns, slippage ratios, or specific projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={loading}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
