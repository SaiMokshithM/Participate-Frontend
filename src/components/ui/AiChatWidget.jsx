import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendAiMessage } from '@/api/aiApi';
import { X, Send, Sparkles, Bot, Zap, CalendarDays, HelpCircle } from 'lucide-react';

// ── Design tokens (matching StudentDashboard palette) ──────────────────
const SIDEBAR_BG = '#1C2B33';
const ACCENT = '#8BAEBF';
const ACCENT_BG = 'rgba(139,174,191,0.12)';
const BORDER = 'rgba(139,174,191,0.22)';
const TEXT = '#1C2B33';
const TEXT_SUB = '#4A6572';
const CARD_BG = '#FFFFFF';

// ── Typing indicator (three bouncing dots) ─────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: ACCENT, display: 'inline-block',
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Individual message bubble ──────────────────────────────────────────
function MessageBubble({ msg }) {
  const isAi = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      style={{
        display: 'flex',
        justifyContent: isAi ? 'flex-start' : 'flex-end',
        marginBottom: 10,
      }}
    >
      {isAi && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${SIDEBAR_BG}, ${ACCENT})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 8, marginTop: 2, boxShadow: `0 2px 8px rgba(139,174,191,0.4)`,
        }}>
          <Bot style={{ width: 14, height: 14, color: '#fff' }} />
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '9px 13px',
        borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isAi
          ? `linear-gradient(135deg, ${ACCENT_BG}, rgba(139,174,191,0.08))`
          : `linear-gradient(135deg, ${SIDEBAR_BG}, #2d3f49)`,
        color: isAi ? TEXT : '#fff',
        fontSize: 13,
        lineHeight: 1.55,
        fontWeight: 450,
        border: isAi ? `1px solid ${BORDER}` : 'none',
        boxShadow: isAi
          ? '0 1px 4px rgba(0,0,0,0.06)'
          : '0 2px 10px rgba(28,43,51,0.22)',
        letterSpacing: '0.01em',
      }}>
        {msg.text}
      </div>
    </motion.div>
  );
}

