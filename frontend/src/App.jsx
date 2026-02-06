import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout, AppLayout } from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import OTPVerifyPage from './pages/OTPVerifyPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSportsPage from './pages/admin/AdminSportsPage';
import AdminDrawPage from './pages/admin/AdminDrawPage';

// Placeholder/Future
const Placeholder = ({ title }) => (
    <div className="bg-white p-12 rounded-3xl text-center border border-dashed text-gray-400">
        {title} Component Coming Soon
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/verify-otp" element={<OTPVerifyPage />} />
                    </Route>

                    {/* Participant Routes */}
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<ParticipantDashboard />} />
                        <Route path="/register" element={<Placeholder title="Registration Form" />} />
                        <Route path="/tiesheet" element={<Placeholder title="Public Tie Sheets" />} />
                        <Route path="/notifications" element={<Placeholder title="Notifications History" />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<AppLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/sports" element={<AdminSportsPage />} />
                        <Route path="/admin/registrations" element={<Placeholder title="Registration Management" />} />
                        <Route path="/admin/draw" element={<AdminDrawPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
