import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock } from 'lucide-react';

export default function LandingPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[70vh]">
            {/* Hero Section */}
            <div className="lg:w-1/2 space-y-6">
                <h2 className="text-5xl lg:text-7xl font-extrabold text-secondary leading-tight">
                    Dominate the <span className="text-primary italic underline uppercase">Game</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-lg">
                    Manage your tournaments, track results, and stay notified about your upcoming matches in real-time. The ultimate platform for sports addicts.
                </p>
                <div className="flex gap-4">
                    <div className="bg-secondary p-4 rounded-xl shadow-lg transform rotate-3">
                        <Trophy className="text-primary w-12 h-12" />
                    </div>
                </div>
            </div>

            {/* Login Card */}
            <div className="lg:w-[400px] w-full">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 ring-1 ring-gray-200">
                    <h3 className="text-3xl font-bold text-secondary mb-2">Welcome Back</h3>
                    <p className="text-gray-500 mb-8">Sign in to access your dashboard</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-hover hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500">
                            Don't have an account? {' '}
                            <Link to="/signup" className="text-secondary font-bold hover:text-primary transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
