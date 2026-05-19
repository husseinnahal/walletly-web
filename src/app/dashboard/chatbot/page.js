'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.username || 'there'}! 👋 I'm your Walletly AI Assistant. I can help you analyze your budgets, plan your debt repayment, or explain how the app works. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e, text = null) => {
    if (e) e.preventDefault();
    const messageContent = text || input;
    if (!messageContent.trim() || loading) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: messageContent }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiFetch('/chatbot', {
        method: 'POST',
        body: JSON.stringify({
          message: messageContent,
          history: messages.slice(-6) // Send last 6 messages for context
        })
      });

      setMessages([...newMessages, { role: 'assistant', content: response.data }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment! 🧠🔌" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Analyze my debts and give me a plan",
    "How is my budget looking this month?",
    "Tell me about the Investment Marketplace",
    "How do I track my Gold and Silver?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">Walletly AI</h1>
            <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Financial Expert Online
            </p>
          </div>
        </div>
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          Ephemeral Session
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length < 3 && !loading && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={(e) => handleSendMessage(e, action)}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Ask about your debts, budgets, or savings..."
            className="flex-1 text-black bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            <span>🚀</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-3 uppercase font-bold tracking-tight">
           Your data is used to give advice but messages are not stored.
        </p>
      </div>
    </div>
  );
}
