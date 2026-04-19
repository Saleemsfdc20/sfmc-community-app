"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Loader2, Sparkles, Users } from "lucide-react";

type Attendee = {
  id: string;
  name: string;
  city: string;
  role: string;
  linkedin_url: string | null;
  created_at: string;
};

// Inline SVG for LinkedIn to avoid lucide-react brand icon issues
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function MembersPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchAttendees = async () => {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, name, city, role, linkedin_url, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching attendees:", error);
      } else {
        setAttendees(data || []);
      }
      setLoading(false);
    };

    fetchAttendees();

    // Subscribe to realtime inserts
    const subscription = supabase
      .channel("public:attendees")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendees",
        },
        (payload) => {
          setAttendees((current) => [payload.new as Attendee, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#00a1e0] transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
                Experience Hub <Sparkles className="w-6 h-6 text-[#00a1e0]" />
              </h1>
              <p className="text-[#00a1e0] font-medium tracking-wide">Community Directory</p>
            </div>
          </div>
          
          <div className="glass-card px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(0,161,224,0.2)]">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium">{attendees.length} Attendees Live</span>
          </div>
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-12 h-12 text-[#00a1e0] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {attendees.map((attendee) => (
                <motion.div
                  key={attendee.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="glass-card rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(0,161,224,0.15)] transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00a1e0]/10 to-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00a1e0] transition-colors">
                    {attendee.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span>{attendee.role || "Member"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span>{attendee.city}</span>
                    </div>
                  </div>

                  {attendee.linkedin_url && (
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                      <a 
                        href={attendee.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0a66c2]/80 hover:bg-[#0a66c2] text-white text-sm font-medium transition-colors shadow-sm"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                        Connect
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {attendees.length === 0 && !loading && (
              <div className="col-span-full flex flex-col justify-center items-center py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">It's quiet in here</h3>
                <p className="text-gray-400">Be the first to check in and appear in the community directory!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
