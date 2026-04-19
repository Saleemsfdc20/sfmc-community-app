"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, User, Calendar, MapPin, Users, Activity } from "lucide-react";

// Lazy Load the Spline Component with absolutely zero SSR to prevent layout shifts
// Loading fallback ensures seamless transition for the user
const SplineScene = dynamic(() => import("@/components/SplineScene"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-[300px] h-[300px] bg-gradient-to-tr from-[#00a1e0]/20 to-purple-500/20 rounded-full blur-[80px] animate-pulse"></div>
    </div>
  )
});

// Helper for Animated Counters
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; 
      const increment = value / (duration / 16); 
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}</span>;
}

function MobileRobot() {
  const [headRotation, setHeadRotation] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Normalize coordinates
    const normalizedX = (clientX - centerX) / centerX;
    const normalizedY = (clientY - centerY) / centerY;

    setHeadRotation({
      x: normalizedY * -25, // Up/Down rotation limit
      y: normalizedX * 35,  // Left/Right rotation limit
    });
  };

  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm aspect-square pointer-events-auto flex flex-col items-center justify-center touch-none z-10"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHeadRotation({ x: 0, y: 0 })}
    >
      <motion.div
        animate={{ rotateX: headRotation.x, rotateY: headRotation.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ perspective: 1000 }}
        className="relative w-48 h-48 sm:w-56 sm:h-56 cursor-pointer"
      >
        {/* Robot Head Main Body */}
        <div className="w-full h-full bg-gradient-to-b from-slate-800 to-black rounded-[2.5rem] border-2 border-[#00a1e0]/80 shadow-[0_0_40px_rgba(0,161,224,0.3)] flex flex-col items-center justify-center p-6 relative overflow-hidden backdrop-blur-xl">
          
          {/* Glass glare effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>

          {/* Antenna */}
          <div className="absolute -top-4 shadow-xl left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] z-10" 
            />
            <div className="w-1.5 h-6 bg-slate-400"></div>
          </div>

          {/* Eyes Visor */}
          <div className="w-full h-16 bg-black/80 rounded-2xl mt-4 px-4 flex items-center justify-center gap-6 border border-white/10 shadow-inner overflow-hidden relative">
            {/* Scanning line indicator */}
            <motion.div 
               animate={{ x: ["-200%", "200%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#00a1e0]/20 to-transparent skew-x-12"
            />
            
            {/* Left Eye */}
            <motion.div 
              animate={{ height: ["16px", "2px", "16px"], scale: [1, 1.1, 1] }} 
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }} 
              className="w-8 h-4 bg-[#00d4ff] rounded-full shadow-[0_0_15px_rgba(0,212,255,0.9)]" 
            />
            {/* Right Eye */}
            <motion.div 
              animate={{ height: ["16px", "2px", "16px"], scale: [1, 1.1, 1] }} 
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }}
              className="w-8 h-4 bg-[#00d4ff] rounded-full shadow-[0_0_15px_rgba(0,212,255,0.9)]" 
            />
          </div>

          {/* Audio Wave / Voice Box */}
          <div className="mt-auto mb-2 flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                animate={{ height: [6, Math.random() * 16 + 6, 6] }}
                transition={{ duration: Math.random() * 0.5 + 0.5, repeat: Infinity }}
                className="w-1.5 bg-gradient-to-t from-[#00a1e0] border-t border-[#00d4ff] to-transparent rounded-full" 
              />
            ))}
          </div>

        </div>
      </motion.div>
      <motion.p 
         animate={{ opacity: [0.5, 1, 0.5] }}
         transition={{ duration: 2, repeat: Infinity }}
         className="absolute -bottom-12 text-sm text-[#00a1e0] font-mono tracking-[0.2em] text-center w-full bg-black/50 py-1 rounded-full backdrop-blur-md"
      >
        TOUCH TO MOVE
      </motion.p>
    </div>
  );
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(true); // Default to true for fastest mobile load

  useEffect(() => {
    // Only mount heavy 3D if viewport is large enough and device seems capable
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-[#00a1e0] selection:text-white pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-10">
        
        {/* Background Gradients & Spline 3D */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-[#00a1e0]/15 blur-[120px] rounded-full pointer-events-none"></div>
        
        {!isMobile ? (
          <SplineScene /> 
        ) : (
          <MobileRobot />
        )}

        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-5xl mx-auto pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass border border-white/10 px-6 py-2 rounded-full mb-8 flex items-center gap-2 pointer-events-auto shadow-[0_0_20px_rgba(0,161,224,0.15)]"
          >
            <Sparkles className="w-5 h-5 text-[#00a1e0]" />
            <span className="text-xs md:text-sm font-medium tracking-widest text-[#e2e8f0] uppercase">
              The Next-Gen Community Experience
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black font-display tracking-tight leading-[1.1] mb-6 drop-shadow-lg"
          >
            SFMC Mumbai <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1e0] via-[#00d4ff] to-purple-400">
              Experience Hub
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl text-gray-300 max-w-2xl font-light mb-12"
          >
            A high-energy, interactive check-in platform powering the ultimate Trailblazer networking event.
          </motion.p>
        </div>
      </section>

      {/* 2. EVENT CHECK-IN CTA (QR Focus) */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 -mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
        >
          <div className="space-y-4 text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to drop in?</h2>
            <p className="text-gray-400">Scan the QR code at the venue or register directly right here to claim your digital badge and skip the queue.</p>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Calendar className="w-4 h-4 text-[#00a1e0]" /> Oct 24, 2026
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <MapPin className="w-4 h-4 text-[#00a1e0]" /> Jio World Convention
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/register">
              <button className="w-full md:w-auto glow-button group flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all">
                Check In Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 3. SPEAKERS SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mt-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Meet the Visionaries</h2>
          <p className="text-gray-400">Learn from the top minds powering the Salesforce ecosystem.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Sarah Connor", role: "Global Marketing Cloud Architect", img: "👩‍💼" },
            { name: "David Chen", role: "VP of Digital Engineering", img: "👨‍💻" },
            { name: "Priya Sharma", role: "Lead DevRel", img: "👩‍💻" }
          ].map((speaker, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="glass-card group p-6 rounded-[1.5rem] border border-white/5 hover:border-[#00a1e0]/30 transition-colors flex flex-col items-center text-center cursor-pointer overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl group-hover:bg-[#00a1e0]/20 transition-colors pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform shadow-xl">
                {speaker.img}
              </div>
              <h3 className="text-xl font-bold">{speaker.name}</h3>
              <p className="text-sm text-[#00a1e0] mt-1">{speaker.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. COMMUNITY STATS */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mt-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: "Total Check-ins", value: 342, icon: Users, suffix: "+" },
            { label: "Live Interactions", value: 890, icon: Activity, suffix: "+" },
            { label: "Expert Speakers", value: 12, icon: User, suffix: "" },
            { label: "Community Rating", value: 4.9, icon: Sparkles, suffix: "/5" }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 text-center rounded-2xl border border-white/5"
            >
              <stat.icon className="w-8 h-8 text-[#00a1e0] mx-auto mb-4 opacity-70" />
              <div className="text-3xl md:text-5xl font-black mb-1 text-white tabular-nums drop-shadow-md">
                <AnimatedNumber value={stat.value} />
                <span className="text-[#00a1e0]">{stat.suffix}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. SOCIAL LINKS / FOOTER */}
      <footer className="relative z-10 max-w-5xl mx-auto px-4 mt-32 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00a1e0] to-[#00d4ff] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Experience Hub</span>
        </div>
        
        <div className="flex gap-4">
          <a href="#" className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-[#0077b5] hover:border-transparent transition-all group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-black hover:border-white/20 transition-all group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.922H5.078z"/>
            </svg>
          </a>
        </div>
      </footer>
      
    </div>
  );
}
