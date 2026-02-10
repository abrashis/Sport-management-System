import { Link } from "react-router-dom";
import { Trophy, Users, Calendar, ArrowRight, Shield, Star, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Trophy,
    title: "Official Tournaments",
    description: "Participate in sanctioned university sports events with professional officiating and tracking."
  },
  {
    icon: Shield,
    title: "Secure Registration",
    description: "Exclusive access for BIC students via official @bicedu.np email verification."
  },
  {
    icon: Calendar,
    title: "Dynamic Tie-Sheets",
    description: "Real-time match schedules, automated draws, and live tournament progress tracking."
  }
];

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  if (user) {
    return (
      <div className="min-h-screen bg-muted/10 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Welcome back, {user.full_name.split(' ')[0]}! 👋</h1>
              <p className="text-muted-foreground">Participant Dashboard • {user.email}</p>
            </div>
          </div>

          {/* Quick Stats/Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-100 dark:bg-green-900/30 w-fit px-3 py-1 rounded-full text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Active & Verified
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  My Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">0</div>
                <p className="text-xs text-muted-foreground mt-1">Active tournament entries</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">0</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled games</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/sports">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">View Sports</h3>
                      <p className="text-sm text-muted-foreground">Browse available games</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/register">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Register Now</h3>
                      <p className="text-sm text-muted-foreground">Join a tournament</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/tie-sheets">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Tie Sheets</h3>
                      <p className="text-sm text-muted-foreground">Check match schedules</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PUBLIC LANDING PAGE
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-50" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
                <Star className="h-3.5 w-3.5 fill-primary" />
                <span>BIC Athletics Excellence 2026</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                Elevating the <br />
                <span className="text-primary italic">Spirit</span> of BIC Sports.
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                The official tournament management platform for Boston International College.
                Experience competition with professionalism and precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="px-8 h-14 text-base rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="px-8 h-14 text-base rounded-full border-2 border-primary/20 text-primary hover:bg-primary/5">
                    Login
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-8 text-sm text-muted-foreground border-t max-w-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Official Ranking</span>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl -rotate-3" />
              <div className="relative aspect-square rounded-3xl border-8 border-white shadow-2xl overflow-hidden bg-muted">
                <img
                  src={`/sports-week-poster-2026.jpg?v=${new Date().getTime()}`}
                  onError={(e) => {
                    // Fallback to a generic sports placeholder if local file fails
                    e.target.src = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800";
                    e.target.onerror = null;
                  }}
                  alt="Sports Week 2026"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-secondary">
            <div>
              <div className="text-3xl font-bold font-display">12+</div>
              <div className="text-sm text-muted-foreground">Active Sports</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display">500+</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display">100+</div>
              <div className="text-sm text-muted-foreground">Matches Scheduled</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display">BIC</div>
              <div className="text-sm text-muted-foreground">Excellence Hub</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-display font-bold">Comprehensive Tournament Control</h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for the athletic needs of Boston International College students.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-8 rounded-3xl bg-card border hover:border-primary/50 transition-colors shadow-soft hover:shadow-xl">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-[3rem] overflow-hidden relative bg-secondary text-white p-12 lg:p-24 text-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541252260737-04029456eeba?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-6xl font-display font-bold">Ready to make your mark?</h2>
              <p className="text-lg text-white/70">
                Join the competition today and become a part of Boston International College's sporting legacy.
              </p>
              <div className="pt-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-secondary hover:bg-white/90 px-12 h-16 text-lg rounded-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}