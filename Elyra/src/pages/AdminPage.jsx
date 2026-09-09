import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck, Users, Calendar, ShoppingCart, Tag, Plus, Check, X,
  TrendingUp, Search, RefreshCw, AlertCircle, Sparkles, DollarSign, Eye
} from "lucide-react";
import {
  fetchAdminUsers, fetchAdminEvents, fetchAdminOrders, fetchAdminCoupons,
  createAdminCoupon, updateAdminEvent, updateAdminUser, createEvent
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "coupons", label: "Coupons", icon: Tag },
];

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New Event Form Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventLocation: "",
    eventArtistName: "",
    totalSeats: 250,
    duration: "3 hours",
    ticketPrice: 999,
  });
  const [eventImageFile, setEventImageFile] = useState(null);

  // New Coupon Form Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    couponCode: "",
    couponDiscount: 15,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [uRes, eRes, oRes, cRes] = await Promise.allSettled([
        fetchAdminUsers(),
        fetchAdminEvents(),
        fetchAdminOrders(),
        fetchAdminCoupons(),
      ]);

      if (uRes.status === "fulfilled") setUsers(Array.isArray(uRes.value) ? uRes.value : []);
      if (eRes.status === "fulfilled") setEvents(Array.isArray(eRes.value) ? eRes.value : []);
      if (oRes.status === "fulfilled") setOrders(Array.isArray(oRes.value) ? oRes.value : []);
      if (cRes.status === "fulfilled") setCoupons(Array.isArray(cRes.value) ? cRes.value : []);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      // not admin
    } else {
      loadData();
    }
  }, [isAdmin]);

  const handleToggleEventActive = async (eventId, currentActive) => {
    try {
      await updateAdminEvent(eventId, { isActive: !currentActive });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isActive: !currentActive } : e))
      );
      setSuccess("Event status updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update event status");
    }
  };

  const handleAddCredits = async (userId, currentCredits) => {
    const amount = prompt("Enter additional credits to add to user account:", "5000");
    if (!amount || isNaN(amount)) return;

    try {
      const updated = await updateAdminUser(userId, { credits: (currentCredits || 0) + parseInt(amount) });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, credits: updated.credits } : u)));
      setSuccess(`Added ₹${amount} credits to user!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update user credits");
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const created = await createAdminCoupon(newCoupon);
      setCoupons((prev) => [...prev, created]);
      setShowCouponModal(false);
      setNewCoupon({ couponCode: "", couponDiscount: 15 });
      setSuccess("Coupon created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create coupon");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800">
          <ShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            Admin Access Required
          </h2>
          <p className="text-zinc-400 text-sm mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
            This portal is restricted to Elyra platform administrators. Please sign in with an administrator account.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-full font-bold text-sm bg-[#dc2626] text-white"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + (o.billedAmount || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/80 border border-red-800/60 text-red-400">
                ADMIN CONSOLE
              </span>
            </div>
            <h1 className="text-4xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
              Elyra Control Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {activeTab === "coupons" && (
              <button
                onClick={() => setShowCouponModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#dc2626] text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                <Plus size={15} /> Create Coupon
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-950/60 border border-green-800/80 text-green-300 text-xs flex items-center gap-2">
            <Check size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#22c55e" },
            { label: "Total Bookings", value: orders.length, icon: ShoppingCart, color: "#3b82f6" },
            { label: "Live Events", value: events.length, icon: Calendar, color: "#dc2626" },
            { label: "Registered Users", value: users.length, icon: Users, color: "#a855f7" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
            >
              <div>
                <p className="text-zinc-500 text-xs mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                  {stat.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 w-fit mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected ? "bg-[#dc2626] text-white shadow-lg shadow-red-600/20" : "text-zinc-400 hover:text-white"
                }`}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/80 overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                Platform Events ({events.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Event</th>
                    <th className="py-3.5 px-4">Artist</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Venue</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {events.map((e) => (
                    <tr key={e._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={e.eventImage || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80"}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-white text-sm line-clamp-1">{e.title}</p>
                            <p className="text-zinc-500 text-[11px] font-mono">ID: {e._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{e.eventArtistName || "N/A"}</td>
                      <td className="py-4 px-4 text-zinc-400">{e.eventDate || "N/A"}</td>
                      <td className="py-4 px-4 text-zinc-400">{e.eventLocation || "N/A"}</td>
                      <td className="py-4 px-4 font-bold text-white">{e.totalSeats}</td>
                      <td className="py-4 px-4 font-bold text-[#dc2626]">₹{e.ticketPrice?.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            e.isActive
                              ? "bg-green-950/80 text-green-400 border border-green-800/50"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {e.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleToggleEventActive(e._id, e.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            e.isActive
                              ? "bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800"
                              : "bg-green-950/60 text-green-300 hover:bg-green-900/60 border border-green-800"
                          }`}
                        >
                          {e.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        No events found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/80 overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                All Platform Bookings ({orders.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Order ID</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Billed Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5 font-mono text-zinc-400">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {typeof o.user === "object" ? o.user?.name || o.user?.email : o.user}
                      </td>
                      <td className="py-4 px-4">
                        {typeof o.event === "object" ? o.event?.title || o.event?.name : o.event}
                      </td>
                      <td className="py-4 px-4 font-bold">{o.seats}</td>
                      <td className="py-4 px-4 font-bold text-[#dc2626]">₹{o.billedAmount?.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            o.status === "confirmed"
                              ? "bg-green-950/80 text-green-400 border border-green-800/50"
                              : o.status === "cancelled"
                              ? "bg-red-950/80 text-red-400 border border-red-800/50"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-zinc-500">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        No orders placed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/80 overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                Registered Users ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-5">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Credits Balance</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-white">{u.name}</td>
                      <td className="py-4 px-4 text-zinc-400">{u.email}</td>
                      <td className="py-4 px-4 text-zinc-400">{u.phone}</td>
                      <td className="py-4 px-4 font-bold text-green-400">₹{(u.credits || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isAdmin
                              ? "bg-purple-950/80 text-purple-400 border border-purple-800/50"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {u.isAdmin ? "ADMIN" : "USER"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleAddCredits(u._id, u.credits)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#dc2626] hover:text-white text-zinc-300 font-semibold transition-colors text-xs"
                        >
                          + Add Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        No users found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === "coupons" && (
          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/80 overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                Active Discount Coupons ({coupons.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-[#dc2626]" />
                      <span className="font-mono font-bold text-white text-base tracking-wider">{c.couponCode}</span>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">
                      Discount: <span className="text-green-400 font-bold">{c.couponDiscount}% OFF</span>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      c.isActive ? "bg-green-950/80 text-green-400" : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="col-span-3 py-8 text-center text-zinc-500 text-sm">
                  No coupons found. Click "Create Coupon" to add discount codes like ELYRA10 or MOOD20.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Coupon */}
        <AnimatePresence>
          {showCouponModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCouponModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-800 z-10"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                    Create Discount Coupon
                  </h3>
                  <button onClick={() => setShowCouponModal(false)} className="text-zinc-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-medium mb-1">Coupon Code</label>
                    <input
                      required
                      value={newCoupon.couponCode}
                      onChange={(e) => setNewCoupon({ ...newCoupon, couponCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. FESTIVAL20"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono text-sm outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-medium mb-1">Discount Percentage (%)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      value={newCoupon.couponDiscount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, couponDiscount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#dc2626] text-white font-bold text-sm shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    Save & Activate Coupon
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
