import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState("signup"); // signup, otp
    const [loading, setLoading] = useState(false);

    // Signup State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // OTP State
    const [otp, setOtp] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!email.endsWith("@bicnepal.edu.np") && !email.endsWith("@gmail.com")) {
            toast.error("Please use @bicnepal.edu.np or @gmail.com email address");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/signup", {
                full_name: fullName,
                email,
                password,
                confirm_password: confirmPassword
            });
            toast.success("Account created! Please verify your email.");
            setStep("otp");
        } catch (err) {
            toast.error(err.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Enter 6-digit verification code");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/verify-otp", { email, otp });
            toast.success("Email verified! You can now log in.");
            // Redirect to login with state to pre-fill
            navigate("/login", { state: { email, password } });
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="border-2 shadow-soft overflow-hidden">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4">
                            <UserPlus className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-display font-bold">
                            {step === "signup" ? "Create Account" : "Verify Email"}
                        </CardTitle>
                        <CardDescription>
                            {step === "signup"
                                ? "Join the BIC Sports Management System"
                                : "Enter the code sent to " + email}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {step === "signup" ? (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
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
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign Up
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <p className="text-center text-sm text-muted-foreground mt-4">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary font-medium hover:underline">
                                        Log in
                                    </Link>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-2 text-center">
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
                                            className="pl-10 text-center text-2xl tracking-[0.5em] font-mono"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Check your inbox and spam folder for the code.
                                    </p>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify & Continue
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => setStep("signup")}
                                >
                                    Back to Registration
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