// ── Main widget ────────────────────────────────────────────────────────
export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (overrideMessage) => {
    const text = (overrideMessage ?? inputValue).trim();
    if (!text || isLoading) return;

    if (!overrideMessage) {
      setInputValue('');
    }

    // Show user message (skip for the hidden greeting trigger)
    if (!overrideMessage) {
      setMessages((prev) => [...prev, { role: 'user', text }]);
    }

    setIsLoading(true);
    try {
      const data = await sendAiMessage(text);
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: "Oops! I'm having a moment. 😅 Please try again shortly!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      icon: Zap,
      label: 'Motivation',
      description: 'Fire me up!',
      prompt: 'Motivate me with powerful reasons to participate in campus events and activities. I need energy and inspiration!',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.10)',
    },
    {
      icon: CalendarDays,
      label: 'Available Events',
      description: 'What\'s on now?',
      prompt: 'List ALL events currently available for students to join. Give details about each one and why I should participate.',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.10)',
    },
    {
      icon: HelpCircle,
      label: 'Why Participate+',
      description: 'Learn the benefits',
      prompt: 'Why should I use the Participate+ platform? What are the key features, benefits, and how will it help my college journey?',
      color: '#818cf8',
      bg: 'rgba(129,140,248,0.10)',
    },
  ];

  return (
    <>
      {/* ── Floating trigger button ────────────────────────────────── */}
      <motion.button
        id="ai-chat-trigger"
        onClick={() => setIsOpen((p) => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: `linear-gradient(135deg, ${SIDEBAR_BG} 0%, #2d4a58 50%, ${ACCENT} 100%)`,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 4px 20px rgba(28,43,51,0.35)',
        }}
      >
        {/* Pulsing ring */}
        {!isOpen && (
          <motion.div
            style={{
              position: 'absolute', width: 56, height: 56, borderRadius: '50%',
              border: `2px solid ${ACCENT}`, opacity: 0.5,
            }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close"
              initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.18 }}>
              <X style={{ width: 22, height: 22, color: '#fff' }} />
            </motion.div>
          ) : (
            <motion.div key="open"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
              <Sparkles style={{ width: 22, height: 22, color: '#fff' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed', bottom: 96, right: 28, zIndex: 999,
              width: 360, height: 520, borderRadius: 20, overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(28,43,51,0.22), 0 4px 16px rgba(28,43,51,0.12)',
              border: `1px solid ${BORDER}`,
              backgroundColor: CARD_BG,
            }}
          >
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${SIDEBAR_BG} 0%, #2d4a58 60%, #3a5a6e 100%)`,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
              flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}, #60a5fa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 10px rgba(139,174,191,0.4)`,
              }}>
                <Bot style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#E8F4F8', fontWeight: 700, fontSize: 14 }}>
                  Participate+ AI
                </p>
                <p style={{ margin: 0, color: `${ACCENT}`, fontSize: 11, marginTop: 1 }}>
                  Powered by GPT · Always here to help 🚀
                </p>
              </div>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <motion.div
                  style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#34d399' }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span style={{ color: '#34d399', fontSize: 10, fontWeight: 600 }}>LIVE</span>
              </div>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '14px 14px 6px',
              display: 'flex', flexDirection: 'column',
              scrollbarWidth: 'thin',
              scrollbarColor: `${BORDER} transparent`,
            }}>
              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: TEXT_SUB }}>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ fontSize: 36, marginBottom: 10 }}>🤖</motion.div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0 }}>
                    Hi! I'm your AI assistant
                  </p>
                  <p style={{ fontSize: 12, marginTop: 4, color: TEXT_SUB }}>
                    Ask me about events, get motivated, or explore activities!
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${SIDEBAR_BG}, ${ACCENT})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Bot style={{ width: 14, height: 14, color: '#fff' }} />
                  </div>
                  <div style={{
                    padding: '6px 12px', borderRadius: '4px 16px 16px 16px',
                    background: ACCENT_BG, border: `1px solid ${BORDER}`,
                  }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Actions (shown when no messages yet and not loading) ── */}
            {messages.length === 0 && !isLoading && (
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <p style={{ margin: '0 0 4px 2px', fontSize: 10, fontWeight: 700, color: TEXT_SUB, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Quick Actions
                </p>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.025, x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMessages((prev) => [...prev, { role: 'user', text: action.label }]);
                        handleSend(action.prompt);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 12,
                        border: `1px solid ${BORDER}`,
                        background: action.bg,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                        width: '100%',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: action.bg,
                        border: `1.5px solid ${action.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon style={{ width: 15, height: 15, color: action.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                          {action.label}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: TEXT_SUB, marginTop: 1 }}>
                          {action.description}
                        </p>
                      </div>
                      <span style={{ fontSize: 14, color: action.color, flexShrink: 0, opacity: 0.7 }}>›</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: BORDER, flexShrink: 0 }} />

            {/* Input row */}
            <div style={{
              padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: CARD_BG, flexShrink: 0,
            }}>
              <input
                id="ai-chat-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
                maxLength={500}
                data-max-tokens={500}
                style={{
                  flex: 1, padding: '9px 14px', borderRadius: 12,
                  border: `1.5px solid ${BORDER}`, outline: 'none',
                  fontSize: 13, color: TEXT, backgroundColor: '#f8fafc',
                  fontFamily: 'inherit', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = ACCENT; }}
                onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                disabled={isLoading}
              />
              <motion.button
                id="ai-chat-send"
                onClick={() => handleSend()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: 'none',
                  background: (!isLoading && inputValue.trim())
                    ? `linear-gradient(135deg, ${SIDEBAR_BG}, ${ACCENT})`
                    : BORDER,
                  cursor: (!isLoading && inputValue.trim()) ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                <Send style={{ width: 15, height: 15, color: '#fff' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
