import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, User, CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react";
















export default function AdminRegistrationsPage() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sportsRes, teamsRes, playersRes, membersRes] = await Promise.all([
    supabase.from("sports").select("*"),
    supabase.from("teams").select("*").eq("verified", true).order("created_at", { ascending: false }),
    supabase.from("single_players").select("*").eq("verified", true).order("created_at", { ascending: false }),
    supabase.from("team_members").select("*")]
    );

    if (sportsRes.data) setSports(sportsRes.data);

    if (teamsRes.data && sportsRes.data && membersRes.data) {
      const enrichedTeams = teamsRes.data.map((team) => ({
        ...team,
        sport_name: sportsRes.data.find((s) => s.id === team.sport_id)?.name || "Unknown",
        members: membersRes.data.filter((m) => m.team_id === team.id)
      }));
      setTeams(enrichedTeams);
    }

    if (playersRes.data && sportsRes.data) {
      const enrichedPlayers = playersRes.data.map((player) => ({
        ...player,
        sport_name: sportsRes.data.find((s) => s.id === player.sport_id)?.name || "Unknown"
      }));
      setPlayers(enrichedPlayers);
    }

    setLoading(false);
  };

  const handleTeamApproval = async (team, status) => {
    setProcessing(team.id);
    try {
      const { error } = await supabase.
      from("teams").
      update({ approved_status: status }).
      eq("id", team.id);

      if (error) throw error;
      toast.success(`Team ${status === "approved" ? "approved" : "rejected"}`);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const handlePlayerApproval = async (player, status) => {
    setProcessing(player.id);
    try {
      const { error } = await supabase.
      from("single_players").
      update({ approved_status: status }).
      eq("id", player.id);

      if (error) throw error;
      toast.success(`Player ${status === "approved" ? "approved" : "rejected"}`);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const pendingTeams = teams.filter((t) => t.approved_status === "pending");
  const pendingPlayers = players.filter((p) => p.approved_status === "pending");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) =>
          <Skeleton key={i} className="h-24" />
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Registrations</h1>
        <p className="text-muted-foreground">
          Review and approve participant registrations
          {(pendingTeams.length > 0 || pendingPlayers.length > 0) &&
          <span className="ml-2">
              <Badge variant="secondary">{pendingTeams.length + pendingPlayers.length} pending</Badge>
            </span>
          }
        </p>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams" className="gap-2">
            <Users className="h-4 w-4" />
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="singles" className="gap-2">
            <User className="h-4 w-4" />
            Singles ({players.length})
          </TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          {teams.length === 0 ?
          <Card className="p-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Team Registrations</h3>
              <p className="text-muted-foreground">Team registrations will appear here after email verification.</p>
            </Card> :

          teams.map((team) =>
          <Card key={team.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.team_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{team.sport_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(team.approved_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Captain</p>
                      <p className="font-medium">{team.captain_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{team.captain_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{team.captain_phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View Members ({team.members.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Team Members - {team.team_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                          {team.members.length === 0 ?
                      <p className="text-muted-foreground">No members added</p> :

                      team.members.map((member) =>
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium">{member.member_name}</p>
                                  <p className="text-sm text-muted-foreground">{member.section || "No section"}</p>
                                </div>
                                {member.jersey_number &&
                        <Badge variant="outline">#{member.jersey_number}</Badge>
                        }
                              </div>
                      )
                      }
                        </div>
                      </DialogContent>
                    </Dialog>

                    {team.approved_status === "pending" &&
                <>
                        <Button
                    size="sm"
                    onClick={() => handleTeamApproval(team, "approved")}
                    disabled={processing === team.id}
                    className="gap-1">
                    
                          {processing === team.id ?
                    <Loader2 className="h-4 w-4 animate-spin" /> :

                    <CheckCircle className="h-4 w-4" />
                    }
                          Approve
                        </Button>
                        <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleTeamApproval(team, "rejected")}
                    disabled={processing === team.id}
                    className="gap-1">
                    
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                }
                  </div>
                </CardContent>
              </Card>
          )
          }
        </TabsContent>

        {/* Singles Tab */}
        <TabsContent value="singles" className="space-y-4">
          {players.length === 0 ?
          <Card className="p-8 text-center">
              <User className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Individual Registrations</h3>
              <p className="text-muted-foreground">Individual registrations will appear here after email verification.</p>
            </Card> :

          players.map((player) =>
          <Card key={player.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{player.sport_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(player.approved_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{player.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{player.phone}</p>
                    </div>
                  </div>

                  {player.approved_status === "pending" &&
              <div className="flex gap-2">
                      <Button
                  size="sm"
                  onClick={() => handlePlayerApproval(player, "approved")}
                  disabled={processing === player.id}
                  className="gap-1">
                  
                        {processing === player.id ?
                  <Loader2 className="h-4 w-4 animate-spin" /> :

                  <CheckCircle className="h-4 w-4" />
                  }
                        Approve
                      </Button>
                      <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handlePlayerApproval(player, "rejected")}
                  disabled={processing === player.id}
                  className="gap-1">
                  
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
              }
                </CardContent>
              </Card>
          )
          }
        </TabsContent>
      </Tabs>
    </div>);

}