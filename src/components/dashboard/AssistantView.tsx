import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage, Campaign, ChatThread } from '../../types';

interface AssistantViewProps {
  campaigns: Campaign[];
  pendingDraftsCount: number;
  onNavigateToDrafts: () => void;
  chatThreads?: ChatThread[];
  onSendMessage?: (text: string, threadId?: string) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  campaigns,
  pendingDraftsCount,
  onNavigateToDrafts,
}) => {
  // Chat Threads State
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread-1',
      title: 'Series A Hiring Signals Scout',
      createdAt: 'Today, 2:15 PM',
      updatedAt: 'Just now',
      messages: [
        {
          id: 'msg-1',
          sender: 'assistant',
          text: `Hello Chidera. I am your clerk outbound assistant.\n\nI continuously monitor job boards, funding filings, tech stack changes, and community discussions. Ask me to find leads for a campaign, review the pending draft queue, or summarize this week’s outreach metrics.`,
          timestamp: '2:15 PM',
        },
        {
          id: 'msg-2',
          sender: 'user',
          text: 'Scout 3 new verified hiring leads for series-a-hiring and queue draft emails for review.',
          timestamp: '2:18 PM',
        },
        {
          id: 'msg-3',
          sender: 'assistant',
          text: `Found 3 verified intent triggers matching the **series-a-hiring** criteria:\n\n1. **Veloce Data** (velocedata.io)\n   • Trigger: Posted 3 Staff Backend & Infrastructure roles 2 hours ago.\n   • Contact: Marcus Vance (VP Engineering).\n   • Draft queued: Citing their new engineering openings and deliverability scaling.\n\n2. **Kestrel Health** (kestrelhealth.com)\n   • Trigger: Closed $14.5M Series A and opened 4 GTM engineering requisitions.\n   • Contact: Devon Miller (Director of Infrastructure).\n   • Draft queued: Citing Series A pipeline expansion.\n\n3. **Hyperion Labs** (hyperionlabs.ai)\n   • Trigger: Added Apollo & Postgres tags, hiring Head of Outbound Ops.\n   • Contact: Sarah Jenkins (Head of Ops).\n   • Draft queued: Citing deliverability transition.\n\nAll 3 drafts have been saved in your review queue with full trigger citations.`,
          timestamp: '2:18 PM',
          actionTaken: {
            type: 'drafts_created',
            count: 3,
            details: 'Queued for series-a-hiring campaign',
          },
        },
      ],
    },
    {
      id: 'thread-2',
      title: 'Competitor Switchers & Deliverability',
      createdAt: 'Yesterday, 4:30 PM',
      updatedAt: 'Yesterday, 4:35 PM',
      messages: [
        {
          id: 'msg-2-1',
          sender: 'user',
          text: 'Find public complaints regarding sequencer deliverability drops and draft custom peer-to-peer outreach.',
          timestamp: '4:30 PM',
        },
        {
          id: 'msg-2-2',
          sender: 'assistant',
          text: `Monitored Reddit (r/sales) and X discussions over the past 48 hours.\n\nDetected signal:\n• **Claire Zhao** (Nova Systems) discussed shared IP pool deliverability drops on legacy sequencers.\n• Trigger quote: "Our cold email open rates cratered by 60% after vendor migrated shared sending pools."\n\nGenerated draft #488 citing this exact public note with zero spam language, emphasizing clerk's 14-day warm-up and private Gmail app password architecture.`,
          timestamp: '4:31 PM',
        },
      ],
    },
    {
      id: 'thread-3',
      title: 'Weekly Signals & Reply Summary',
      createdAt: 'Aug 17, 2026',
      updatedAt: 'Aug 17, 2026',
      messages: [
        {
          id: 'msg-3-1',
          sender: 'user',
          text: 'Summarize this week’s outreach performance, active intent signals, and positive replies.',
          timestamp: 'Aug 17, 9:00 AM',
        },
        {
          id: 'msg-3-2',
          sender: 'assistant',
          text: `### Weekly Outreach Brief\n\n• **Intent Signals Detected**: 48 (+14% vs last week)\n• **Emails Dispatched**: 184 (Native Gmail safe ramp)\n• **Positive Replies**: 26 (14.1% reply rate — 3.8x above generic cold email)\n• **Mailbox Health**: 99.1% across all 4 connected accounts\n• **Top Performing Trigger**: Hiring surges in Infrastructure & Data Engineering (18.2% reply rate).\n\nZero spam flags or bounce spikes detected.`,
          timestamp: 'Aug 17, 9:01 AM',
        },
      ],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  // Create a brand new thread
  const handleCreateNewThread = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New conversation',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `Hello Chidera. Ask me to scout verified intent triggers, inspect target companies, review drafts, or adjust your campaign voice.`,
          timestamp: 'Just now',
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
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
    if (activeThreadId === threadId) {
      setActiveThreadId(remaining[0].id);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
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

    // Simulate smart grounded response
    let assistantReply = `Understood. I scanned verified signals for "${userText}".\n\nFound 2 high-intent matching companies:\n1. **Aether Analytics** (aether.io) — Posted 2 VP Engineering openings with data pipeline focus.\n2. **Vigil Security** (vigilsec.com) — Closed $8.2M seed round, expanding outbound GTM.\n\nI have generated draft outreach citing these triggers and placed them in your review queue.`;
    let actionPayload: AssistantMessage['actionTaken'] = {
      type: 'drafts_created',
      count: 2,
      details: `Generated from trigger query: "${userText.slice(0, 30)}"`,
    };

    if (userText.toLowerCase().includes('summary') || userText.toLowerCase().includes('brief') || userText.toLowerCase().includes('metric')) {
      assistantReply = `### Live Signal & Deliverability Summary\n\n• **Active Watching Targets**: ${campaigns.reduce((acc, c) => acc + c.leadsCount, 0)} companies\n• **Pending Queue**: ${pendingDraftsCount} drafts awaiting approval\n• **Average Reply Rate**: 13.8%\n• **Connected Senders**: 4 mailboxes operating in safe 14-day warm-up ramp.`;
      actionPayload = { type: 'summary' };
    }

    const assistantMsg: AssistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      sender: 'assistant',
      text: assistantReply,
      timestamp: 'Just now',
      actionTaken: actionPayload,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            title: newTitle,
            updatedAt: 'Just now',
            messages: [...t.messages, userMsg, assistantMsg],
          };
        }
        return t;
      })
    );

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => {
      onSendMessageSubmit(prompt);
    }, 50);
  };

  const onSendMessageSubmit = (text: string) => {
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: 'Just now',
    };

    const newTitle = activeThread.title === 'New conversation'
      ? text.length > 38 ? `${text.slice(0, 38)}...` : text
      : activeThread.title;

    const assistantMsg: AssistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      sender: 'assistant',
      text: `Grounded query complete for "${text}". Found 3 live intent triggers across job postings and funding news. Drafts generated and queued.`,
      timestamp: 'Just now',
      actionTaken: {
        type: 'drafts_created',
        count: 3,
        details: 'Grounded in verified hiring signals',
      },
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            title: newTitle,
            updatedAt: 'Just now',
            messages: [...t.messages, userMsg, assistantMsg],
          };
        }
        return t;
      })
    );
    setInputText('');
  };

  const promptSuggestions = [
    {
      title: 'Scout hiring signals',
      desc: `Find 3 high-intent companies hiring engineers for ${campaigns[0]?.name || 'Outreach'}`,
      prompt: `Scout 3 new verified hiring leads for ${campaigns[0]?.name || 'Series A Hiring'} and queue draft emails for review.`,
    },
    {
      title: 'Draft review audit',
      desc: `Review ${pendingDraftsCount} pending emails and verify signal freshness`,
      prompt: "What's currently waiting in my review queue and what verified signals triggered them?",
    },
    {
      title: 'Weekly signal brief',
      desc: 'Summarize trigger detections, open rates, and reply quality',
      prompt: 'Summarize this week’s outreach performance, active intent signals, and positive replies.',
    },
    {
      title: 'Custom targeting test',
      desc: 'Find VP Engineering contacts at fintech companies that raised funding',
      prompt: 'Find recent Series B fintech companies that announced product expansions this month.',
    },
  ];

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div
      id="dashboard-assistant-view"
      className="h-full w-full flex bg-[#ffffff] overflow-hidden relative"
    >
      {/* Left Chat History Panel (ChatGPT style history drawer/rail) */}
      <aside
        className={`w-[260px] sm:w-[280px] bg-[#f9f6f1] border-r border-[#0a2414]/10 flex flex-col shrink-0 transition-all duration-200 z-20 ${
          isHistoryOpen
            ? 'absolute inset-y-0 left-0 shadow-xl lg:static lg:shadow-none'
            : 'hidden lg:flex'
        }`}
      >
        {/* Top History Action */}
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

        {/* Search Chat History */}
        <div className="p-3 border-b border-[#0a2414]/6">
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="Search chat history..."
            className="w-full px-2.5 py-1.5 rounded-[8px] bg-[#ffffff] border border-[#0a2414]/10 text-[12px] text-[#0a2414] placeholder-[#607166] outline-none"
          />
        </div>

        {/* Thread History List */}
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

        {/* Bottom Panel Info */}
        <div className="p-3 border-t border-[#0a2414]/10 text-[12px] text-[#607166] flex items-center justify-between">
          <span>clerk Assistant</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#f3fbe9] text-[#17b267] font-medium">
            Active
          </span>
        </div>
      </aside>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
        {/* Top Header Strip */}
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

        {/* Main Conversation Surface (~720-768px centered column) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-[768px] mx-auto w-full space-y-6">
            {/* Welcome Display Block (Shows when initial/clean thread) */}
            {activeThread.messages.length <= 1 && (
              <section className="text-center py-6 space-y-3">
                <h1 className="text-[24px] font-semibold leading-[1.33] tracking-[-0.02em] text-[#0a2414]">
                  What would you like to scout or draft?
                </h1>
                <p className="text-[16px] font-normal leading-[1.5] text-[#607166] max-w-[560px] mx-auto">
                  clerk monitors job postings, funding news, and executive moves to generate verified outreach drafts. Every draft stays in review until you approve.
                </p>

                {/* Prompt Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] pt-4 text-left">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(item.prompt)}
                      className="p-4 rounded-[10px] bg-[#f9f6f1] border border-[#0a2414]/10 hover:bg-[#ffffff] hover:border-[#0a2414]/25 transition-all text-left group"
                    >
                      <div className="text-[14px] font-medium text-[#0a2414] mb-1">
                        {item.title}
                      </div>
                      <div className="text-[13px] font-normal text-[#607166] leading-[1.43] group-hover:text-[#283a2e]">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Messages Stream */}
            <div className="space-y-6">
              {activeThread.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    {/* Sender Identifier */}
                    <div className="flex items-center space-x-2 px-1 text-[13px] font-medium text-[#607166]">
                      <span>{isUser ? 'You' : 'clerk'}</span>
                      <span className="text-[12px] opacity-60 font-normal">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble Surface */}
                    <div
                      className={`max-w-[88%] sm:max-w-[82%] rounded-[10px] p-4 text-[16px] font-normal leading-[1.5] border ${
                        isUser
                          ? 'bg-[#0a2414] text-[#ffffff] border-[#0a2414]'
                          : 'bg-[#f9f6f1] text-[#0a2414] border-[#0a2414]/10'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Integrated Action Card if drafts were generated */}
                      {msg.actionTaken && msg.actionTaken.type === 'drafts_created' && (
                        <div className="mt-4 pt-3 border-t border-[#0a2414]/10 bg-[#ffffff] p-3.5 rounded-[10px] text-[14px] text-[#0a2414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-[#0a2414]">
                              {msg.actionTaken.count || 3} new signal-grounded drafts created
                            </div>
                            <div className="text-[13px] text-[#607166]">
                              {msg.actionTaken.details || `Targeted across ${campaigns[0]?.name || 'Outreach'} campaign`}
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
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Centered Prompt Input Area */}
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
                  disabled={!inputText.trim()}
                  className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all ${
                    inputText.trim()
                      ? 'bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] active:scale-[0.98]'
                      : 'bg-[#0a2414]/8 text-[#0a2414]/40 cursor-not-allowed'
                  }`}
                >
                  Send prompt
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
