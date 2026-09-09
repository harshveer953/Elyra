import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Zap, Users, Tag } from "lucide-react";

export default function EventCard({ event, index = 0 }) {
  // Normalize fields between backend schema and mock schema
  const eventId = event._id || event.id;
  const title = event.title;
  const image = event.eventImage || event.image || event.bg || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80";
  const artist = event.eventArtistName || event.artist || "Live Performance";
  const date = event.eventDate || event.date || "Upcoming";
  const venue = event.eventLocation || event.venue || "Main Stage";
  const city = event.city || "Mumbai";
  const price = event.ticketPrice !== undefined ? event.ticketPrice : event.price || 499;
  const originalPrice = event.originalPrice || Math.round(price * 1.3);
  const seats = event.totalSeats !== undefined ? event.totalSeats : event.seats || 100;
  const rating = event.rating || 4.8;
  const category = event.category || "Concerts";
  const tag = event.tag || (seats < 50 ? "SELLING FAST" : "TRENDING");
  const tagColor = event.tagColor || "#dc2626";

  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full"
      style={{
        background: "rgba(24, 24, 27, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(63, 63, 70, 0.4)",
      }}
    >
      <Link to={`/event/${eventId}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden h-52 w-full shrink-0">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Tag */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: tagColor,
              color: "white",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {tag}
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-sm text-xs font-bold"
              style={{ color: "#dc2626", fontFamily: "DM Sans, sans-serif" }}
            >
              -{discount}%
            </div>
          )}

          {/* Seats left */}
          {seats < 100 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30">
              <Zap size={10} className="text-red-400" />
              <span className="text-red-400 text-xs font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {seats} seats left
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-zinc-400 font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {artist}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <div className="flex items-center gap-1">
                <Star size={11} style={{ color: "#dc2626" }} fill="#dc2626" />
                <span className="text-xs text-zinc-300 font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {rating}
                </span>
              </div>
            </div>

            <h3
              className="text-white font-bold text-lg leading-tight mb-3 group-hover:text-[#dc2626] transition-colors line-clamp-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {title}
            </h3>

            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <Clock size={12} className="shrink-0 text-zinc-500" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <MapPin size={12} className="shrink-0 text-zinc-500" />
                <span className="truncate">{venue}, {city}</span>
              </div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-auto">
            <div>
              {originalPrice > price && (
                <div className="text-xs text-zinc-500 line-through" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  ₹{originalPrice.toLocaleString()}
                </div>
              )}
              <div className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                ₹{price.toLocaleString()}
                <span className="text-xs text-zinc-500 font-normal ml-1">onwards</span>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
            >
              Book Now
            </motion.div>
          </div>
        </div>
      </Link>

      {/* Red glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "0 0 40px rgba(220,38,38,0.12), inset 0 0 0 1px rgba(220,38,38,0.2)" }}
      />
    </motion.div>
  );
}
