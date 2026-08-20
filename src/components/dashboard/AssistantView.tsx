import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage, Campaign, ChatThread } from '../../types';
import { apiFetch } from '../../lib/api';

interface AssistantViewProps {
  campaigns: Campaign[];
  pendingDraftsCount: number;
  onNavigateToDrafts: () => void;
  onDataChanged?: () => void;
}

const makeEmptyThread = (): ChatThread => ({
  id: `thread-${Date.now()}`,
  title: 'New conversation',
  createdAt: 'Just now',
  updatedAt: 'Just now',
  messages: [
    {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Hello. I'm your clerk outbound assistant.\n\nAsk me to scout verified intent triggers, inspect a target company, review your pending draft queue, or summarize this week's outreach.`,
      timestamp: 'Just now',
    },
  ],
});

export const AssistantView: React.FC<AssistantViewProps> = ({
  campaigns,
  pendingDraftsCount,
  onNavigateToDrafts,
  onDataChanged,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([makeEmptyThread()]);
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0].id);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchHistory, setSearchHistory] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isSending]);

  const handleCreateNewThread = () => {
    const t = makeEmptyThread();
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
    setInputText('');
    setIsHistoryOpen(false);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      handleCreateNewThread();
      return;
    }
    const remaining = threads.filter((t) => t.id !== threadId);
    setThreads(remaining);
    if (activeThreadId === threadId) setActiveThreadId(remaining[0].id);
  };

  // Real AI send — goes to /api/chat, which can scout + create drafts.
  const send = async (text: string) => {
    if (!text.trim() || isSending) return;
    const userText = text.trim();
    setIsSending(true);

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };
    const isFirstUserMessage = activeThread.messages.filter((m) => m.sender === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? userText.length > 38
        ? `${userText.slice(0, 38)}...`
        : userText
      : activeThread.title;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, title: newTitle, updatedAt: 'Just now', messages: [...t.messages, userMsg] }
          : t
      )
    );
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const { reply, actionTaken } = await apiFetch('/api/chat', {
        method: 'POST',
        body: { message: userText, campaignId: campaigns[0]?.id },
      });
      const assistantMsg: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: reply || 'Done.',
        timestamp: 'Just now',
        actionTaken,
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id ? { ...t, messages: [...t.messages, assistantMsg] } : t
        )
      );
      // The assistant may have created campaigns/drafts — refresh data.
      onDataChanged?.();
    } catch (err: any) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `assistant-${Date.now()}`,
                    sender: 'assistant',
                    text: 'Sorry, I ran into an error processing that. Please try again.',
                    timestamp: 'Just now',
                  } as AssistantMessage,
                ],
              }
            : t
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    send(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(inputText);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputText(prompt);
    send(prompt);
  };

  const promptSuggestions = [
    {
      title: 'Scout hiring signals',
      desc: `Find high-intent companies hiring for ${campaigns[0]?.name || 'my campaign'}`,
      prompt: `Scout 3 new verified hiring leads for ${campaigns[0]?.name || 'my campaign'} and queue draft emails for review.`,
    },
    {
      title: 'Draft review audit',
      desc: `Review ${pendingDraftsCount} pending emails and verify signal freshness`,
      prompt: "What's currently waiting in my review queue and what verified signals triggered them?",
    },
    {
      title: 'Weekly signal brief',
      desc: 'Summarize trigger detections, open rates, and reply quality',
      prompt: 'Summarize this week’s outreach performance, active intent signals, and replies.',
    },
    {
      title: 'Custom targeting test',
      desc: 'Find companies that raised funding and are expanding outbound',
      prompt: 'Find recent companies that announced funding this month and are hiring for outbound.',
    },
  ];

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div id="dashboard-assistant-view" className="h-full w-full flex bg-[#ffffff] overflow-hidden relative">
      {/* Left Chat History Panel */}
      <aside
        className={`w-[260px] sm:w-[280px] bg-[#f9f6f1] border-r border-[#0a2414]/10 flex flex-col shrink-0 transition-all duration-200 z-20 ${
          isHistoryOpen ? 'absolute inset-y-0 left-0 shadow-xl lg:static lg:shadow-none' : 'hidden lg:flex'
        }`}
      >
        <div className="p-3 border-b border-[#0a2414]/10 flex items-center justify-between gap-2">
          <button
            onClick={handleCreateNewThread}
            className="flex-1 py-2 px-3 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 hover:border-[#0a2414]/25 text-[13px] font-medium text-[#0a2414] transition-all flex items-center justify-between shadow-none"
          >
            <span>+ New chat</span>
            <span className="text-[11px] text-[#607166]">⌘K</span>
          </button>
          {isHistoryOpen && (
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="lg:hidden p-2 rounded-[10px] text-[#607166] hover:bg-[#ffffff] hover:text-[#0a2414] text-[12px]"
            >
              Close
            </button>
          )}
        </div>

        <div className="p-3 border-b border-[#0a2414]/6">
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="Search chat history..."
            className="w-full px-2.5 py-1.5 rounded-[8px] bg-[#ffffff] border border-[#0a2414]/10 text-[12px] text-[#0a2414] placeholder-[#607166] outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-[#607166]">
            Recent Threads ({filteredThreads.length})
          </div>
          {filteredThreads.map((thread) => {
            const isActive = thread.id === activeThread.id;
            return (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setIsHistoryOpen(false);
                }}
                className={`w-full group text-left px-3 py-2 rounded-[10px] transition-colors cursor-pointer flex items-center justify-between text-[13px] ${
                  isActive
                    ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/10 font-medium'
                    : 'text-[#607166] hover:bg-[#ffffff]/60 hover:text-[#0a2414]'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <div className="truncate">{thread.title}</div>
                  <div className="text-[11px] text-[#607166] opacity-75">{thread.createdAt}</div>
                </div>
                <button
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  title="Delete thread"
                  className="opacity-0 group-hover:opacity-100 hover:text-[#ba1a1a] p-1 text-[12px] transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#0a2414]/10 text-[12px] text-[#607166] flex items-center justify-between">
          <span>clerk Assistant</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#f3fbe9] text-[#17b267] font-medium">
            Active
          </span>
        </div>
      </aside>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
        <header className="h-[52px] px-4 sm:px-8 border-b border-[#0a2414]/8 bg-[#ffffff] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="lg:hidden px-2.5 py-1 rounded-[8px] bg-[#f9f6f1] border border-[#0a2414]/10 text-[12px] font-medium text-[#0a2414]"
            >
              Chats ({threads.length})
            </button>
            <span className="text-[14px] font-semibold text-[#0a2414] tracking-tight truncate max-w-[280px] sm:max-w-md">
              {activeThread.title}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateNewThread}
              className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[#607166] hover:text-[#0a2414] hover:bg-[#f9f6f1] transition-colors border border-transparent hover:border-[#0a2414]/10"
            >
              + New thread
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-[768px] mx-auto w-full space-y-6">
            {activeThread.messages.length <= 1 && (
              <section className="text-center py-6 space-y-3">
                <h1 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.02em] text-[#0a2414]">
                  What would you like to scout or draft?
                </h1>
                <p className="text-[16px] font-normal leading-[1.5] text-[#607166] max-w-[560px] mx-auto">
                  clerk monitors job postings, funding news, and executive moves to generate verified outreach drafts. Every draft stays in review until you approve.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] pt-4 text-left">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(item.prompt)}
                      className="p-4 rounded-[10px] bg-[#f9f6f1] border border-[#0a2414]/10 hover:bg-[#ffffff] hover:border-[#0a2414]/25 transition-all text-left group"
                    >
                      <div className="text-[14px] font-medium text-[#0a2414] mb-1">{item.title}</div>
                      <div className="text-[13px] font-normal text-[#607166] leading-[1.43] group-hover:text-[#283a2e]">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="space-y-6">
              {activeThread.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}>
                    <div className="flex items-center space-x-2 px-1 text-[13px] font-medium text-[#607166]">
                      <span>{isUser ? 'You' : 'clerk'}</span>
                      <span className="text-[12px] opacity-60 font-normal">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[88%] sm:max-w-[82%] rounded-[10px] p-4 text-[16px] font-normal leading-[1.5] border ${
                        isUser
                          ? 'bg-[#0a2414] text-[#ffffff] border-[#0a2414]'
                          : 'bg-[#f9f6f1] text-[#0a2414] border-[#0a2414]/10'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.actionTaken && msg.actionTaken.type === 'drafts_created' && (
                        <div className="mt-4 pt-3 border-t border-[#0a2414]/10 bg-[#ffffff] p-3.5 rounded-[10px] text-[14px] text-[#0a2414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-[#0a2414]">
                              {msg.actionTaken.count || 0} new signal-grounded drafts created
                            </div>
                            <div className="text-[13px] text-[#607166]">
                              {msg.actionTaken.details || `Targeted across ${campaigns[0]?.name || 'your campaign'}`}
                            </div>
                          </div>
                          <button
                            onClick={onNavigateToDrafts}
                            className="px-4 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13px] font-medium tracking-tight transition-all active:scale-[0.98] shrink-0"
                          >
                            Review in queue ({pendingDraftsCount})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex flex-col items-start space-y-1.5">
                  <div className="flex items-center space-x-2 px-1 text-[13px] font-medium text-[#607166]">
                    <span>clerk</span>
                  </div>
                  <div className="max-w-[82%] rounded-[10px] p-4 bg-[#f9f6f1] border border-[#0a2414]/10">
                    <span className="inline-block w-4 h-4 border-2 border-[#17b267] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="px-4 sm:px-6 pb-4 pt-2 bg-[#ffffff] border-t border-[#0a2414]/10 shrink-0">
          <div className="max-w-[768px] mx-auto w-full">
            <form
              onSubmit={handleSend}
              className="p-3 rounded-[10px] border border-[#0a2414]/15 bg-[#ffffff] focus-within:border-[#0a2414]/40 transition-colors flex flex-col space-y-2"
            >
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask clerk to scout signals, write drafts for a target company, or refine campaign voice..."
                className="w-full text-[15px] font-normal leading-[1.5] text-[#0a2414] placeholder-[#607166]/70 outline-none resize-none bg-transparent"
              />
              <div className="flex items-center justify-end pt-2 border-t border-[#0a2414]/6">
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all ${
                    inputText.trim() && !isSending
                      ? 'bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] active:scale-[0.98]'
                      : 'bg-[#0a2414]/8 text-[#0a2414]/40 cursor-not-allowed'
                  }`}
                >
                  {isSending ? 'Sending...' : 'Send prompt'}
                </button>
              </div>
            </form>
            <p className="text-[12px] text-[#607166] text-center mt-2 leading-[1.43]">
              clerk drafts require founder or operator review before any message is dispatched.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
