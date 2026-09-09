import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Ticket, Bell, User, ChevronDown, MapPin,
  LogOut, Shield, ShoppingBag, Sparkles, Coins
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Events", href: "/events" },
  { label: "Concerts", href: "/events?cat=Concerts" },
  { label: "Festivals", href: "/events?cat=Music Festival" },
  { label: "Offers", href: "/events?offers=true" },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserDropdown(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#dc2626" }}
            >
              <Ticket size={18} className="text-white" strokeWidth={2.5} />
            </motion.div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "Syne, sans-serif", color: "white" }}
            >
              elyra
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-1 text-zinc-400 text-sm cursor-pointer hover:text-white transition-colors">
              <MapPin size={13} />
              <span style={{ fontFamily: "DM Sans, sans-serif" }}>Mumbai</span>
              <ChevronDown size={13} />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-zinc-400 hover:text-white text-sm font-medium transition-colors relative group"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ background: "#dc2626" }}
                />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <Shield size={12} />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all cursor-pointer"
            >
              <Search size={16} />
            </motion.button>

            {/* Auth Button or User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-white text-xs font-medium cursor-pointer"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#dc2626" }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0] || "User"}</span>
                  <div className="flex items-center gap-1 text-green-400 bg-green-950/60 px-2 py-0.5 rounded-full border border-green-800/40">
                    <Coins size={10} />
                    <span className="font-bold">₹{user?.credits || 0}</span>
                  </div>
                  <ChevronDown size={13} className="text-zinc-500" />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl p-2 bg-zinc-900/98 backdrop-blur-xl border border-zinc-800 shadow-2xl z-50 text-xs"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      <div className="p-2.5 border-b border-zinc-800/80 mb-1">
                        <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                        <p className="text-zinc-500 text-[11px] truncate">{user?.email}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                          <span className="text-zinc-400 text-[11px]">Wallet Credits:</span>
                          <span className="font-bold text-green-400">₹{(user?.credits || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <User size={14} className="text-zinc-400" />
                        My Profile & Wallet
                      </Link>

                      <Link
                        to="/profile?tab=My%20Tickets"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <ShoppingBag size={14} className="text-zinc-400" />
                        My Booked Tickets
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/50 transition-colors"
                        >
                          <Shield size={14} className="text-purple-400" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-zinc-800/80 my-1" />

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors text-left"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                  style={{ fontFamily: "DM Sans, sans-serif", background: "#dc2626", color: "white" }}
                >
                  <User size={13} />
                  Sign In
                </button>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800/60 text-white cursor-pointer"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Search Bar Popup */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto px-6 py-4">
                <div className="flex items-center gap-3 bg-zinc-800/60 rounded-2xl px-5 py-3">
                  <Search size={18} className="text-zinc-400 shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, artists, venues, cities..."
                    className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-base"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 bg-zinc-950/98 backdrop-blur-2xl flex flex-col pt-24 px-8 overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={link.href}
                    className="text-4xl font-bold text-white hover:text-[#dc2626] transition-colors"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-3xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Admin Console
                </Link>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="font-bold text-white text-base">{user?.name}</p>
                    <p className="text-zinc-500 text-xs">{user?.email}</p>
                    <p className="text-green-400 font-bold text-xs mt-2">Credits: ₹{user?.credits || 0}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full text-center py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm"
                  >
                    My Profile & Tickets
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-center py-3 rounded-xl bg-red-950/60 text-red-400 border border-red-800 font-bold text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg"
                  style={{ background: "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
                >
                  <User size={18} />
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
