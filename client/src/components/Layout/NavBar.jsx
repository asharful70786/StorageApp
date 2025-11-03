// src/components/Layout/NavBar.jsx
import { motion } from "framer-motion";

function NavBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <span className="text-lg font-semibold text-gray-800 tracking-tight">
            CloudStorage
          </span>
        </div>

        {/* Center Text Items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <span className="hover:text-gray-900 transition">Overview</span>
          <span className="hover:text-gray-900 transition">Storage</span>
          <span className="hover:text-gray-900 transition">AI Features</span>
          <span className="hover:text-gray-900 transition">Plans & Pricing</span>
          <span className="hover:text-gray-900 transition">Support</span>
        </nav>

        {/* Right Placeholder */}
        <div className="hidden md:block text-gray-500 text-sm select-none">
          v1.0 beta
        </div>
      </div>
    </motion.header>
  );
}

export default NavBar;
