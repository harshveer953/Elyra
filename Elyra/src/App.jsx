import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import AuthModal from "./components/AuthModal";
import AIChatDrawer from "./components/AIChatDrawer";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppInner() {
  const { pathname } = useLocation();
  const showFooter =
    pathname === "/" ||
    pathname.startsWith("/events") ||
    pathname === "/profile" ||
    pathname === "/admin";

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <AIChatDrawer />
      <AuthModal />
      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <AuthProvider>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setTimeout(() => setLoading(false), 200)} />}
      </AnimatePresence>
      {!loading && (
        <BrowserRouter>
          <ScrollToTop />
          <AppInner />
        </BrowserRouter>
      )}
    </AuthProvider>
  );
}
