import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowRight, Play, TrendingUp, Star, ChevronRight, Zap, Loader2 } from "lucide-react";
import EventCard from "../components/EventCard";
import { EVENTS as DEFAULT_EVENTS, CATEGORIES, STATS, TESTIMONIALS } from "../data/events";
import { fetchEvents } from "../services/api";

export default function HomePage() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const loadLiveEvents = async () => {
      try {
        const liveData = await fetchEvents();
        if (Array.isArray(liveData) && liveData.length > 0) {
          // Merge or set live events
          setEvents(liveData);
        }
      } catch (err) {
        console.warn("Backend events offline, using default events:", err.message);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadLiveEvents();
  }, []);

  const heroEvents = events.slice(0, 3);
  const currentHero = heroEvents[heroIndex] || events[0] || DEFAULT_EVENTS[0];

  const heroId = currentHero._id || currentHero.id;
  const heroTitle = currentHero.title;
  const heroBg = currentHero.eventImage || currentHero.bg || currentHero.image || DEFAULT_EVENTS[0].bg;
  const heroPrice = currentHero.ticketPrice !== undefined ? currentHero.ticketPrice : currentHero.price || 999;
  const heroVenue = currentHero.eventLocation || currentHero.venue || "Mumbai Arena";
  const heroDate = currentHero.eventDate || currentHero.date || "Upcoming";
  const heroArtist = currentHero.eventArtistName || currentHero.artist || "Live Event";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filtered = activeCategory === "all"
    ? events.slice(0, 6)
    : events.filter((e) => {
        const cat = e.category || e.eventArtistName || "";
        return cat.toLowerCase().includes(activeCategory.toLowerCase());
      }).slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-end pb-24 overflow-hidden">
        {/* BG Image */}
        <motion.div
          className="absolute inset-0"
          style={{ y: bgY, scale: bgScale }}
        >
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #09090b 30%, rgba(9,9,11,0.6) 60%, rgba(9,9,11,0.3) 100%)" }} />
          {/* Red radial glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(220,38,38,0.15) 0%, transparent 70%)" }} />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/40 mb-6">
                <Zap size={13} style={{ color: "#dc2626" }} />
                <span className="text-xs text-zinc-300 font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {heroArtist} · FEATURED EVENT
                </span>
              </div>

              <h1
                className="text-5xl md:text-8xl font-black text-white leading-none tracking-tight mb-6"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {heroTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-8 text-zinc-400 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <div className="flex items-center gap-1.5">
                  <Star size={14} style={{ color: "#dc2626" }} fill="#dc2626" />
                  <span className="text-white font-medium">{currentHero.rating || 4.9}</span>
                  <span>(4.2k reviews)</span>
                </div>
                <span className="text-zinc-700">·</span>
                <span>{heroDate}</span>
                <span className="text-zinc-700">·</span>
                <span>{heroVenue}</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/event/${heroId}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base"
                    style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 30px rgba(220,38,38,0.3)" }}
                  >
                    Book Tickets · ₹{heroPrice.toLocaleString()}
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base text-white border border-zinc-600 hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <Play size={14} fill="currentColor" />
                  Explore All
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero thumbnails */}
          {heroEvents.length > 1 && (
            <div className="absolute right-6 bottom-0 hidden lg:flex flex-col gap-3">
              {heroEvents.map((ev, i) => {
                const thumbImg = ev.eventImage || ev.image || ev.bg;
                return (
                  <motion.button
                    key={ev._id || ev.id || i}
                    whileHover={{ scale: 1.05, x: -4 }}
                    onClick={() => setHeroIndex(i)}
                    className={`relative w-28 h-20 rounded-2xl overflow-hidden transition-all cursor-pointer ${
                      heroIndex === i ? "ring-2 ring-[#dc2626]" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={thumbImg} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-zinc-950/40" />
                    {heroIndex === i && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#dc2626" }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 p-2 pl-6 rounded-2xl"
            style={{ background: "rgba(39,39,42,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(63,63,70,0.5)" }}
          >
            <Search size={18} className="text-zinc-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, artists, venues, cities..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-base py-2"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-sm cursor-pointer"
              style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
            >
              Explore
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#dc2626" }}>
                {stat.value}
              </div>
              <div className="text-zinc-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED EVENTS ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} style={{ color: "#dc2626" }} />
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}>
                  Trending This Week
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                Live Experiences
              </h2>
            </div>
            <Link
              to="/events"
              className="hidden md:flex items-center gap-1 text-zinc-400 hover:text-[#dc2626] text-sm font-medium transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              View all <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Category Filter */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "text-white font-bold"
                    : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white border border-zinc-700/40"
                }`}
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  ...(activeCategory === cat.id ? { background: "#dc2626" } : {}),
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <EventCard key={event._id || event.id} event={event} index={i} />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-base border border-zinc-600 text-white hover:border-[#dc2626] hover:text-[#dc2626] transition-all"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Explore All Events <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(220,38,38,0.05) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
              Loved by <span style={{ color: "#dc2626" }}>Millions</span>
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto" style={{ fontFamily: "DM Sans, sans-serif" }}>
              From first-time concertgoers to seasoned festival junkies — Elyra is where memories begin.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-7 rounded-3xl"
                style={{
                  background: "rgba(39,39,42,0.5)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(63,63,70,0.3)",
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: "#dc2626" }} fill="#dc2626" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-white font-semibold text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{t.name}</div>
                    <div className="text-zinc-600 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>{t.event} · {t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{ background: "#dc2626" }}
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
                Never Miss a Show.
              </h2>
              <p className="text-zinc-200 mb-8 text-lg max-w-md mx-auto" style={{ fontFamily: "DM Sans, sans-serif" }}>
                Get AI-powered event recommendations, early access, and exclusive deals — all in one place.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base bg-zinc-950 text-white"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Start Exploring <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
