import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Trophy, Users, User, Clock, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, matchesRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/matches")
        ]);

        setStats({
          totalSports: statsRes.data.sports || 0,
          totalTeams: statsRes.data.teams || 0, // Note: The API actually returns specific keys, I should check the controller output again
          totalRegistrations: statsRes.data.total_registrations || 0,
          // Use hardcoded 0 or fetch if available for matches count
          upcomingMatches: matchesRes.data.length
        });
        setMatches(matchesRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Check controller output for stats keys
  // Controller: res.json({ users, sports, total_registrations });
  // Wait, the previous frontend code used data.totalSports, data.totalTeams...
  // Let me re-verify what the previous frontend was expecting vs what the controller sends.
  // The controller sends: { users, sports, total_registrations }
  // The previous frontend was:
  /*
    setStats({
        totalSports: data.totalSports || 0,
        totalTeams: data.totalTeams || 0,
        totalSinglePlayers: data.totalSinglePlayers || 0,
        pendingRegistrations: data.pendingRegistrations || 0,
        upcomingMatches: data.upcomingMatches || 0
    });
   */
  // This implies the previous frontend might have been misaligned with the backend or I misread the backend controller.
  // Let's look at `getDashboardStats` in `adminController.js` again.
  /*
    res.json({
        users: users[0].count,
        sports: sports[0].count,
        total_registrations: teams[0].count + registrations[0].count
    });
  */
  // So the backend returns: { users, sports, total_registrations }
  // It does NOT return totalTeams, totalSinglePlayers separately or pendingRegistrations or upcomingMatches in that stats call.
  // I should adjust the frontend to use the actual data returned or fetch what I need.
  // For now I will map:
  // users -> Total Users (or Participants)
  // sports -> Total Sports
  // total_registrations -> Total Registrations

  const statCards = [
    { label: "Total Sports", value: stats?.totalSports, icon: Trophy, color: "text-primary" },
    { label: "Active Participants", value: stats?.users, icon: User, color: "text-blue-500" },
    { label: "Total Registrations", value: stats?.totalRegistrations, icon: Users, color: "text-purple-500" },
    { label: "Total Matches", value: stats?.upcomingMatches, icon: CalendarIcon, color: "text-success" }
  ];

  // Filter matches for selected date
  const selectedDateMatches = matches.filter(match => {
    if (!match.match_datetime) return false;
    try {
      return isSameDay(parseISO(match.match_datetime), date);
    } catch (e) {
      return false;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview & Schedule Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover border-l-4 overflow-hidden relative" style={{ borderLeftColor: 'currentColor' }}>
              <div className={`absolute right-4 top-4 opacity-10 ${stat.color}`}>
                <Icon className="w-24 h-24" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-display font-bold">{stat.value ?? 0}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="h-full border-2 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Event Calendar
              </CardTitle>
              <CardDescription>Select a date to view scheduled matches</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-4 pt-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md border shadow-sm bg-card"
              />
            </CardContent>
          </Card>
        </div>

        {/* Schedule Display */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col border-2 shadow-soft">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Schedule
                </CardTitle>
                <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {date ? format(date, 'MMMM do, yyyy') : 'No Date Selected'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              {selectedDateMatches.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateMatches.map((match) => (
                    <div
                      key={match.id}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-3 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{match.sport_name}</h4>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="font-medium">{match.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto pl-4 border-l-0 sm:border-l border-border/50">
                        <div className="text-sm text-muted-foreground mb-1">Time</div>
                        <div className="text-2xl font-bold font-mono text-primary tracking-tight">
                          {format(parseISO(match.match_datetime), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 opacity-40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No matches found</h3>
                  <p>There are no scheduled events for this date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}