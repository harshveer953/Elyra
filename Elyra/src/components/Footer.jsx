import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ticket, ExternalLink } from "lucide-react";

const footerLinks = {
  Company: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Contact Us", "Refund Policy", "Terms of Service"],
  Discover: ["Concerts", "Festivals", "Sports", "Theatre"],
  Cities: ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"],
};

const SocialIcon = ({ children, href }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.15, y: -2 }}
    className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-[#dc2626] hover:bg-zinc-700 transition-colors text-xs font-bold"
    style={{ fontFamily: "Syne, sans-serif" }}
  >
    {children}
  </motion.a>
);

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#dc2626" }}>
                <Ticket size={18} className="text-zinc-950" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>elyra</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
              India's most premium event discovery and ticket booking platform. Powered by AI, built for experience.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#">IG</SocialIcon>
              <SocialIcon href="#">X</SocialIcon>
              <SocialIcon href="#">YT</SocialIcon>
              <SocialIcon href="#">FB</SocialIcon>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold mb-4 text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-800/50">
          <p className="text-zinc-600 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
            © 2026 Elyra Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#dc2626" }} />
            <span className="text-zinc-600 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
