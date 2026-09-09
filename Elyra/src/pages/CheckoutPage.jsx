import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, CreditCard, Smartphone, Building2,
  ChevronRight, Lock, Tag, CheckCircle2, Ticket, Calendar, MapPin, Users,
  Loader2, AlertCircle, Coins
} from "lucide-react";
import { SEAT_TIERS } from "../data/events";
import { useAuth } from "../context/AuthContext";
import { bookTicket } from "../services/api";

const PAYMENT_METHODS = [
  { id: "credits", icon: Coins, label: "Elyra Credits (Instant)" },
  { id: "card", icon: CreditCard, label: "Credit / Debit Card" },
  { id: "upi", icon: Smartphone, label: "UPI (Instant App)" },
];

const STEPS = ["Review", "Details", "Payment"];

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateCredits, openAuthModal } = useAuth();

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credits");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0); // in percent
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [cardForm, setCardForm] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: user?.name || "",
  });
  const [upiId, setUpiId] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setCardForm((prev) => ({ ...prev, name: user.name || prev.name }));
    }
  }, [user]);

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">No active booking selected.</p>
          <Link to="/events" className="text-[#dc2626] font-bold">Browse Events</Link>
        </div>
      </div>
    );
  }

  const { event, tier, qty, total } = state;
  const tierData = SEAT_TIERS.find((t) => t.id === tier) || SEAT_TIERS[0];
  const discountAmount = promoApplied ? Math.round((total * promoDiscount) / 100) : 0;
  const finalTotal = total - discountAmount;
  const userCredits = user?.credits || 0;
  const hasEnoughCredits = userCredits >= finalTotal;

  const handleApplyPromo = () => {
    setPromoError("");
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "ELYRA10" || code === "WELCOME10") {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else if (code === "FESTIVAL20" || code === "MOOD20") {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else if (code === "VIP50") {
      setPromoDiscount(50);
      setPromoApplied(true);
    } else {
      setPromoDiscount(10);
      setPromoApplied(true);
    }
  };

  const handlePayNow = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (paymentMethod === "credits" && !hasEnoughCredits) {
      setBookingError(`Insufficient Elyra Credits! You have ₹${userCredits.toLocaleString()}, but this booking requires ₹${finalTotal.toLocaleString()}. Please choose Card/UPI.`);
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      // Call backend API: POST /api/order/:eid
      const eventId = event._id || event.id;
      const orderResult = await bookTicket(eventId, {
        numberOfSeats: qty,
        couponCode: promoApplied ? promoCode.trim().toUpperCase() : undefined,
      });

      // If paid via credits, update local credits
      const remainingCredits = Math.max(0, userCredits - finalTotal);
      updateCredits(remainingCredits);

      navigate("/confirmation", {
        state: {
          order: orderResult,
          event,
          tier,
          qty,
          total: finalTotal,
          form,
        },
      });
    } catch (err) {
      setBookingError(err.message || "Booking rejected. Please verify available seats and user credentials.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-white text-sm cursor-pointer"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <ArrowLeft size={14} />
            Back
          </motion.button>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            Secure Checkout
          </h1>
        </motion.div>

        {/* Step Indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: i <= step ? "#dc2626" : "rgba(39,39,42,0.8)",
                    color: i <= step ? "white" : "#71717a",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: i === step ? "white" : "#71717a", fontFamily: "DM Sans, sans-serif" }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 w-12 rounded-full" style={{ background: i < step ? "#dc2626" : "#3f3f46" }} />
              )}
            </div>
          ))}
        </motion.div>

        {bookingError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{bookingError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 0: Review */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl" style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}>
                    <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Your Order Details</h2>

                    <div className="flex gap-5 mb-6">
                      <img src={event.image || event.eventImage} alt={event.title} className="w-24 h-20 object-cover rounded-2xl shrink-0" />
                      <div>
                        <div className="text-xs text-zinc-400 mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{event.eventArtistName || event.artist || "Live Performance"}</div>
                        <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "Syne, sans-serif" }}>{event.title}</h3>
                        <div className="flex flex-wrap gap-4 text-zinc-400 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          <span className="flex items-center gap-1.5"><Calendar size={12} />{event.date || event.eventDate}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={12} />{event.venue || event.eventLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: tierData?.color }} />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          {tierData?.label} · {qty} seat{qty > 1 ? "s" : ""}
                        </span>
                        <div className="text-zinc-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>{tierData?.description}</div>
                      </div>
                      <span className="text-white font-bold" style={{ fontFamily: "Syne, sans-serif" }}>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="p-6 rounded-3xl" style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}>
                    <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Apply Coupon</h2>
                    <div className="flex gap-3">
                      <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                        <Tag size={14} className="text-zinc-500" />
                        <input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code (e.g. ELYRA10 or FESTIVAL20)"
                          className="flex-1 bg-transparent text-white outline-none text-sm placeholder-zinc-600 uppercase"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                          disabled={promoApplied}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleApplyPromo}
                        disabled={promoApplied}
                        className="px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50"
                        style={{ background: promoApplied ? "#22c55e" : "#dc2626", color: "white", fontFamily: "DM Sans, sans-serif" }}
                      >
                        {promoApplied ? "Applied!" : "Apply"}
                      </motion.button>
                    </div>
                    {promoApplied && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs mt-2 flex items-center gap-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        <CheckCircle2 size={12} /> {promoDiscount}% discount applied — saving ₹{discountAmount.toLocaleString()}!
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer text-white"
                    style={{ background: "#dc2626", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 30px rgba(220,38,38,0.25)" }}
                  >
                    Continue to Details <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 1: Attendee Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl" style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}>
                    <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Attendee Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-400 text-xs font-medium mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Full Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Aryan Kapoor"
                          className="w-full px-4 py-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-white placeholder-zinc-600 outline-none focus:border-[#dc2626] transition-colors text-sm"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-medium mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Email Address</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="aryan@example.com"
                          className="w-full px-4 py-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-white placeholder-zinc-600 outline-none focus:border-[#dc2626] transition-colors text-sm"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-xs font-medium mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="9876543210"
                          className="w-full px-4 py-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-white placeholder-zinc-600 outline-none focus:border-[#dc2626] transition-colors text-sm"
                          style={{ fontFamily: "DM Sans, sans-serif" }}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    disabled={!form.name || !form.email}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer text-white"
                    style={{ background: "#dc2626", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 30px rgba(220,38,38,0.25)" }}
                  >
                    Continue to Payment <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl" style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.3)" }}>
                    <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Payment Mode</h2>

                    {/* Method Toggle */}
                    <div className="flex gap-3 mb-6">
                      {PAYMENT_METHODS.map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => setPaymentMethod(id)}
                          className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border cursor-pointer ${
                            paymentMethod === id ? "border-[#dc2626] bg-[#dc2626]/10 text-white" : "border-zinc-700/40 bg-zinc-800/30 text-zinc-400"
                          }`}
                        >
                          <Icon size={20} style={{ color: paymentMethod === id ? "#dc2626" : "#71717a" }} />
                          <span className="text-xs font-semibold text-center" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "credits" && (
                      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-950/60 border border-green-800/40 flex items-center justify-center text-green-400">
                              <Coins size={20} />
                            </div>
                            <div>
                              <p className="text-zinc-400 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>Wallet Balance</p>
                              <p className="text-xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                                ₹{userCredits.toLocaleString()} Credits
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              hasEnoughCredits ? "bg-green-950 text-green-400 border border-green-800" : "bg-red-950 text-red-400 border border-red-800"
                            }`}
                          >
                            {hasEnoughCredits ? "Sufficient Balance" : "Insufficient"}
                          </span>
                        </div>

                        {!hasEnoughCredits && (
                          <p className="text-amber-400 text-xs mt-3 pt-3 border-t border-zinc-800">
                            You need ₹{(finalTotal - userCredits).toLocaleString()} more credits. Switch to Card or UPI to complete payment.
                          </p>
                        )}
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-400 text-xs font-medium mb-1.5">Card Number</label>
                          <input
                            value={cardForm.number}
                            onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Expiry</label>
                            <input
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-1.5">CVV</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                              placeholder="•••"
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-zinc-400 text-xs font-medium mb-1.5">UPI ID / VPA</label>
                          <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          {["GPay", "PhonePe", "Paytm"].map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setUpiId(`user@${app.toLowerCase()}`)}
                              className="flex-1 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayNow}
                    disabled={bookingLoading}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer text-white disabled:opacity-50"
                    style={{ background: "#dc2626", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 40px rgba(220,38,38,0.35)" }}
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Confirming with Backend...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Pay ₹{finalTotal.toLocaleString()} & Confirm Ticket</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28 p-6 rounded-3xl"
              style={{ background: "rgba(24,24,27,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(63,63,70,0.4)" }}
            >
              <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "Syne, sans-serif" }}>Booking Summary</h3>

              <div className="flex gap-3 mb-5 p-3 rounded-2xl bg-zinc-800/40">
                <img src={event.image || event.eventImage} alt="" className="w-16 h-12 object-cover rounded-xl shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm leading-tight line-clamp-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{event.title}</p>
                  <p className="text-zinc-500 text-xs mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{event.date || event.eventDate}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: `${tierData?.label} × ${qty} seats`, value: `₹${total.toLocaleString()}` },
                  ...(promoApplied ? [{ label: `Discount (${promoDiscount}%)`, value: `-₹${discountAmount.toLocaleString()}`, green: true }] : []),
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex justify-between text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    <span className="text-zinc-500">{label}</span>
                    <span style={{ color: green ? "#22c55e" : "white" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-700/40 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Billed Amount</span>
                  <span className="text-2xl font-black text-[#dc2626]" style={{ fontFamily: "Syne, sans-serif" }}>
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl flex items-start gap-2 bg-zinc-800/40">
                <Ticket size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-zinc-500 text-xs leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Your e-ticket with entry barcode will be generated and stored in your profile immediately.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
