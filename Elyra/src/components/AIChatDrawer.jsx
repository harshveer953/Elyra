import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, User, Loader2, Minimize2, MessageSquare } from "lucide-react";
import { sendChatMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const QUICK_PROMPTS = [
  "What are the hottest events this week?",
  "Recommend music concerts in Mumbai",
  "Are there any active discount coupons?",
  "How does ticket booking and refund work?",
];

export default function AIChatDrawer() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am Elyra AI Assistant. Ask me anything about upcoming events, ticket bookings, artist lineups, and special coupons! 🎉",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(query);
      const aiReply = typeof response === "string" ? response : response?.reply || response?.text || JSON.stringify(response);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: err.message || "I'm having trouble retrieving live data right now. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl cursor-pointer"
        style={{
          background: "#dc2626",
          color: "white",
          boxShadow: "0 10px 30px rgba(220, 38, 38, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="relative">
          <Bot size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white" />
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Ask Elyra AI
        </span>
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-22 right-6 z-40 w-[92vw] max-w-sm sm:max-w-md h-[550px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: "rgba(18, 18, 20, 0.96)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(63, 63, 70, 0.5)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(220, 38, 38, 0.15)",
            }}
          >
            {/* Header */}
            <div className="p-4 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "#dc2626" }}
                >
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                    Elyra AI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] text-zinc-400" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Online & Live
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.sender === "user" ? "bg-zinc-700" : "bg-[#dc2626]"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={13} className="text-white" /> : <Bot size={14} className="text-white" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#dc2626] text-white rounded-tr-none font-medium"
                        : msg.isError
                        ? "bg-red-950/60 border border-red-800/60 text-red-300 rounded-tl-none"
                        : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/40 rounded-tl-none"
                    }`}
                    style={{ fontFamily: "DM Sans, sans-serif", whiteSpace: "pre-wrap" }}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        msg.sender === "user" ? "text-red-200" : "text-zinc-500"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs p-2">
                  <Loader2 size={14} className="animate-spin text-[#dc2626]" />
                  <span>Elyra is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-[#dc2626] text-[11px] transition-colors"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-zinc-800 bg-zinc-900/90 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAuthenticated ? "Ask about events, tickets, dates..." : "Sign in to chat with AI..."}
                className="flex-1 bg-zinc-800/90 border border-zinc-700/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#dc2626] transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-[#dc2626] text-white flex items-center justify-center disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
