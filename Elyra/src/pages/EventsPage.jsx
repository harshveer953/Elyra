import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react";
import EventCard from "../components/EventCard";
import { EVENTS as DEFAULT_EVENTS, CATEGORIES, CITIES } from "../data/events";
import { fetchEvents } from "../services/api";

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "date", label: "Date: Upcoming" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCat = searchParams.get("cat") || "all";

  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [activeCity, setActiveCity] = useState("All Cities");
  const [sort, setSort] = useState("trending");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery !== null) setSearch(urlQuery);
    const urlCat = searchParams.get("cat");
    if (urlCat !== null) setActiveCategory(urlCat);
  }, [searchParams]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
      } catch (err) {
        console.warn("Backend events offline, using fallback:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filtered = useMemo(() => {
    let result = [...events];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => {
        const title = (e.title || "").toLowerCase();
        const artist = (e.eventArtistName || e.artist || "").toLowerCase();
        const venue = (e.eventLocation || e.venue || "").toLowerCase();
        return title.includes(q) || artist.includes(q) || venue.includes(q);
      });
    }

    if (activeCategory !== "all") {
      result = result.filter((e) => {
        const cat = (e.category || e.eventArtistName || "").toLowerCase();
        return cat.includes(activeCategory.toLowerCase());
      });
    }

    if (activeCity !== "All Cities") {
      result = result.filter((e) => {
        const city = (e.city || e.eventLocation || "").toLowerCase();
        return city.includes(activeCity.toLowerCase());
      });
    }

    result = result.filter((e) => {
      const p = e.ticketPrice !== undefined ? e.ticketPrice : e.price || 0;
      return p >= priceRange[0] && p <= priceRange[1];
    });

    if (sort === "date") {
      result.sort((a, b) => (a.eventDate || a.date || "").localeCompare(b.eventDate || b.date || ""));
    } else if (sort === "price_asc") {
      result.sort((a, b) => (a.ticketPrice || a.price || 0) - (b.ticketPrice || b.price || 0));
    } else if (sort === "price_desc") {
      result.sort((a, b) => (b.ticketPrice || b.price || 0) - (a.ticketPrice || a.price || 0));
    } else if (sort === "rating") {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    }

    return result;
  }, [events, search, activeCategory, activeCity, sort, priceRange]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 mb-8">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=60"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(220,38,38,0.1) 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
              Explore Live Events
            </h1>
            <p className="text-zinc-400 text-base md:text-lg" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Discover & book verified concerts, festivals, comedy shows, and nightlife experiences.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Search + Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div
            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{ background: "rgba(39,39,42,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(63,63,70,0.5)" }}
          >
            <Search size={16} className="text-zinc-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, artists, venues..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 min-w-[200px]">
            <ChevronDown size={14} className="text-zinc-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none cursor-pointer"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#18181b" }}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-medium text-sm transition-all cursor-pointer ${
              showFilters ? "text-white font-bold bg-[#dc2626]" : "text-white bg-zinc-800/60 border border-zinc-700/40"
            }`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <SlidersHorizontal size={15} />
            Filters
          </motion.button>
        </motion.div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-2xl"
            style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Category */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Syne, sans-serif" }}>Category</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        activeCategory === cat.id ? "text-white font-bold bg-[#dc2626]" : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50"
                      }`}
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Syne, sans-serif" }}>City</h4>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => setActiveCity(city)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        activeCity === city ? "text-white font-bold bg-[#dc2626]" : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50"
                      }`}
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                  Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                </h4>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, +e.target.value])}
                  className="w-full accent-[#dc2626] cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all cursor-pointer ${
                activeCategory === cat.id ? "text-white font-bold bg-[#dc2626]" : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-500 text-sm mb-6"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Showing <span className="text-white font-semibold">{filtered.length}</span> events
        </motion.p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <EventCard key={event._id || event.id} event={event} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>No events found</h3>
            <p className="text-zinc-500" style={{ fontFamily: "DM Sans, sans-serif" }}>Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); setActiveCity("All Cities"); }}
              className="mt-6 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer"
              style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
