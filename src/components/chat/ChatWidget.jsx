import React, { useEffect, useRef, useState } from 'react';

// Tailwind-based floating chat widget for buyer support
// Responsive, no external UI libs; positioned above existing message button

const ChatWidget = ({ iconUrl, headerIconUrl, buttonIconUrl }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Push user message immediately
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // Call backend API
      const res = await fetch('/api/chat/buyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      // Example flexible response handling
      // Expected: { reply: string, products?: Product[], intent?: string, confidence?: number }
      // Also tolerate { message: string } or nested shapes
      const replyText =
        data?.reply || data?.message || data?.data?.reply || 'Xin lỗi, hiện tại hệ thống bận.';
      const products = data?.products || data?.data?.products || [];

      const botMsg = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: replyText,
        products: Array.isArray(products) ? products : [],
        meta: {
          intent: data?.intent ?? data?.data?.intent,
          confidence: typeof data?.confidence === 'number' ? data?.confidence : data?.data?.confidence,
        },
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const botErr = {
        id: `${Date.now()}-err`,
        sender: 'bot',
        text: 'Xin lỗi, không gửi được yêu cầu. Vui lòng thử lại.',
      };
      setMessages((prev) => [...prev, botErr]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Inline SVG (alien mascot) as data URI for header icon
  const alienIconDataUri =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="#22d3ee" d="M12 2C7.58 2 4 5.58 4 10c0 5.25 5.2 9.5 8 12 2.8-2.5 8-6.75 8-12 0-4.42-3.58-8-8-8z"/>
        <circle cx="9" cy="10" r="2.2" fill="#0ea5e9"/>
        <circle cx="15" cy="10" r="2.2" fill="#0ea5e9"/>
        <path d="M8 14c1.2 1 2.7 1.5 4 1.5S14.8 15 16 14" stroke="#0ea5e9" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>`
    );
  const headerIcon = headerIconUrl || iconUrl || alienIconDataUri;

  // Default robot icon for the toggle button (similar style to provided image)
  const robotIconDataUri =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#60a5fa"/>
            <stop offset="1" stop-color="#22d3ee"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#g)" opacity="0.0"/>
        <path fill="#ffffff" d="M12 3c3.6 0 6.5 2.3 6.5 5.6 0 1.8-.7 3.6-1.9 5-1.4 1.6-3.6 3-4.6 3.6-.3.2-.6.2-.9 0-1-.6-3.2-2-4.6-3.6-1.2-1.4-1.9-3.2-1.9-5C4.6 5.3 8.4 3 12 3z"/>
        <rect x="5" y="6.5" width="2" height="2.5" rx="1" fill="#cbd5e1"/>
        <rect x="17" y="6.5" width="2" height="2.5" rx="1" fill="#cbd5e1"/>
        <circle cx="9" cy="10" r="2.2" fill="#0ea5e9"/>
        <circle cx="15" cy="10" r="2.2" fill="#0ea5e9"/>
        <circle cx="9" cy="10" r="1.1" fill="#7dd3fc"/>
        <circle cx="15" cy="10" r="1.1" fill="#7dd3fc"/>
        <path d="M8 14c1.2 1 2.7 1.5 4 1.5S14.8 15 16 14" stroke="#0ea5e9" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M9.5 18h5c.9 0 1.5.7 1.5 1.5v.3c0 .7-.6 1.2-1.2 1.2H9.2c-.7 0-1.2-.6-1.2-1.2v-.3c0-.8.6-1.5 1.5-1.5z" fill="#e2e8f0"/>
      </svg>`
    );
  const buttonIcon = buttonIconUrl || robotIconDataUri;

  return (
    <div
      className="fixed right-6 z-[1001]"
      style={{ bottom: 'var(--chat-widget-bottom, 96px)' }}
      aria-live="polite"
    >
      {!open && (
        <button
          className="w-[60px] h-[60px] rounded-full border-0 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl flex items-center justify-center hover:opacity-95"
          aria-label="Mở hộp thoại hỗ trợ"
          onClick={toggleOpen}
        >
          <img src={buttonIcon} alt="Chat" className="w-7 h-7" />
        </button>
      )}

      {open && (
        <div
          className="absolute right-0 bg-white w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-140px)] rounded-2xl shadow-2xl border border-sky-600/15 overflow-hidden flex flex-col"
          style={{ bottom: '72px' }}
          role="dialog"
          aria-label="Hỗ trợ khách hàng"
        >
          <div className="flex items-center justify-between px-3 py-3 bg-gradient-to-br from-sky-500 to-blue-500 text-white">
            <div className="flex items-center gap-2">
              <img src={headerIcon} alt="Mascot" className="w-6 h-6" />
              <div className="font-semibold">Hỗ trợ khách hàng</div>
            </div>
            <button
              className="bg-transparent border-0 text-white text-xl cursor-pointer"
              onClick={toggleOpen}
              aria-label="Thu nhỏ"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-3 px-2">
                Xin chào! Tôi có thể giúp gì cho bạn?
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === 'user'
                    ? 'flex justify-end my-2'
                    : 'flex justify-start my-2'
                }
              >
                <div
                  className={
                    'max-w-[80%] rounded-xl text-sm leading-snug shadow-sm px-3 py-2 ' +
                    (m.sender === 'user'
                      ? 'bg-sky-100 text-sky-900 rounded-tr-sm'
                      : 'bg-white text-slate-900 rounded-tl-sm')
                  }
                >
                  {m.text}
                </div>

                {m.sender === 'bot' && Array.isArray(m.products) && m.products.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                    {m.products.map((p) => (
                      <div key={p.id || p.sku || Math.random()} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow">
                        <div className="w-full h-[120px] bg-slate-100">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name || 'Sản phẩm'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                        </div>
                        <div className="p-2">
                          <div className="text-[13px] text-slate-900 mb-1">
                            {p.name || 'Sản phẩm'}
                          </div>
                          {typeof p.price === 'number' && (
                            <div className="text-[13px] font-semibold text-sky-700">
                              {new Intl.NumberFormat('vi-VN').format(p.price)}₫
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 p-3 border-t border-slate-200 bg-white">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={sending}
              aria-label="Nhập tin nhắn"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="px-3 py-2 bg-sky-500 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {sending ? '...' : 'Gửi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

