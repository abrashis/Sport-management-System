import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminSportsPage() {
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'team', max_players: 11 });
    const [editingId, setEditingId] = useState(null);

    const fetchSports = async () => {
        try {
            const res = await api.get('/admin/sports');
            setSports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSports();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/sports/${editingId}`, formData);
            } else {
                await api.post('/admin/sports', formData);
            }
            setIsModalOpen(false);
            setFormData({ name: '', type: 'team', max_players: 11 });
            setEditingId(null);
            fetchSports();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving sport');
        }
    };

    const handleEdit = (sport) => {
        setFormData({ name: sport.name, type: sport.type, max_players: sport.max_players, registration_open: sport.registration_open });
        setEditingId(sport.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this sport?')) return;
        try {
            await api.delete(`/admin/sports/${id}`);
            fetchSports();
        } catch (err) {
            alert('Error deleting sport');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-secondary">Manage Sports</h2>
                <button
                    onClick={() => { setEditingId(null); setFormData({ name: '', type: 'team', max_players: 11 }); setIsModalOpen(true); }}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover shadow-lg transition-all"
                >
                    <Plus size={20} />
                    Add Sport
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Sport Name</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Max Players</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sports.map((sport) => (
                            <tr key={sport.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-secondary">{sport.name}</td>
                                <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{sport.type}</td>
                                <td className="px-6 py-4">{sport.max_players}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${sport.registration_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {sport.registration_open ? 'Open' : 'Closed'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => handleEdit(sport)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(sport.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X /></button>
                        <h3 className="text-2xl font-bold text-secondary mb-6">{editingId ? 'Edit Sport' : 'Create Sport'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600">Sport Name</label>
                                <input
                                    type="text" required
                                    className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Type</label>
                                    <select
                                        className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="team">Team</option>
                                        <option value="single">Single Player</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Max Players</label>
                                    <input
                                        type="number" required
                                        className="w-full mt-1 p-3 bg-gray-50 border rounded-xl"
                                        value={formData.max_players}
                                        onChange={(e) => setFormData({ ...formData, max_players: e.target.value })}
                                    />
                                </div>
                            </div>
                            {editingId && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isOpen"
                                        checked={formData.registration_open}
                                        onChange={(e) => setFormData({ ...formData, registration_open: e.target.checked ? 1 : 0 })}
                                    />
                                    <label htmlFor="isOpen" className="text-sm font-bold text-gray-600">Registration Open</label>
                                </div>
                            )}
                            <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg mt-4 hover:bg-primary-hover">
                                {editingId ? 'Update Sport' : 'Create Sport'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
