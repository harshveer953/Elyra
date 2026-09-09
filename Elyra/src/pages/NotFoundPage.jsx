import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.06) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <Ticket size={40} style={{ color: "#dc2626" }} strokeWidth={1.5} />
          </div>
        </motion.div>

        <h1 className="text-8xl font-black text-white mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#dc2626" }}>404</h1>
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Show's Over Here</h2>
        <p className="text-zinc-500 mb-10 max-w-md mx-auto" style={{ fontFamily: "DM Sans, sans-serif" }}>
          This page packed up and left. Let's get you back to the main stage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold"
              style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold border border-zinc-600 text-white hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Browse Events
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
