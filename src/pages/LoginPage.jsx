import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trophy, Mail, ShieldCheck, Loader2, ArrowRight, Lock, KeyRound } from "lucide-react";
import api from "@/lib/axios";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loginMethod, setLoginMethod] = useState("password"); // password, otp
    const [step, setStep] = useState("input"); // input, otp_verify
    const [loading, setLoading] = useState(false);

    // Pre-fill from signup redirect
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            if (location.state.password) {
                setPassword(location.state.password);
                setLoginMethod("password");
            }
        }
    }, [location.state]);

    const handleRequestOTP = async (e) => {
        e?.preventDefault();
        if (!email.endsWith("@bicnepal.edu.np") && !email.endsWith("@gmail.com")) {
            toast.error("Please use @bicnepal.edu.np or @gmail.com email address");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/request-login-otp", { email });
            toast.success(data.message);
            setStep("otp_verify");
            setLoginMethod("otp");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginData = { email };
        if (loginMethod === "otp") {
            if (otp.length !== 6) {
                toast.error("Please enter a valid 6-digit code");
                return;
            }
            loginData.otp = otp;
        } else {
            if (!password) {
                toast.error("Please enter your password");
                return;
            }
            loginData.password = password;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", loginData);
            toast.success("Login successful!");

            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            if (err.response?.data?.notVerified) {
                toast.error(err.response.data.message);
                handleRequestOTP(); // Automatically trigger OTP if not verified
            } else {
                toast.error(err.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="border-2 shadow-soft overflow-hidden">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4">
                            <Trophy className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-display font-bold">Participant Login</CardTitle>
                        <CardDescription>
                            {step === "otp_verify"
                                ? "Enter the code sent to " + email
                                : "Access your BIC Athletics account"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {step === "input" ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@bicnepal.edu.np or gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                {loginMethod === "password" ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <button
                                                type="button"
                                                onClick={() => setLoginMethod("otp")}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Login with OTP instead
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleRequestOTP}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                                            Send Login Code via OTP
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => setLoginMethod("password")}
                                            className="w-full text-center text-xs text-primary hover:underline mt-2"
                                        >
                                            Use Password instead
                                        </button>
                                    </div>
                                )}

                                {loginMethod === "password" && (
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}

                                <div className="text-center pt-4 border-t mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        New participant?{" "}
                                        <Link to="/signup" className="text-primary font-medium hover:underline">
                                            Create Account
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            className="pl-10 text-center text-xl tracking-[0.5em] font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Verify & Login
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setStep("input")}
                                >
                                    Change Method/Email
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
