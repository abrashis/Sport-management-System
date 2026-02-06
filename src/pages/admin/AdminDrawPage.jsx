import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Shuffle, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";














export default function AdminDrawPage() {
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [existingMatches, setExistingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [matchDuration, setMatchDuration] = useState("30");
  const [roundNumber, setRoundNumber] = useState("1");
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState(new Set());
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Generated matches preview
  const [generatedMatches, setGeneratedMatches] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [sportsRes, venuesRes, matchesRes] = await Promise.all([
      supabase.from("sports").select("*").order("name"),
      supabase.from("venues").select("*").order("name"),
      supabase.from("matches").select("*").eq("is_deleted", false).order("match_datetime")]
      );

      if (sportsRes.data) setSports(sportsRes.data);
      if (venuesRes.data) setVenues(venuesRes.data);
      if (matchesRes.data) setExistingMatches(matchesRes.data);
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  const fetchParticipants = async (sportId) => {
    setLoadingParticipants(true);
    const sport = sports.find((s) => s.id === sportId);

    if (!sport) return;

    if (sport.type === "team") {
      const { data } = await supabase.
      from("teams").
      select("*").
      eq("sport_id", sportId).
      eq("approved_status", "approved");

      if (data) {
        setParticipants(data.map((t) => ({
          id: t.id,
          name: t.team_name,
          type: "team"
        })));
      }
    } else {
      const { data } = await supabase.
      from("single_players").
      select("*").
      eq("sport_id", sportId).
      eq("approved_status", "approved");

      if (data) {
        setParticipants(data.map((p) => ({
          id: p.id,
          name: p.name,
          type: "single"
        })));
      }
    }

    setSelectedParticipants(new Set());
    setLoadingParticipants(false);
  };

  const handleSportChange = (sportId) => {
    setSelectedSport(sportId);
    setGeneratedMatches([]);
    fetchParticipants(sportId);
  };

  const toggleParticipant = (id) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
    setGeneratedMatches([]);
  };

  const selectAll = () => {
    setSelectedParticipants(new Set(participants.map((p) => p.id)));
    setGeneratedMatches([]);
  };

  const deselectAll = () => {
    setSelectedParticipants(new Set());
    setGeneratedMatches([]);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateDraw = () => {
    if (selectedParticipants.size < 2) {
      toast.error("Select at least 2 participants");
      return;
    }

    if (!startDate || !startTime) {
      toast.error("Please set start date and time");
      return;
    }

    const selected = participants.filter((p) => selectedParticipants.has(p.id));
    const shuffled = shuffleArray(selected);

    const matches = [];
    let currentTime = new Date(`${startDate}T${startTime}`);
    const durationMs = parseInt(matchDuration) * 60 * 1000;

    // Pair participants
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1] || null; // BYE if odd

      matches.push({
        p1,
        p2,
        time: new Date(currentTime)
      });

      currentTime = new Date(currentTime.getTime() + durationMs);
    }

    setGeneratedMatches(matches);
    toast.success(`Generated ${matches.length} matches`);
  };

  const saveMatches = async () => {
    if (generatedMatches.length === 0) {
      toast.error("Generate the draw first");
      return;
    }

    if (!selectedVenue) {
      toast.error("Please select a venue");
      return;
    }

    setGenerating(true);

    try {
      const sport = sports.find((s) => s.id === selectedSport);
      const venue = venues.find((v) => v.id === selectedVenue);

      const matchRecords = generatedMatches.map((match) => ({
        sport_id: selectedSport,
        round_no: parseInt(roundNumber),
        participant1_type: match.p1?.type || "bye",
        participant1_id: match.p1?.id || null,
        participant2_type: match.p2?.type || "bye",
        participant2_id: match.p2?.id || null,
        match_datetime: match.time.toISOString(),
        venue: venue?.name || "TBD",
        published: false
      }));

      const { error } = await supabase.
      from("matches").
      insert(matchRecords);

      if (error) throw error;

      toast.success("Matches saved successfully!");
      setGeneratedMatches([]);

      // Refresh matches
      const { data } = await supabase.
      from("matches").
      select("*").
      eq("is_deleted", false).
      order("match_datetime");
      if (data) setExistingMatches(data);

    } catch (error) {
      toast.error(error.message || "Failed to save matches");
    } finally {
      setGenerating(false);
    }
  };

  const togglePublish = async (matchId, currentStatus) => {
    try {
      const { error } = await supabase.
      from("matches").
      update({ published: !currentStatus }).
      eq("id", matchId);

      if (error) throw error;

      toast.success(currentStatus ? "Match unpublished" : "Match published");

      const { data } = await supabase.
      from("matches").
      select("*").
      eq("is_deleted", false).
      order("match_datetime");
      if (data) setExistingMatches(data);
    } catch (error) {
      toast.error("Failed to update match");
    }
  };

  const publishAll = async (sportId, roundNo) => {
    try {
      const { error } = await supabase.
      from("matches").
      update({ published: true }).
      eq("sport_id", sportId).
      eq("round_no", roundNo).
      eq("is_deleted", false);

      if (error) throw error;
      toast.success("All matches published");

      const { data } = await supabase.
      from("matches").
      select("*").
      eq("is_deleted", false).
      order("match_datetime");
      if (data) setExistingMatches(data);
    } catch (error) {
      toast.error("Failed to publish matches");
    }
  };

  const deleteRound = async (sportId, roundNo) => {
    try {
      const { error } = await supabase.
      from("matches").
      update({ is_deleted: true }).
      eq("sport_id", sportId).
      eq("round_no", roundNo);

      if (error) throw error;
      toast.success("Round deleted");

      const { data } = await supabase.
      from("matches").
      select("*").
      eq("is_deleted", false).
      order("match_datetime");
      if (data) setExistingMatches(data);
    } catch (error) {
      toast.error("Failed to delete round");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>);

  }

  const sportMatches = existingMatches.filter((m) =>
  selectedSport ? m.sport_id === selectedSport : true
  );

  const matchesByRound = sportMatches.reduce((acc, match) => {
    const key = match.round_no;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Draw Generator</h1>
        <p className="text-muted-foreground">Create match schedules and tie sheets</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Generate New Draw
            </CardTitle>
            <CardDescription>
              Select participants and generate randomized match pairings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select value={selectedSport} onValueChange={handleSportChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) =>
                    <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Venue</Label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) =>
                    <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} />
                
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)} />
                
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min="10"
                  value={matchDuration}
                  onChange={(e) => setMatchDuration(e.target.value)} />
                
              </div>
            </div>

            <div className="space-y-2">
              <Label>Round Number</Label>
              <Select value={roundNumber} onValueChange={setRoundNumber}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Round 1</SelectItem>
                  <SelectItem value="2">Round 2</SelectItem>
                  <SelectItem value="3">Quarter Finals</SelectItem>
                  <SelectItem value="4">Semi Finals</SelectItem>
                  <SelectItem value="5">Finals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Participants Selection */}
            {selectedSport &&
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Participants ({selectedParticipants.size}/{participants.length})</Label>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                    <Button variant="ghost" size="sm" onClick={deselectAll}>Clear</Button>
                  </div>
                </div>
                
                {loadingParticipants ?
              <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div> :
              participants.length === 0 ?
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg text-center">
                    No approved participants for this sport
                  </p> :

              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {participants.map((participant) =>
                <label
                  key={participant.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer">
                  
                        <Checkbox
                    checked={selectedParticipants.has(participant.id)}
                    onCheckedChange={() => toggleParticipant(participant.id)} />
                  
                        <span className="text-sm">{participant.name}</span>
                      </label>
                )}
                  </div>
              }
              </div>
            }

            <Button
              onClick={generateDraw}
              disabled={selectedParticipants.size < 2 || !startDate}
              className="w-full gap-2">
              
              <Shuffle className="h-4 w-4" />
              Generate Draw
            </Button>

            {/* Generated Preview */}
            {generatedMatches.length > 0 &&
            <div className="space-y-3 pt-4 border-t">
                <Label>Preview ({generatedMatches.length} matches)</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {generatedMatches.map((match, index) =>
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{match.p1?.name}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className={`font-medium ${!match.p2 ? "italic text-muted-foreground" : ""}`}>
                          {match.p2?.name || "BYE"}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {format(match.time, "hh:mm a")}
                      </div>
                    </div>
                )}
                </div>
                <Button onClick={saveMatches} disabled={generating} className="w-full gap-2">
                  {generating ?
                <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </> :

                <>
                      <CheckCircle className="h-4 w-4" />
                      Save Matches
                    </>
                }
                </Button>
              </div>
            }
          </CardContent>
        </Card>

        {/* Existing Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Existing Matches
            </CardTitle>
            <CardDescription>
              Manage and publish generated draws
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sportMatches.length === 0 ?
            <div className="text-center text-muted-foreground py-8">
                {selectedSport ? "No matches generated for this sport" : "Select a sport to view matches"}
              </div> :

            <div className="space-y-6">
                {Object.entries(matchesByRound).map(([round, matches]) => {
                const allPublished = matches.every((m) => m.published);
                const roundLabels = {
                  "1": "Round 1", "2": "Round 2", "3": "Quarter Finals",
                  "4": "Semi Finals", "5": "Finals"
                };

                return (
                  <div key={round} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{roundLabels[round] || `Round ${round}`}</h4>
                        <div className="flex gap-2">
                          {!allPublished &&
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => publishAll(matches[0].sport_id, parseInt(round))}>
                          
                              <Eye className="h-4 w-4 mr-1" />
                              Publish All
                            </Button>
                        }
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Round?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will soft-delete all matches in this round.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => deleteRound(matches[0].sport_id, parseInt(round))}
                                className="bg-destructive text-destructive-foreground">
                                
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {matches.map((match) => {
                        const getParticipantName = (type, id) => {
                          if (type === "bye" || !id) return "BYE";
                          const participant = participants.find((p) => p.id === id);
                          return participant?.name || "Unknown";
                        };

                        return (
                          <div key={match.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{getParticipantName(match.participant1_type, match.participant1_id)}</span>
                                  <span className="text-muted-foreground">vs</span>
                                  <span className={match.participant2_type === "bye" ? "italic text-muted-foreground" : ""}>
                                    {getParticipantName(match.participant2_type, match.participant2_id)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(match.match_datetime), "MMM dd, hh:mm a")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {match.venue}
                                  </span>
                                </div>
                              </div>
                              <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublish(match.id, match.published)}>
                              
                                {match.published ?
                              <Eye className="h-4 w-4 text-success" /> :

                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                              }
                              </Button>
                            </div>);

                      })}
                      </div>
                    </div>);

              })}
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </div>);

}