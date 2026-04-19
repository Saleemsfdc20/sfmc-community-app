"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  User,
  Calendar,
  MapPin,
  Users,
  Activity,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Particle Field with Mouse Parallax ─────────────────────────────
function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseRef.current = { x, y };

    // Apply parallax to particles via CSS custom properties
    containerRef.current.style.setProperty("--mouse-x", `${x * 15}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y * 15}px`);
  }, []);

  const particleCount = isMobile ? 12 : 30;

  // Generate stable particle configs
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 1.5,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
      color:
        i % 3 === 0
          ? "rgba(0, 161, 224, 0.4)"
          : i % 3 === 1
          ? "rgba(139, 92, 246, 0.35)"
          : "rgba(255, 255, 255, 0.25)",
    }))
  ).current;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 pointer-events-auto z-0 overflow-hidden"
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties
      }
    >
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#030818] to-[#0a0520]" />

      {/* Drifting gradient orbs */}
      <div className="orb-1 absolute top-[-15%] left-[-5%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-[#00a1e0]/[0.12] rounded-full blur-[150px]" />
      <div className="orb-2 absolute top-[5%] right-[-10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-purple-600/[0.10] rounded-full blur-[140px]" />
      <div className="orb-3 absolute bottom-[-15%] left-[20%] w-[450px] h-[450px] md:w-[550px] md:h-[550px] bg-[#00d4ff]/[0.08] rounded-full blur-[130px]" />

      {/* Extra accent orb for depth */}
      <div className="orb-2 absolute top-[50%] right-[10%] w-[300px] h-[300px] bg-pink-500/[0.04] rounded-full blur-[120px]" />

      {/* Hero radial glow */}
      <div className="absolute inset-0 hero-radial-glow" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />

      {/* Particles */}
      {particles.slice(0, particleCount).map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            translate: "var(--mouse-x) var(--mouse-y)",
            transition: "translate 0.8s ease-out",
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ───────────────────────────────────────────────
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

// ─── Member type ────────────────────────────────────────────────────
type Member = {
  id: string;
  name: string;
  city: string;
  role: string;
  linkedin_url: string | null;
};

// ─── Main Landing Page ──────────────────────────────────────────────
export default function LandingPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("attendees")
        .select("id, name, city, role, linkedin_url")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setMembers(data);
    };
    fetchMembers();
  }, []);

  return (
    <div className="relative min-h-screen bg-black font-sans selection:bg-[#00a1e0] selection:text-white">
      {/* ─── Animated Particle Background ─── */}
      <ParticleField />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(0,161,224,0.1)]"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs sm:text-sm font-medium tracking-widest text-gray-300 uppercase">
            The Next-Gen Community Experience
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight leading-[1.05] mb-6"
        >
          SFMC Mumbai{" "}
          <span className="inline-block">🚀</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1e0] via-[#00d4ff] to-purple-400">
            Experience Hub
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl font-light mb-10 leading-relaxed"
        >
          Connect. Learn. Grow together.
          <br className="hidden sm:block" />
          <span className="text-gray-500">
            The ultimate Trailblazer networking event in Mumbai.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none sm:w-auto"
        >
          <Link href="/register">
            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 bg-gradient-to-r from-[#00a1e0] to-[#0077b5] text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(0,161,224,0.3)] hover:shadow-[0_0_50px_rgba(0,161,224,0.5)] hover:scale-[1.02] transition-all duration-300">
              Register Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/members">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 border border-white/15 text-white px-8 py-4 rounded-full font-bold text-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300">
              Explore Community
              <Users className="w-5 h-5 opacity-70" />
            </button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: EVENT CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#00a1e0]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to drop in?</h2>
            <p className="text-gray-400 leading-relaxed">
              Scan the QR code at the venue or register directly right here to claim your digital badge and skip the queue.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <Calendar className="w-4 h-4 text-[#00a1e0]" /> Oct 24, 2026
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <MapPin className="w-4 h-4 text-[#00a1e0]" /> Jio World Convention
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto relative z-10">
            <Link href="/register">
              <button className="w-full md:w-auto group flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-300">
                Check In Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: COMMUNITY MEMBERS PREVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-3">
            Community{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a1e0] to-purple-400">
              Members
            </span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Meet the Trailblazers who have already checked in to the Experience Hub.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.length > 0
            ? members.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="group p-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md hover:border-[#00a1e0]/30 hover:bg-white/[0.06] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a1e0]/0 group-hover:bg-[#00a1e0]/10 rounded-full blur-3xl transition-colors duration-500 pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a1e0]/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-lg font-bold text-white mb-4">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00a1e0] transition-colors">
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>{member.role || "Member"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-green-400" />
                    <span>{member.city}</span>
                  </div>
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#0a66c2]/20 hover:bg-[#0a66c2]/40 text-[#5bb5f0] text-sm font-medium transition-colors border border-[#0a66c2]/20">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      Connect
                    </a>
                  )}
                </motion.div>
              ))
            : [1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/5 mb-4" />
                  <div className="h-4 w-32 bg-white/5 rounded mb-3" />
                  <div className="h-3 w-24 bg-white/5 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
              ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <Link href="/members">
            <button className="inline-flex items-center gap-2 text-[#00a1e0] font-semibold hover:underline underline-offset-4 transition-all group">
              View All Members
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: STATS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">
            Community{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Impact</span>
          </h2>
          <p className="text-gray-400">Numbers that tell our story.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Check-ins", value: 342, icon: Users, suffix: "+", color: "from-[#00a1e0] to-[#00d4ff]" },
            { label: "Live Interactions", value: 890, icon: Activity, suffix: "+", color: "from-purple-500 to-pink-500" },
            { label: "Expert Speakers", value: 12, icon: User, suffix: "", color: "from-green-400 to-emerald-500" },
            { label: "Community Rating", value: 4.9, icon: Sparkles, suffix: "/5", color: "from-yellow-400 to-orange-400" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="p-6 text-center rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] transition-all duration-300">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1 text-white tabular-nums">
                <AnimatedNumber value={stat.value} />
                <span className="text-lg font-semibold text-gray-400">{stat.suffix}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: SPEAKERS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Meet the Visionaries</h2>
          <p className="text-gray-400">Learn from the top minds powering the Salesforce ecosystem.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Sarah Connor", role: "Global Marketing Cloud Architect", emoji: "👩‍💼" },
            { name: "David Chen", role: "VP of Digital Engineering", emoji: "👨‍💻" },
            { name: "Priya Sharma", role: "Lead DevRel", emoji: "👩‍💻" },
          ].map((speaker, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group p-8 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md hover:border-[#00a1e0]/30 hover:bg-white/[0.06] transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/0 group-hover:bg-[#00a1e0]/10 blur-3xl transition-colors duration-500 pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                {speaker.emoji}
              </div>
              <h3 className="text-xl font-bold">{speaker.name}</h3>
              <p className="text-sm text-[#00a1e0] mt-1 font-medium">{speaker.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: SOCIAL LINKS / FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 max-w-5xl mx-auto px-4 py-16 border-t border-white/[0.07]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00a1e0] to-[#00d4ff] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block">Experience Hub</span>
              <span className="text-xs text-gray-500">SFMC Mumbai 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/members" className="hover:text-white transition-colors">Members</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
          <div className="flex gap-3">
            <a href="#" className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-[#0077b5] hover:border-transparent transition-all duration-300 group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-black hover:border-white/30 transition-all duration-300 group">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.922H5.078z" />
              </svg>
            </a>
            <a href="#" className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-[#E4405F] hover:border-transparent transition-all duration-300 group">
              <Globe className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-10">
          © 2026 SFMC Mumbai Experience Hub. Crafted with ❤️ for the Trailblazer community.
        </p>
      </footer>
    </div>
  );
}

