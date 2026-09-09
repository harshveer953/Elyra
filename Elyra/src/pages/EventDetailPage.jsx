import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Clock, Calendar, Users, Shield, Zap,
  Heart, Share2, ChevronRight, Music, Globe, Baby, Tag, Send,
  MessageSquare, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { EVENTS as DEFAULT_EVENTS, SEAT_TIERS } from "../data/events";
import EventCard from "../components/EventCard";
import { fetchEventById, fetchEvents, fetchEventComments, addEventComment } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, openAuthModal } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [selectedTier, setSelectedTier] = useState("gold");
  const [qty, setQty] = useState(2);
  const [liked, setLiked] = useState(false);

  // Reviews & Comments State
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");

  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);
      try {
        // Try fetching single event from backend
        let eventData = null;
        try {
          eventData = await fetchEventById(id);
        } catch {
          // Check if it's in default events
          eventData = DEFAULT_EVENTS.find((e) => e.id.toString() === id || e._id === id);
        }

        if (!eventData) {
          // Fallback to first default event
          eventData = DEFAULT_EVENTS[0];
        }

        setEvent(eventData);

        // Load comments
        try {
          const comms = await fetchEventComments(id);
          if (Array.isArray(comms)) setComments(comms);
        } catch {
          setComments([]);
        }

        // Load related events
        try {
          const all = await fetchEvents();
          if (Array.isArray(all)) {
            setRelatedEvents(all.filter((e) => (e._id || e.id) !== (eventData._id || eventData.id)).slice(0, 3));
          }
        } catch {
          setRelatedEvents(DEFAULT_EVENTS.filter((e) => e.id.toString() !== id).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#dc2626]" />
        <p className="text-zinc-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-zinc-500 mb-4">Event not found or has expired.</p>
          <Link to="/events" className="text-[#dc2626] font-bold">Browse All Events</Link>
        </div>
      </div>
    );
  }

  const basePrice = event.ticketPrice !== undefined ? event.ticketPrice : event.price || 999;
  const currentTier = SEAT_TIERS.find((t) => t.id === selectedTier) || SEAT_TIERS[0];
  const ticketPrice = Math.round(basePrice * currentTier.multiplier);
  const total = ticketPrice * qty;

  const eventTitle = event.title;
  const eventArtist = event.eventArtistName || event.artist || "Live Performance";
  const eventImg = event.eventImage || event.bg || event.image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80";
  const eventDate = event.eventDate || event.date || "Upcoming";
  const eventVenue = event.eventLocation || event.venue || "Main Arena";
  const eventDuration = event.duration || "3 hours";
  const availableSeats = event.totalSeats !== undefined ? event.totalSeats : event.seats || 250;
  const eventDesc = event.description || "Join us for an unforgettable live performance filled with electrifying music, incredible atmosphere, and memories that last a lifetime.";

  const handleBook = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    navigate("/checkout", {
      state: {
        event: {
          ...event,
          _id: event._id || event.id,
          title: eventTitle,
          image: eventImg,
          price: basePrice,
          venue: eventVenue,
          date: eventDate,
        },
        tier: selectedTier,
        qty,
        total,
      },
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setSubmittingComment(true);
    setCommentMsg("");
    try {
      const newComm = await addEventComment(event._id || event.id, {
        text: commentText.trim(),
        rating: Number(commentRating),
      });

      setComments((prev) => [newComm, ...prev]);
      setCommentText("");
      setCommentMsg("Review submitted successfully!");
      setTimeout(() => setCommentMsg(""), 3000);
    } catch (err) {
      setCommentMsg(err.message || "Failed to submit review");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-32">
      {/* Hero */}
      <div className="relative h-[65vh] overflow-hidden">
        <motion.img
          src={eventImg}
          alt={eventTitle}
          className="w-full h-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #09090b 20%, rgba(9,9,11,0.5) 60%, rgba(9,9,11,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(220,38,38,0.12) 0%, transparent 70%)" }} />

        {/* Back Button */}
        <div className="absolute top-24 left-6">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-700/40 text-white text-sm cursor-pointer"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <ArrowLeft size={14} />
            Back
          </motion.button>
        </div>

        {/* Actions */}
        <div className="absolute top-24 right-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-700/40 cursor-pointer"
          >
            <Heart size={16} className={liked ? "fill-red-500 text-red-500" : "text-zinc-400"} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: eventTitle, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Event link copied to clipboard!");
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-700/40 text-zinc-400 cursor-pointer"
          >
            <Share2 size={16} />
          </motion.button>
        </div>

        {/* Tag */}
        <div className="absolute bottom-24 left-6">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
          >
            {availableSeats < 50 ? "SELLING FAST" : "VERIFIED EVENT"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Event Info & Reviews */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Title */}
              <div className="mb-2 text-zinc-400 text-sm font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {eventArtist}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
                {eventTitle}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <Star size={14} style={{ color: "#dc2626" }} fill="#dc2626" />
                  <span className="text-white font-semibold text-sm">4.9</span>
                  <span className="text-zinc-500 text-sm">({comments.length} verified reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Users size={13} className="text-[#dc2626]" />
                  <span className="text-white font-semibold">{availableSeats} seats remaining</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Calendar, label: "Date", value: eventDate },
                  { icon: Clock, label: "Duration", value: eventDuration },
                  { icon: MapPin, label: "Location", value: eventVenue },
                  { icon: Globe, label: "Experience", value: "Live" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-4 rounded-2xl" style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}>
                    <Icon size={14} className="text-zinc-500 mb-2" />
                    <div className="text-xs text-zinc-500 mb-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>{label}</div>
                    <div className="text-white text-sm font-semibold truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>About This Event</h2>
                <p className="text-zinc-300 leading-relaxed text-sm md:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{eventDesc}</p>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Experience Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Live Artist & Dynamic Lighting",
                    "High Definition Audio Setup",
                    "Instant Mobile QR Entry",
                    "Dedicated Security & Sanitization",
                  ].map((h, i) => (
                    <div
                      key={h}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{ background: "rgba(39,39,42,0.4)", border: "1px solid rgba(63,63,70,0.3)" }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.15)" }}>
                        <Zap size={14} style={{ color: "#dc2626" }} />
                      </div>
                      <span className="text-zinc-300 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── REVIEWS & COMMENTS SECTION ── */}
            <div className="pt-8 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#dc2626]" />
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                    Verified Reviews ({comments.length})
                  </h2>
                </div>
              </div>

              {/* Write Review Form */}
              <div className="p-6 rounded-3xl mb-8 bg-zinc-900/60 border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Write a Review
                </h3>
                <form onSubmit={handleAddComment} className="space-y-4">
                  {/* Star Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="text-lg cursor-pointer"
                        >
                          <Star
                            size={18}
                            className={star <= commentRating ? "fill-[#dc2626] text-[#dc2626]" : "text-zinc-600"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={isAuthenticated ? "Share your thoughts about this event..." : "Sign in to leave a review..."}
                      className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-white text-xs placeholder-zinc-500 outline-none focus:border-[#dc2626] transition-colors resize-none"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-5 rounded-xl bg-[#dc2626] text-white flex items-center justify-center font-bold text-xs gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {submittingComment ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      Post
                    </button>
                  </div>

                  {commentMsg && (
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} /> {commentMsg}
                    </p>
                  )}
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comm) => {
                  const author = typeof comm.user === "object" ? comm.user?.name || "Fan" : "Elyra Member";
                  return (
                    <div
                      key={comm._id || Math.random()}
                      className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "#dc2626" }}
                          >
                            {author[0].toUpperCase()}
                          </div>
                          <span className="font-bold text-white text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            {author}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(comm.rating || 5)].map((_, i) => (
                            <Star key={i} size={11} className="fill-[#dc2626] text-[#dc2626]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        {comm.text}
                      </p>
                    </div>
                  );
                })}
                {comments.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-6">
                    No reviews yet. Be the first to review this show!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-28"
            >
              <div className="p-6 rounded-3xl" style={{ background: "rgba(24,24,27,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(63,63,70,0.5)" }}>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Select Ticket Tier</h3>

                {/* Tiers */}
                <div className="flex flex-col gap-3 mb-6">
                  {SEAT_TIERS.map((tier) => {
                    const price = Math.round(basePrice * tier.multiplier);
                    const isSelected = selectedTier === tier.id;
                    return (
                      <motion.button
                        key={tier.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all text-left cursor-pointer ${isSelected ? "border-2" : "border border-zinc-700/40 bg-zinc-800/30"}`}
                        style={{
                          ...(isSelected ? { borderColor: tier.color, background: `${tier.color}15` } : {}),
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: tier.color, boxShadow: isSelected ? `0 0 12px ${tier.color}` : "none" }} />
                          <div>
                            <div className="text-white font-semibold text-sm" style={{ fontFamily: "DM Sans, sans-serif", color: isSelected ? tier.color : "white" }}>
                              {tier.label}
                            </div>
                            <div className="text-zinc-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>{tier.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm" style={{ fontFamily: "Syne, sans-serif", color: isSelected ? tier.color : "white" }}>
                            ₹{price.toLocaleString()}
                          </div>
                          <div className="text-zinc-600 text-xs">per seat</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quantity (backend enforces max 5 seats per user) */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-zinc-400 text-sm block" style={{ fontFamily: "DM Sans, sans-serif" }}>Quantity</span>
                    <span className="text-zinc-600 text-[11px]">Max 5 seats / order</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center text-lg hover:bg-zinc-600 transition-colors cursor-pointer"
                    >−</button>
                    <span className="text-white font-bold text-lg w-6 text-center" style={{ fontFamily: "Syne, sans-serif" }}>{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(5, Math.min(availableSeats, qty + 1)))}
                      className="w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center text-lg hover:bg-zinc-600 transition-colors cursor-pointer"
                    >+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-zinc-700/40 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2 text-sm text-zinc-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    <span>₹{ticketPrice.toLocaleString()} × {qty} seats</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-white mt-3 pt-3 border-t border-zinc-700/40" style={{ fontFamily: "Syne, sans-serif" }}>
                    <span>Total Amount</span>
                    <span className="text-xl text-[#dc2626]">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBook}
                  className="w-full py-4 rounded-2xl font-bold text-base transition-all cursor-pointer text-white"
                  style={{
                    background: "#dc2626",
                    fontFamily: "DM Sans, sans-serif",
                    boxShadow: "0 0 30px rgba(220,38,38,0.35)",
                  }}
                >
                  Proceed to Checkout →
                </motion.button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  {["Instant E-Ticket", "Easy Refunds", "AI Support"].map((badge) => (
                    <div key={badge} className="flex items-center gap-1 text-zinc-600 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      <Shield size={10} />
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>You Might Also Like</h2>
              <Link to="/events" className="text-zinc-400 hover:text-[#dc2626] text-sm flex items-center gap-1 transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((ev, i) => (
                <EventCard key={ev._id || ev.id} event={ev} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
