import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Trophy, ClipboardList, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading Stats...</div>;

    const cards = [
        { label: 'Total Participants', value: stats.users, icon: Users, color: 'bg-blue-500' },
        { label: 'Active Sports', value: stats.sports, icon: Trophy, color: 'bg-primary' },
        { label: 'Total Registrations', value: stats.total_registrations, icon: ClipboardList, color: 'bg-green-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className={`${card.color} p-4 rounded-xl text-white shadow-lg`}>
                            <card.icon size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{card.label}</p>
                            <h4 className="text-3xl font-bold text-secondary mt-1">{card.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-primary" />
                    <h3 className="text-xl font-bold text-secondary">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => window.location.href = '/admin/sports'} className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-red-50 transition-all text-left">
                        <p className="font-bold text-secondary">Add New Sport</p>
                        <p className="text-sm text-gray-500 mt-1">Create a new tournament</p>
                    </button>
                    <button onClick={() => window.location.href = '/admin/draw'} className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-red-50 transition-all text-left">
                        <p className="font-bold text-secondary">Generate Draw</p>
                        <p className="text-sm text-gray-500 mt-1">Pair teams for matches</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
