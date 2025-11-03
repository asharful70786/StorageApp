// src/components/Layout/Footer.jsx
import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-20 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-8 py-12 text-gray-600">
        {/* 🌈 Top Section - Brand & Description */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-sm" />
              <span className="font-semibold text-gray-800 text-lg tracking-tight">
                CloudStorage
              </span>
            </div>
            <p className="max-w-sm text-sm text-gray-500 leading-relaxed">
              CloudStorage is your private, secure space for files, memories, and ideas —
              powered by intelligent AI organization and modern web technology.
              Upload, share, and manage your digital life effortlessly.
            </p>
          </div>

          {/* 🌍 Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm mt-6 md:mt-0">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Product</h4>
              <ul className="space-y-1">
                <li className="hover:text-blue-600 cursor-pointer transition">Overview</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Features</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Plans & Pricing</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Security</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Resources</h4>
              <ul className="space-y-1">
                <li className="hover:text-blue-600 cursor-pointer transition">Docs</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Help Center</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Status</li>
                <li className="hover:text-blue-600 cursor-pointer transition">API Access</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Company</h4>
              <ul className="space-y-1">
                <li className="hover:text-blue-600 cursor-pointer transition">About</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Privacy</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Terms</li>
                <li className="hover:text-blue-600 cursor-pointer transition">Contact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 🧭 Divider */}
        <div className="my-10 border-t border-gray-200" />

        {/* ⚡ Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span>© {new Date().getFullYear()} CloudStorage Inc. All rights reserved.</span>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-blue-600 transition cursor-pointer">Twitter</span>
            <span className="hover:text-blue-600 transition cursor-pointer">LinkedIn</span>
            <span className="hover:text-blue-600 transition cursor-pointer">GitHub</span>
          </div>

          <div className="mt-4 md:mt-0 text-gray-400">
            Made with ❤️ by <span className="text-gray-700 font-medium">CoderCamp</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
