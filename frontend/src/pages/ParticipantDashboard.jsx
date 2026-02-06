import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useFCM } from '../hooks/useFCM';
import { Calendar, Bell, ClipboardList, Trophy } from 'lucide-react';

export default function ParticipantDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize FCM
    useFCM(user?.id);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/participant/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Header */}
            <div className="bg-secondary p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black italic italic">PLAYER PROFILE</h2>
                    <p className="text-primary-foreground/70 uppercase tracking-widest text-xs font-bold mt-1">Status: Active Participant</p>
                </div>
                <div className="flex gap-12 relative z-10">
                    <div className="text-center">
                        <p className="text-4xl font-black">{data.registrations.teams.length + data.registrations.single.length}</p>
                        <p className="text-[10px] text-primary underline uppercase font-bold tracking-tighter">Registered Sports</p>
                    </div>
                </div>
                <Trophy className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Matches */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        My Upcoming Matches
                    </h3>
                    {data.upcoming_matches.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200 text-gray-400">
                            No upcoming scheduled matches.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.upcoming_matches.map(m => (
                                <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase">{m.sport_name}</p>
                                        <p className="text-lg font-bold text-secondary mt-1">Round {m.round_no} match</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(m.match_datetime).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Bell size={14} /> {new Date(m.match_datetime).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 rounded-xl text-secondary font-bold text-sm">
                                        {m.venue}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notifications & Quick Links */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-primary" />
                            Recent Notifications
                        </h3>
                        <div className="space-y-4">
                            {data.notifications.map(n => (
                                <div key={n.id} className="p-3 bg-gray-50 rounded-xl relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                                    <p className="font-bold text-sm text-secondary">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                            <button onClick={() => window.location.href = '/notifications'} className="w-full text-center text-xs font-bold text-primary hover:underline mt-2">View All Notifications</button>
                        </div>
                    </div>

                    <div className="bg-primary p-6 rounded-3xl shadow-lg text-white">
                        <h3 className="font-bold mb-4">Want to play more?</h3>
                        <p className="text-sm opacity-90 mb-6">Register for more upcoming sports tournaments and events.</p>
                        <button
                            onClick={() => window.location.href = '/register'}
                            className="bg-white text-primary px-6 py-3 rounded-xl font-bold w-full hover:bg-gray-100 transition-colors"
                        >
                            Register New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
