import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Trophy, Search, Users, User } from "lucide-react";
import { format } from "date-fns";














export default function TieSheetsPage() {
  const [sports, setSports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sportsRes, matchesRes] = await Promise.all([
          api.get("/admin/sports"),
          api.get("/participant/tie-sheet")
        ]);

        setSports(sportsRes.data || []);

        // Matches are already enriched by the backend
        const enriched = (matchesRes.data || []).map(match => ({
          ...match,
          participant1_name: match.p1_name,
          participant2_name: match.p2_name,
          sport_name: match.sport_name,
          sport_type: match.sport_type || 'team'
        }));
        setMatches(enriched);
      } catch (err) {
        toast.error("Failed to load tie sheets");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMatches = matches.filter((match) => {
    const matchesSport = selectedSport === "all" || match.sport_id === selectedSport;
    const matchesDate = !searchDate || format(new Date(match.match_datetime), "yyyy-MM-dd") === searchDate;
    return matchesSport && matchesDate;
  });

  const groupedByRound = filteredMatches.reduce((acc, match) => {
    const key = `Round ${match.round_no}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) =>
            <Skeleton key={i} className="h-24 w-full" />
          )}
        </div>
      </div>);

  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Tie Sheets</h1>
            <p className="text-muted-foreground">View upcoming matches and schedules</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-full sm:w-64">
            <Trophy className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports.map((sport) =>
              <SelectItem key={sport.id} value={sport.id}>
                {sport.name}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="pl-10"
            placeholder="Filter by date" />

        </div>

        {searchDate &&
          <button
            onClick={() => setSearchDate("")}
            className="text-sm text-muted-foreground hover:text-foreground">

            Clear date
          </button>
        }
      </div>

      {/* Matches */}
      {filteredMatches.length === 0 ?
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Matches Published Yet</h3>
          <p className="text-muted-foreground">
            The admin will publish match schedules soon. Check back later!
          </p>
        </Card> :

        <div className="space-y-8">
          {Object.entries(groupedByRound).map(([round, roundMatches]) =>
            <div key={round}>
              <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {round}
                </Badge>
                <span className="text-muted-foreground text-sm font-normal">
                  {roundMatches.length} match{roundMatches.length !== 1 ? "es" : ""}
                </span>
              </h2>

              <div className="grid gap-4">
                {roundMatches.map((match) =>
                  <Card key={match.id} className="overflow-hidden hover:shadow-soft transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Match Info */}
                        <div className="flex-1 p-4 lg:p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="gap-1">
                              {match.sport_type === "team" ?
                                <Users className="h-3 w-3" /> :

                                <User className="h-3 w-3" />
                              }
                              {match.sport_name}
                            </Badge>
                          </div>

                          {/* Participants */}
                          <div className="flex items-center justify-center gap-4 lg:gap-8">
                            <div className="flex-1 text-center">
                              <div className={`font-semibold text-lg ${match.participant1_type === "bye" ? "text-muted-foreground italic" : ""}`}>
                                {match.participant1_name}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-display font-bold text-muted-foreground">
                                VS
                              </div>
                            </div>

                            <div className="flex-1 text-center">
                              <div className={`font-semibold text-lg ${match.participant2_type === "bye" ? "text-muted-foreground italic" : ""}`}>
                                {match.participant2_name}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="lg:w-64 bg-muted/30 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l">
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(match.match_datetime), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(match.match_datetime), "hh:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2 lg:col-span-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{match.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      }
    </div>);

}