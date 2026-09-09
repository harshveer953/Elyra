import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle, Ticket, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "login") {
        if (!formData.email || !formData.password) {
          throw new Error("Please enter both email and password.");
        }
        await login(formData.email, formData.password);
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          throw new Error("Please fill in all fields to create your account.");
        }
        await register(formData.name, formData.email, formData.phone, formData.password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl z-10"
          style={{
            background: "rgba(24, 24, 27, 0.96)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(63, 63, 70, 0.5)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(220, 38, 38, 0.15)",
          }}
        >
          {/* Header Gradient */}
          <div className="relative p-6 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "#dc2626" }}
                >
                  <Ticket size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                  elyra
                </span>
              </div>
              <button
                onClick={closeAuthModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-zinc-900/90 p-1 mt-5 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === "login"
                    ? "bg-[#dc2626] text-white shadow-lg shadow-red-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === "register"
                    ? "bg-[#dc2626] text-white shadow-lg shadow-red-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {authMode === "register" && (
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Full Name
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus-within:border-[#dc2626] transition-colors">
                  <User size={15} className="text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Aryan Kapoor"
                    className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Email Address
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus-within:border-[#dc2626] transition-colors">
                <Mail size={15} className="text-zinc-500 shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Phone Number
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus-within:border-[#dc2626] transition-colors">
                  <Phone size={15} className="text-zinc-500 shrink-0" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Password
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus-within:border-[#dc2626] transition-colors">
                <Lock size={15} className="text-zinc-500 shrink-0" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 outline-none"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: "#dc2626",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 0 25px rgba(220, 38, 38, 0.4)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === "login" ? "Sign In to Elyra" : "Create Account"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="px-6 pb-6 text-center">
            <p className="text-zinc-500 text-xs flex items-center justify-center gap-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
              <Sparkles size={12} className="text-[#dc2626]" />
              Instant access to tickets, exclusive discounts & AI recommendations.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
