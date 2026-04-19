"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { 
  Users, UserPlus, MapPin, TrendingUp, Search, Download, Trash2, Edit2, LogOut, Loader2, Lock
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

type Attendee = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  role: string;
  first_time: boolean;
  created_at: string;
};

// ----------------------------------------------------------------------------
// Admin Login Component
// ----------------------------------------------------------------------------
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Authenticated Successfully");
      onLogin(); // Trigger parent re-render
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none"></div>
      
      <div className="w-[400px] max-w-full z-10 glass-card rounded-2xl p-8 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00a1e0] to-transparent opacity-50"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Lock className="w-6 h-6 text-[#00a1e0]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Admin Security</h2>
          <p className="text-gray-400 text-sm">Sign in to access event intelligence.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 glass-input text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 glass-input text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-bold text-white bg-[#00a1e0] hover:bg-[#008bc2] transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------------------------------
export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => authSub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return; // Only fetch data if authorized

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("attendees")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (data) setAttendees(data);
        if (error) console.error("Error fetching attendees:", error.message);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const subscription = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendees' }, payload => {
        if (payload.eventType === 'INSERT') {
          setAttendees(current => [payload.new as Attendee, ...current]);
        } else if (payload.eventType === 'DELETE') {
          setAttendees(current => current.filter(a => a.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setAttendees(current => current.map(a => a.id === payload.new.id ? payload.new as Attendee : a));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    const toastId = toast.loading("Deleting record...");
    const { error } = await supabase.from('attendees').delete().eq('id', id);
    
    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success("Attendee deleted", { id: toastId });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee) return;
    
    const toastId = toast.loading("Updating record...");
    const { error } = await supabase
      .from('attendees')
      .update({
        name: editingAttendee.name,
        role: editingAttendee.role,
        city: editingAttendee.city
      })
      .eq('id', editingAttendee.id);
      
    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success("Attendee updated", { id: toastId });
      setEditingAttendee(null);
    }
  };

  // Guard Clauses
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00a1e0] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => setIsAuthChecking(false)} />;
  }

  // Compute Stats
  const totalAttendees = attendees.length;
  const firstTimers = attendees.filter(a => a.first_time).length;
  const returning = totalAttendees - firstTimers;

  const cityCounts = attendees.reduce((acc, a) => {
    if(a.city) acc[a.city] = (acc[a.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCity = Object.keys(cityCounts).reduce((a, b) => cityCounts[a] > cityCounts[b] ? a : b, "N/A");

  const roleCounts = attendees.reduce((acc, a) => {
    if(a.role) acc[a.role] = (acc[a.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleData = Object.keys(roleCounts).map(key => ({ name: key, value: roleCounts[key] }));
  const cityData = Object.keys(cityCounts).map(key => ({ name: key, value: cityCounts[key] })).sort((a, b) => b.value - a.value).slice(0, 5);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const filteredAttendees = attendees.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mt-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              Event Intelligence <Lock className="w-5 h-5 text-green-400" />
            </h1>
            <p className="text-gray-400 mt-1">Authenticated Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 px-4 py-2 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Attendees", value: isLoading ? "-" : totalAttendees, icon: Users, color: "text-[#00a1e0]" },
            { label: "First Time Users", value: isLoading ? "-" : firstTimers, icon: UserPlus, color: "text-emerald-400" },
            { label: "Returning Users", value: isLoading ? "-" : returning, icon: TrendingUp, color: "text-purple-400" },
            { label: "Top City", value: isLoading ? "-" : topCity, icon: MapPin, color: "text-rose-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl flex items-center justify-between"
            >
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold font-display">{stat.value}</p>
              </div>
              <div className={`p-3 bg-white/5 rounded-xl border border-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6">Role Distribution</h3>
            <div className="h-64">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {roleData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-gray-500">No data</div>}
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6">Top Cities</h3>
            <div className="h-64 border-b border-transparent">
              {cityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                    <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#00a1e0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-gray-500">No data</div>}
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div className="glass-card rounded-2xl overflow-hidden pb-4">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold">Attendee Directory</h3>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#00a1e0] transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/40 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">City</th>
                  <th className="px-6 py-4 font-medium text-center">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{attendee.name}</div>
                      <div className="text-xs text-gray-400">{attendee.email} {attendee.mobile && `• ${attendee.mobile}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#00a1e0]/10 text-[#00a1e0] border border-[#00a1e0]/20">
                        {attendee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{attendee.city || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-medium ${attendee.first_time ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {attendee.first_time ? 'First Time' : 'Returning'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingAttendee(attendee)} className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-gray-300 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(attendee.id, attendee.name)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal overlay */}
      <AnimatePresence>
        {editingAttendee && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#111] glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Attendee</h3>
                <button onClick={() => setEditingAttendee(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Name</label>
                  <input type="text" value={editingAttendee.name} onChange={e => setEditingAttendee({...editingAttendee, name: e.target.value})} className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">City</label>
                  <input type="text" value={editingAttendee.city} onChange={e => setEditingAttendee({...editingAttendee, city: e.target.value})} className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Role</label>
                  <select value={editingAttendee.role} onChange={e => setEditingAttendee({...editingAttendee, role: e.target.value})} className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white">
                    <option value="Marketer">Marketer</option>
                    <option value="Developer">Developer / Admin</option>
                    <option value="Student">Student / Fresher</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingAttendee(null)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-[#00a1e0] hover:bg-[#008bc2] text-white font-medium transition-colors">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
