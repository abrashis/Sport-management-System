import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, User, Clock, Calendar, CheckCircle } from "lucide-react";









export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats({
          totalSports: data.totalSports || 0,
          totalTeams: data.totalTeams || 0,
          totalSinglePlayers: data.totalSinglePlayers || 0,
          pendingRegistrations: data.pendingRegistrations || 0,
          upcomingMatches: data.upcomingMatches || 0
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Sports", value: stats?.totalSports, icon: Trophy, color: "text-primary" },
    { label: "Registered Teams", value: stats?.totalTeams, icon: Users, color: "text-blue-500" },
    { label: "Single Players", value: stats?.totalSinglePlayers, icon: User, color: "text-purple-500" },
    { label: "Pending Approvals", value: stats?.pendingRegistrations, icon: Clock, color: "text-warning" },
    { label: "Upcoming Matches", value: stats?.upcomingMatches, icon: Calendar, color: "text-success" }];


  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) =>
            <Skeleton key={i} className="h-32" />
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your tournament management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold">{stat.value ?? 0}</div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Go to <strong>Sports</strong> to add or manage sports</p>
              <p>• Go to <strong>Registrations</strong> to approve pending participants</p>
              <p>• Go to <strong>Draw Generator</strong> to create match schedules</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Authentication</span>
                <span className="text-sm font-medium text-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Service</span>
                <span className="text-sm font-medium text-warning">Demo Mode</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}