import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, User, ArrowRight, CheckCircle, XCircle } from "lucide-react";




export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data } = await api.get("/admin/sports");
        setSports(data || []);
      } catch (err) {
        toast.error("Failed to load sports");
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  const getSportIcon = (type) => {
    return type === "team" ? Users : User;
  };

  const getSportColor = (name) => {
    const colors = {
      football: "bg-emerald-500",
      basketball: "bg-orange-500",
      badminton: "bg-blue-500",
      volleyball: "bg-purple-500",
      chess: "bg-gray-700",
      "table tennis": "bg-red-500"
    };
    return colors[name.toLowerCase()] || "bg-primary";
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) =>
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>);

  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center text-white">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Available Sports</h1>
            <p className="text-muted-foreground">Choose a sport to register for the tournament</p>
          </div>
        </div>
      </div>

      {/* Sports Grid */}
      {sports.length === 0 ?
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Sports Available</h3>
          <p className="text-muted-foreground">Check back later for upcoming tournaments.</p>
        </Card> :

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => {
            const Icon = getSportIcon(sport.type);
            return (
              <Card key={sport.id} className="card-hover overflow-hidden group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-xl ${getSportColor(sport.name)} flex items-center justify-center text-white`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <Badge variant={sport.registration_open ? "default" : "secondary"}>
                      {sport.registration_open ?
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Open
                        </span> :

                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Closed
                        </span>
                      }
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mt-4">{sport.name}</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon className="h-4 w-4" />
                      {sport.type === "team" ? "Team" : "Individual"}
                    </span>
                    <span>•</span>
                    <span>Max {sport.max_players} players</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to={`/register?sport=${sport.id}`} className="w-full">
                    <Button
                      className="w-full gap-2 group-hover:shadow-glow transition-all"
                      disabled={!sport.registration_open}>

                      {sport.registration_open ?
                        <>
                          Register Now
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </> :

                        "Registration Closed"
                      }
                    </Button>
                  </Link>
                </CardFooter>
              </Card>);

          })}
        </div>
      }
    </div>);

}