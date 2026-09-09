import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Ticket, Heart, Settings, LogOut, ChevronRight,
  Star, MapPin, Calendar, Award, Zap, Coins,
  RefreshCw, CheckCircle2, Loader2, AlertCircle, Shield
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchMyTickets, cancelTicket } from "../services/api";
import { EVENTS as DEFAULT_EVENTS } from "../data/events";

const TABS = ["My Tickets", "Wishlist", "Settings"];

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "My Tickets";

  const { user, isAuthenticated, logout, openAuthModal, updateCredits } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [notifOn, setNotifOn] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const loadTickets = async () => {
    if (!isAuthenticated) return;
    setLoadingTickets(true);
    try {
      const data = await fetchMyTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.warn("Failed to fetch tickets from backend:", err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this ticket? The billed amount will be refunded directly to your Elyra wallet credits.")) {
      return;
    }

    setCancellingId(ticketId);
    setStatusMsg({ type: "", text: "" });

    try {
      const updatedTicket = await cancelTicket(ticketId);
      // Update tickets list locally
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: "cancelled" } : t))
      );

      // Refund credits locally in state
      if (user && updatedTicket.billedAmount) {
        updateCredits((user.credits || 0) + updatedTicket.billedAmount);
      }

      setStatusMsg({
        type: "success",
        text: `Ticket cancelled successfully! ₹${updatedTicket.billedAmount?.toLocaleString() || "amount"} refunded to your credits.`,
      });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to cancel ticket.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
          <User size={48} className="mx-auto text-[#dc2626] mb-4" />
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            Sign in to Your Account
          </h2>
          <p className="text-zinc-400 text-sm mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Access your booked tickets, wallet balance, and event preferences.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="px-8 py-3.5 rounded-full font-bold text-sm bg-[#dc2626] text-white cursor-pointer shadow-lg shadow-red-600/30"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const userName = user?.name || "Elyra Member";
  const userEmail = user?.email || "member@elyra.app";
  const userPhone = user?.phone || "+91 98765 43210";
  const userCredits = user?.credits || 0;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      {/* Hero Banner */}
      <div className="relative h-56 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=60"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #09090b 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(220,38,38,0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-10"
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center text-5xl font-black text-white"
              style={{ background: "#dc2626", fontFamily: "Syne, sans-serif", boxShadow: "0 0 40px rgba(220,38,38,0.3)" }}
            >
              {userName[0].toUpperCase()}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                {userName}
              </h1>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60">
                <Award size={12} className="text-[#dc2626]" />
                <span className="text-xs font-bold text-[#dc2626]" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {user?.isAdmin ? "Administrator" : "Verified Member"}
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {userEmail} · {userPhone}
            </p>
            <div className="flex gap-6 text-sm">
              {[
                { label: "Tickets Booked", value: tickets.length },
                { label: "Wallet Credits", value: `₹${userCredits.toLocaleString()}` },
                { label: "Account Status", value: user?.isActive ? "Active" : "Inactive" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-white font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{value}</div>
                  <div className="text-zinc-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 hover:bg-purple-900/60 transition-colors text-xs font-bold"
              >
                <Shield size={14} />
                Admin Console
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900/60 transition-colors text-xs font-bold cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Notifications / Alerts */}
        {statusMsg.text && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-green-950/80 border border-green-800/80 text-green-300"
                : "bg-red-950/80 border border-red-800/80 text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Wallet Balance Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-5 rounded-2xl mb-8"
          style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.12) 0%, rgba(34,211,238,0.05) 100%)", border: "1px solid rgba(220,38,38,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.2)" }}>
              <Coins size={20} style={{ color: "#dc2626" }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Wallet Balance: ₹{userCredits.toLocaleString()} Credits
              </p>
              <p className="text-zinc-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Your credits are automatically deducted during ticket bookings and refunded on cancellation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-zinc-800/40 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{
                fontFamily: "DM Sans, sans-serif",
                background: activeTab === tab ? "#dc2626" : "transparent",
                color: activeTab === tab ? "white" : "#71717a",
                fontWeight: activeTab === tab ? "700" : "500",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "My Tickets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                Your Bookings ({tickets.length})
              </h3>
              <button
                onClick={loadTickets}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                <RefreshCw size={12} className={loadingTickets ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {loadingTickets ? (
              <div className="py-12 text-center text-zinc-500 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#dc2626]" />
                <span>Loading your booked tickets...</span>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket, i) => {
                const eventObj = ticket.event || {};
                const eventTitle = typeof eventObj === "object" ? eventObj.title || "Live Performance" : "Event Booking";
                const eventDate = typeof eventObj === "object" ? eventObj.eventDate || "Upcoming" : "Upcoming";
                const eventVenue = typeof eventObj === "object" ? eventObj.eventLocation || "Main Arena" : "Venue";
                const eventImg = typeof eventObj === "object" ? eventObj.eventImage : "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80";
                const isCancelled = ticket.status === "cancelled";

                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800"
                  >
                    <img src={eventImg || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80"} alt="" className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-white font-bold text-base leading-tight mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                            {eventTitle}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-zinc-400 text-xs mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            <span className="flex items-center gap-1"><Calendar size={11} />{eventDate}</span>
                            <span className="flex items-center gap-1"><MapPin size={11} />{eventVenue}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
                              {ticket.seats} seat{ticket.seats > 1 ? "s" : ""}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 text-[#dc2626]">
                              ₹{ticket.billedAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isCancelled
                                ? "bg-red-950/80 text-red-400 border border-red-800/50"
                                : "bg-green-950/80 text-green-400 border border-green-800/50"
                            }`}
                            style={{ fontFamily: "DM Sans, sans-serif" }}
                          >
                            {ticket.status?.toUpperCase()}
                          </span>
                          <p className="text-zinc-500 text-[11px] mt-2 font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>

                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelTicket(ticket._id)}
                              disabled={cancellingId === ticket._id}
                              className="mt-3 block text-xs text-red-400 hover:text-red-300 underline cursor-pointer disabled:opacity-50"
                            >
                              {cancellingId === ticket._id ? "Cancelling..." : "Cancel Ticket"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800">
                <Ticket size={36} className="mx-auto text-zinc-600 mb-3" />
                <h4 className="text-base font-bold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  No Bookings Yet
                </h4>
                <p className="text-zinc-500 text-xs mb-4">
                  Browse exciting concerts and festivals to book your first experience.
                </p>
                <Link
                  to="/events"
                  className="inline-block px-5 py-2 rounded-full text-xs font-bold bg-[#dc2626] text-white"
                >
                  Explore Events
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "Wishlist" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEFAULT_EVENTS.slice(0, 3).map((ev, i) => (
              <div
                key={ev.id}
                className="rounded-2xl overflow-hidden group bg-zinc-900/60 border border-zinc-800"
              >
                <Link to={`/event/${ev.id}`}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-1" style={{ fontFamily: "Syne, sans-serif" }}>{ev.title}</h3>
                    <p className="text-zinc-500 text-xs mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{ev.date} · {ev.city}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold" style={{ fontFamily: "Syne, sans-serif" }}>₹{ev.price.toLocaleString()}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#dc2626] text-white">Book</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="space-y-4 max-w-xl">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-white font-semibold text-sm mb-1">Account Info</p>
              <p className="text-zinc-400 text-xs mb-3">Name: {userName}</p>
              <p className="text-zinc-400 text-xs mb-3">Email: {userEmail}</p>
              <p className="text-zinc-400 text-xs">Phone: {userPhone}</p>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-white font-semibold text-sm">Push Notifications</p>
                <p className="text-zinc-500 text-xs">Receive updates about new shows and ticket discounts</p>
              </div>
              <button
                onClick={() => setNotifOn(!notifOn)}
                className="w-12 h-6 rounded-full transition-all relative cursor-pointer"
                style={{ background: notifOn ? "#dc2626" : "#3f3f46" }}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    notifOn ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium mt-4 cursor-pointer"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <LogOut size={15} />
              Sign Out from Elyra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
