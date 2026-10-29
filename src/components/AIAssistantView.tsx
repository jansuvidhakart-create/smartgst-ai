import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { PRESET_PROMPTS, getAIAnswer } from '../utils/aiEngine';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { language, currentShop } = useShop();
  const { t } = useTranslation(language);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-1',
    sender: 'assistant',
    text:
      language === 'hi'
        ? `नमस्ते! मैं आपका **स्मार्टजीएसटी AI मित्र** हूँ। 🇮🇳\n\nमैं आपकी दुकान **${currentShop.hindiName || currentShop.name}** के लिए जीएसटी नियम, HSN कोड, ग्राहक का उधार तगादा संदेश, और स्टॉक बढ़ाने के उपायों में मदद कर सकता हूँ। आप मुझसे हिंदी या अंग्रेजी में कोई भी व्यापारिक प्रश्न पूछ सकते हैं!`
        : `Greetings! I am **SmartGST AI Mitr**, your dedicated retail & tax copilot for **${currentShop.name}**. 🇮🇳\n\nI can assist you with GST tax slabs, HSN lookup, polite WhatsApp khata collection drafts, ITC eligibility conditions, and retail margin optimization. How can I help your business today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const answer = await getAIAnswer(query, language, currentShop);
      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{t('aiAssistantTitle')}</span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                MSME Copilot
              </span>
            </h1>
            <p className="text-xs text-slate-500">{t('aiSubtitle')}</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([initialWelcomeMessage])}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('suggestedQuestions')}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() =>
                handleSendMessage(language === 'hi' ? item.promptHi : item.promptEn)
              }
              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-200 border border-slate-200 rounded-lg text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              {language === 'hi' ? item.titleHi : item.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Conversation Stream */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.text}
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
              <span>Thinking with GST & MSME knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-xs"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('askQuestionPlaceholder')}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>{t('askAi')}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
