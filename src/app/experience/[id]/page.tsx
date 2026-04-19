"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle2, 
  MessageCircle,
  Users,
  Sparkles,
  Bot,
  TrendingUp,
  Briefcase,
  UsersRound
} from "lucide-react";
import toast from "react-hot-toast";

type Attendee = {
  id: string;
  name: string;
  attendee_number: number;
};

export default function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [votedTopic, setVotedTopic] = useState<string | null>(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    const fetchAttendee = async () => {
      // Mock data fallback if supabase isn't connected
      const mockAttendee = { id: resolvedParams.id, name: "Trailblazer", attendee_number: 124 };
      try {
        const { data, error } = await supabase
          .from("attendees")
          .select("id, name, attendee_number")
          .eq("id", resolvedParams.id)
          .single();

        if (data) {
          setAttendee(data);
        } else {
          setAttendee(mockAttendee);
        }
      } catch (e) {
        setAttendee(mockAttendee);
      }
    };

    fetchAttendee();
    return () => clearTimeout(timer);
  }, [resolvedParams.id]);

  const handleVote = async (topic: string) => {
    setVotedTopic(topic);
    toast.success("Thanks for sharing! We'll tailor the event for you.");
    try {
      await supabase.from("interactions").insert([
        { attendee_id: resolvedParams.id, interest: topic }
      ]);
    } catch (e) {
      console.log("Error saving vote:", e);
    }
  };

  const pollOptions = [
    { id: "ai", label: "AI", icon: Bot, color: "from-purple-500 to-indigo-500" },
    { id: "marketing", label: "Marketing", icon: TrendingUp, color: "from-pink-500 to-rose-500" },
    { id: "career", label: "Career Growth", icon: Briefcase, color: "from-emerald-500 to-teal-500" },
    { id: "networking", label: "Networking", icon: UsersRound, color: "from-blue-500 to-cyan-500" },
  ];

  if (!attendee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#00a1e0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00a1e0]/20 blur-[120px] rounded-full pointer-events-none"></div>

      {showConfetti && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} colors={['#00a1e0', '#00d4ff', '#ffffff', '#032e61']} />
      )}

      <main className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 bg-[#00a1e0]/10 rounded-full mb-2">
            <CheckCircle2 className="w-8 h-8 text-[#00a1e0]" />
          </div>
          <h1 className="text-3xl font-display font-bold">
            You're officially part of <span className="neon-text-blue text-[#00a1e0]">SFMC Mumbai</span> 🚀
          </h1>
          <div className="glass inline-block px-6 py-3 rounded-full border border-white/10">
            <p className="text-xl">
              Welcome, <span className="font-bold">{attendee.name.split(' ')[0]}</span> <br/>
              <span className="text-sm text-gray-400 mt-1 block">You are attendee <span className="text-[#00d4ff] font-mono font-bold">#{attendee.attendee_number}</span> today 🔥</span>
            </p>
          </div>
        </motion.div>

        {/* Engagement Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full"></div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            What are you most excited about today?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pollOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={votedTopic !== null}
                className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2
                  ${votedTopic === opt.id 
                    ? `border-${opt.color.split('-')[1]}-500 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]` 
                    : votedTopic ? 'opacity-50 border-white/5 bg-transparent cursor-not-allowed' : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'}`}
              >
                {votedTopic === opt.id && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-20`}></div>
                )}
                <opt.icon className={`w-6 h-6 ${votedTopic === opt.id ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Meet Speakers Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold px-2">🎤 Meet the Speakers</h3>
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card flex-none w-64 rounded-2xl p-4 snap-start group cursor-pointer border border-white/5 hover:border-[#00a1e0]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-[#00a1e0] group-hover:to-purple-500 transition-colors flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Speaker Name</h4>
                    <p className="text-xs text-gray-400">Salesforce Architect</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Community Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <a href="#" className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-colors border border-white/5 group">
            <div className="p-2 bg-[#0077b5]/20 rounded-lg group-hover:bg-[#0077b5] transition-colors">
              <Linkedin className="w-5 h-5 text-[#0077b5] group-hover:text-white" />
            </div>
            <span className="font-medium">Let's Connect</span>
          </a>
          <a href="#" className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-colors border border-white/5 group">
            <div className="p-2 bg-[#1DA1F2]/20 rounded-lg group-hover:bg-[#1DA1F2] transition-colors">
              <Twitter className="w-5 h-5 text-[#1DA1F2] group-hover:text-white" />
            </div>
            <span className="font-medium">Follow Updates</span>
          </a>
        </motion.div>

        {/* WhatsApp Opt-in */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className="w-full glow-button bg-gradient-to-r from-[#25D366]/20 to-[#128C7E]/20 border border-[#25D366]/50 rounded-2xl p-5 flex items-center justify-between group">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-[#25D366] rounded-xl shadow-[0_0_15px_rgba(37,211,102,0.5)]">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-[#25D366] transition-colors">Stay Connected</h4>
                <p className="text-sm text-gray-400 mt-1">Join the SFMC Mumbai WhatsApp Group</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Real-time Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-4 flex items-center justify-center gap-2 text-gray-500 text-sm"
        >
          <Users className="w-4 h-4" />
          <span><strong className="text-white">120+</strong> trailblazers checked in today</span>
        </motion.div>
      </main>
    </div>
  );
}

// Add simple ChevronRight icon for the whatsapp button since we didn't import it at the top
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Linkedin(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function Twitter(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}
