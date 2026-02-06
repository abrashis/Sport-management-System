import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trophy, Plus, Pencil, Trash2, Users, User, Loader2 } from "lucide-react";





export default function AdminSportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("team");
  const [maxPlayers, setMaxPlayers] = useState("11");
  const [registrationOpen, setRegistrationOpen] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    const { data, error } = await supabase.
    from("sports").
    select("*").
    order("name");

    if (error) {
      console.error("Error fetching sports:", error);
      toast.error("Failed to load sports");
    } else {
      setSports(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setType("team");
    setMaxPlayers("11");
    setRegistrationOpen(true);
    setEditingSport(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (sport) => {
    setEditingSport(sport);
    setName(sport.name);
    setType(sport.type);
    setMaxPlayers(sport.max_players.toString());
    setRegistrationOpen(sport.registration_open);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Sport name is required");
      return;
    }

    setSaving(true);

    try {
      const sportData = {
        name: name.trim(),
        type: type,
        max_players: parseInt(maxPlayers) || 1,
        registration_open: registrationOpen
      };

      if (editingSport) {
        const { error } = await supabase.
        from("sports").
        update(sportData).
        eq("id", editingSport.id);

        if (error) throw error;
        toast.success("Sport updated successfully");
      } else {
        const { error } = await supabase.
        from("sports").
        insert(sportData);

        if (error) throw error;
        toast.success("Sport added successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchSports();
    } catch (error) {
      console.error("Save error:", error);
      if (error.code === "23505") {
        toast.error("A sport with this name already exists");
      } else {
        toast.error(error.message || "Failed to save sport");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sport) => {
    try {
      const { error } = await supabase.
      from("sports").
      delete().
      eq("id", sport.id);

      if (error) throw error;
      toast.success("Sport deleted successfully");
      fetchSports();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete sport");
    }
  };

  const toggleRegistration = async (sport) => {
    try {
      const { error } = await supabase.
      from("sports").
      update({ registration_open: !sport.registration_open }).
      eq("id", sport.id);

      if (error) throw error;
      toast.success(`Registration ${!sport.registration_open ? "opened" : "closed"}`);
      fetchSports();
    } catch (error) {
      toast.error("Failed to update registration status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) =>
          <Skeleton key={i} className="h-40" />
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Sports Management</h1>
          <p className="text-muted-foreground">Add and manage sports for tournaments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSport ? "Edit Sport" : "Add New Sport"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sportName">Sport Name</Label>
                <Input
                  id="sportName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Football" />
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="sportType">Sport Type</Label>
                <Select value={type} onValueChange={(v) => setType(v)}>
                  <SelectTrigger id="sportType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Sport
                      </div>
                    </SelectItem>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Individual Sport
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">
                  {type === "team" ? "Players per Team" : "Max Participants"}
                </Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  min="1"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)} />
                
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="regOpen">Registration Open</Label>
                <Switch
                  id="regOpen"
                  checked={registrationOpen}
                  onCheckedChange={setRegistrationOpen} />
                
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={saving}>
                {saving ?
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </> :

                "Save"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sports Grid */}
      {sports.length === 0 ?
      <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Sports Yet</h3>
          <p className="text-muted-foreground mb-4">Add your first sport to get started.</p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sport
          </Button>
        </Card> :

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport) =>
        <Card key={sport.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg gradient-hero flex items-center justify-center text-white">
                      {sport.type === "team" ?
                  <Users className="h-5 w-5" /> :

                  <User className="h-5 w-5" />
                  }
                    </div>
                    <div>
                      <CardTitle className="text-lg">{sport.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{sport.type}</p>
                    </div>
                  </div>
                  <Badge variant={sport.registration_open ? "default" : "secondary"}>
                    {sport.registration_open ? "Open" : "Closed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Max {sport.max_players} players per {sport.type === "team" ? "team" : "registration"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRegistration(sport)}>
                
                    {sport.registration_open ? "Close" : "Open"} Reg
                  </Button>
                  <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(sport)}>
                
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sport?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{sport.name}" and all associated registrations and matches.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                      onClick={() => handleDelete(sport)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
        )}
        </div>
      }
    </div>);

}