"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Home, Users } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card rounded-2xl p-10 backdrop-blur-xl relative overflow-hidden text-center shadow-2xl">
          {/* Neon Glow on card edge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70"></div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>

          <h2 className="text-3xl font-display font-bold text-white mb-4 neon-text-white">
            You're successfully registered! 🎉
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Thank you for checking in to the SFMC Mumbai Experience Hub. Connect with other members or head back to the main stage.
          </p>

          <div className="space-y-4">
            <Link 
              href="/members"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-full shadow-sm text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all border border-purple-500/30"
            >
              <Users className="w-5 h-5" />
              View Community Members
            </Link>
            
            <Link 
              href="/"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-full text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
