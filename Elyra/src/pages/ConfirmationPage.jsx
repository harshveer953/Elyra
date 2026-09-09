import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, Calendar, MapPin, Ticket, ArrowRight, User } from "lucide-react";
import { SEAT_TIERS } from "../data/events";

export default function ConfirmationPage() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">No confirmation data found.</p>
          <Link to="/" className="text-[#dc2626] font-bold">Go to Home</Link>
        </div>
      </div>
    );
  }

  const { order, event, tier, qty, total, form } = state;
  const tierData = SEAT_TIERS.find((t) => t.id === tier) || SEAT_TIERS[0];
  const orderId = order?._id ? `#${order._id.slice(-8).toUpperCase()}` : `#ELY${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const billedAmount = order?.billedAmount !== undefined ? order.billedAmount : total;
  const eventImg = event.image || event.eventImage || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80";

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(220,38,38,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "rgba(220,38,38,0.15)", border: "2px solid rgba(220,38,38,0.3)", boxShadow: "0 0 60px rgba(220,38,38,0.3)" }}
            >
              <CheckCircle2 size={46} style={{ color: "#dc2626" }} strokeWidth={1.5} />
            </div>
            {/* Animated rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "#dc2626" }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
            Booking Confirmed! 🎉
          </h1>
          <p className="text-zinc-400 text-base md:text-lg" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {form?.name ? `Hey ${form.name.split(" ")[0]}, your` : "Your"} tickets are booked in the backend system.
          </p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl mb-8"
          style={{
            background: "rgba(24,24,27,0.95)",
            border: "1px solid rgba(220,38,38,0.25)",
            boxShadow: "0 0 40px rgba(220,38,38,0.1)",
          }}
        >
          {/* Ticket top */}
          <div className="relative h-44 overflow-hidden">
            <img src={eventImg} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-zinc-950/80 backdrop-blur-sm">
              <span className="text-xs font-mono font-bold" style={{ color: "#dc2626" }}>{orderId}</span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-6">
            <div className="w-6 h-6 rounded-full -ml-9 bg-zinc-950 border border-zinc-700" />
            <div className="flex-1 border-t border-dashed border-zinc-700/60 mx-2" />
            <div className="w-6 h-6 rounded-full -mr-9 bg-zinc-950 border border-zinc-700" />
          </div>

          {/* Ticket body */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-zinc-500 text-xs mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>EVENT</p>
                <h2 className="text-2xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>{event.title}</h2>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>TIER</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: tierData?.color, color: "#09090b", fontFamily: "DM Sans, sans-serif" }}>
                  {tierData?.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "DATE", value: event.date || event.eventDate || "Upcoming" },
                { label: "VENUE", value: event.venue || event.eventLocation || "Arena" },
                { label: "TICKETS", value: `${qty} Seat${qty > 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-zinc-500 text-xs mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{label}</p>
                  <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* QR Placeholder */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-zinc-800/40">
              <div
                className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-xs text-zinc-600"
                style={{
                  background: "repeating-linear-gradient(0deg, rgba(220,38,38,0.08) 0px, rgba(220,38,38,0.08) 2px, transparent 2px, transparent 8px)",
                  border: "1px solid rgba(220,38,38,0.2)",
                }}
              >
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-xs mb-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Direct Gate Entry QR</p>
                <p className="text-zinc-400 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Present this code or show your booking from <span className="text-[#dc2626] font-semibold">My Tickets</span> in your profile.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-5 pt-4 border-t border-zinc-700/40">
              <span className="text-zinc-400 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>Billed Amount</span>
              <span className="text-2xl font-black text-[#dc2626]" style={{ fontFamily: "Syne, sans-serif" }}>
                ₹{billedAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            to="/profile?tab=My%20Tickets"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white"
            style={{ background: "#dc2626", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 30px rgba(220,38,38,0.25)" }}
          >
            <Ticket size={16} />
            View in My Tickets
          </Link>
          <Link
            to="/events"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm border border-zinc-600 text-white hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Discover More Events <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
