import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { KeyRound } from 'lucide-react';

export default function OTPVerifyPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!location.state?.email) {
            navigate('/signup');
        } else {
            setEmail(location.state.email);
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            alert('Email verified successfully! You can now log in.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 ring-1 ring-gray-200 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                    <KeyRound className="text-primary w-10 h-10" />
                </div>

                <h3 className="text-3xl font-bold text-secondary mb-2">Check Your Email</h3>
                <p className="text-gray-500 mb-8">We've sent a 6-digit code to <br /><span className="font-bold text-secondary">{email}</span></p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            required
                            maxLength="6"
                            className="w-full text-center text-4xl font-bold tracking-[1rem] py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-200"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <p className="text-xs text-gray-400 font-medium">Expires in 10 minutes</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-hover hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                <div className="mt-8">
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-gray-500 text-sm hover:text-secondary font-semibold underline underline-offset-4"
                    >
                        Use a different email address
                    </button>
                </div>
            </div>
        </div>
    );
}
