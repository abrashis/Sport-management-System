import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trophy, Loader2, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password
      });

      if (data.user && data.user.role === 'admin') {
        toast.success("Welcome back, Administrator!");
        navigate(from, { replace: true });
      } else {
        toast.error("You don't have admin privileges");
        // Optional: Logout if we want to be strict
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Failed to log in";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-soft">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
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
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    disabled={loading} />

                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

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
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                    disabled={loading} />

                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </> :

                  "Sign In"
                }
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an admin account?{" "}
              <Link to="/admin/signup" className="text-primary hover:underline">
                Request access
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>);

}