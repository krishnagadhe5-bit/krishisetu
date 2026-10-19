import React, { useState } from 'react';
import api from '../../services/api';
import { BotMessageSquare, Send, Sparkles, BookOpen, ExternalLink, RefreshCw, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const AssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! I am your KrishiSetu Agricultural AI Assistant. I answer agronomic, pest, crop nutrition, and irrigation questions grounded in verified research from Indian Agricultural Universities (MPKV, VNMKV, ICAR). How can I assist your farm today?',
      sources: [
        { title: 'Maharashtra State Department of Agriculture (Agri Maharashtra)', url: 'https://krishi.maharashtra.gov.in' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        question: query,
        conversationId,
      });

      const reply = res.data.data;
      if (reply.conversationId) setConversationId(reply.conversationId);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.answer,
          sources: reply.sources || [],
        },
      ]);
    } catch (err) {
      toast.error('Failed to get answer from AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'How to prevent pink bollworm in Bt cotton?',
    'What is the recommended fertilizer split for Sugarcane?',
    'How to cure and store Rabi onions without rot?',
    'How does drip irrigation acid treatment work?',
  ];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <Toaster position="top-right" />
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-agri-700" />
          RAG Knowledge Assistant (Official Agro-Corpus)
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          AI Agricultural Knowledge Assistant
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Ask questions regarding package of practices, pest control, fertigation, and post-harvest storage.
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-400">Try Asking:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-white border border-gray-200 hover:border-agri-300 text-gray-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-agri-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-agri-700 text-white rounded-tr-none'
                    : 'bg-[#fafcf9] border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* Sources / Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/60 text-[11px] space-y-1">
                    <span className="font-bold text-agri-900 block flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-agri-700" /> Grounded Source Citations:
                    </span>
                    {m.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-agri-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        • {src.title}
                        {src.url && <ExternalLink className="w-2.5 h-2.5" />}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-agri-700" />
              <span>Retrieving validated agronomic guidelines...</span>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-[#fafcf9] border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an agricultural question in English or Marathi..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-agri-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white disabled:opacity-40 transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
