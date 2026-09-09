import { motion } from "framer-motion";
import { Ticket } from "lucide-react";

export default function LoadingScreen({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#09090b" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(220,38,38,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "#dc2626", boxShadow: "0 0 60px rgba(220,38,38,0.4)" }}
        >
          <Ticket size={36} className="text-zinc-950" strokeWidth={2.5} />
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            elyra
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-500 text-sm mt-2"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Discover. Experience. Remember.
          </motion.p>
        </div>

        {/* Loading bar */}
        <motion.div className="w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-4">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ background: "#dc2626" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
