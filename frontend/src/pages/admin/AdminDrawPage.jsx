import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Settings, Calendar, MapPin, Clock, Zap } from 'lucide-react';

export default function AdminDrawPage() {
    const [sports, setSports] = useState([]);
    const [formData, setFormData] = useState({
        sport_id: '',
        round_no: 1,
        venue: '',
        start_datetime: '',
        slot_duration: 30
    });
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [sRes, mRes] = await Promise.all([
                api.get('/admin/sports'),
                api.get('/admin/matches')
            ]);
            setSports(sRes.data);
            setMatches(mRes.data);
        };
        fetchData();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/draw', formData);
            alert('Matches generated successfully!');
            // Refresh matches
            const res = await api.get('/admin/matches');
            setMatches(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating draw');
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async (id, status) => {
        try {
            await api.put(`/admin/matches/${id}/visibility`, { published: status });
            setMatches(matches.map(m => m.id === id ? { ...m, published: status } : m));
        } catch (err) {
            alert('Error updating visibility');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-primary" />
                    <h3 className="text-xl font-bold text-secondary">Generate Tie Sheet</h3>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Select Sport</label>
                        <select
                            required
                            className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                            value={formData.sport_id}
                            onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                        >
                            <option value="">-- Choose Sport --</option>
                            {sports.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Round No</label>
                            <input
                                type="number" required
                                className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                                value={formData.round_no}
                                onChange={(e) => setFormData({ ...formData, round_no: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Slot (Mins)</label>
                            <input
                                type="number" required
                                className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                                value={formData.slot_duration}
                                onChange={(e) => setFormData({ ...formData, slot_duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Start Date & Time</label>
                        <input
                            type="datetime-local" required
                            className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                            value={formData.start_datetime}
                            onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Venue</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text" required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl"
                                placeholder="Main Arena"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg hover:bg-secondary-hover mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Generative Draw...' : 'Generate Matches'}
                    </button>
                </form>
            </div>

            {/* Matches List */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Generated Matches
                </h3>

                {matches.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200 text-gray-400 font-medium">
                        No matches generated yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map(m => (
                            <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">{m.sport_name}</span>
                                    <button
                                        onClick={() => toggleVisibility(m.id, !m.published)}
                                        className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${m.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {m.published ? 'Published' : 'Hidden'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-center flex-1">
                                        <div className="text-lg font-bold text-secondary truncate">P1: #{m.participant1_id}</div>
                                        <p className="text-[10px] text-gray-400 uppercase font-black uppercase">{m.participant1_type}</p>
                                    </div>
                                    <div className="text-primary font-black text-xl italic italic">VS</div>
                                    <div className="text-center flex-1">
                                        <div className="text-lg font-bold text-secondary truncate">P2: {m.participant2_type === 'bye' ? 'BYE' : `#${m.participant2_id}`}</div>
                                        <p className="text-[10px] text-gray-400 uppercase font-black uppercase">{m.participant2_type}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock size={14} />
                                        {new Date(m.match_datetime).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MapPin size={14} />
                                        {m.venue}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
