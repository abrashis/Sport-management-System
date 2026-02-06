import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trophy, Mail, Loader2, ArrowRight, Lock } from "lucide-react";
import api from "@/lib/axios";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Pre-fill from signup redirect
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            if (location.state.password) {
                setPassword(location.state.password);
            }
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!password) {
            toast.error("Please enter your password");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            toast.success("Login successful!");

            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
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
                            Access your BIC Athletics account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@bicnepal.edu.np"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

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
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <div className="text-center pt-4 border-t mt-6">
                                <p className="text-sm text-muted-foreground">
                                    New participant?{" "}
                                    <Link to="/signup" className="text-primary font-medium hover:underline">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
