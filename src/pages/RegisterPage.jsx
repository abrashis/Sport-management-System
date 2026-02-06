import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, User, Plus, Trash2, Loader2, Mail, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const preselectedSport = searchParams.get("sport");

  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("form"); // form, otp, success

  // Form state
  const [selectedSport, setSelectedSport] = useState(preselectedSport || "");
  const [sportType, setSportType] = useState(null);

  // Authentication/Identity fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Registration specific fields
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { member_name: "", section: "", jersey_number: "" }
  ]);

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data } = await api.get("/admin/sports");
        const openSports = data.filter(s => s.registration_open);
        setSports(openSports);

        if (preselectedSport) {
          const sport = openSports.find(s => s.id == preselectedSport);
          if (sport) {
            setSelectedSport(sport.id.toString());
            setSportType(sport.type);
          }
        }
      } catch (err) {
        toast.error("Failed to load sports");
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, [preselectedSport]);

  const handleSportChange = (sportId) => {
    setSelectedSport(sportId);
    const sport = sports.find((s) => s.id.toString() === sportId);
    setSportType(sport?.type || null);
    setErrors({});
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { member_name: "", section: "", jersey_number: "" }]);
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const validateEmail = (email) => email.endsWith("@bicnepal.edu.np") || email.endsWith("@gmail.com");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Please use your official @bicnepal.edu.np or @gmail.com email address");
      return;
    }

    if (!selectedSport) {
      toast.error("Please select a sport");
      return;
    }

    setSubmitting(true);
    try {
      // Signup user first
      await api.post("/auth/signup", {
        full_name: fullName || (sportType === 'single' ? fullName : teamName),
        email,
        password: "DefaultPassword123!",
        confirm_password: "DefaultPassword123!"
      });

      setStep("otp");
      toast.info("Account created. Please verify your email with the code sent to " + email);
    } catch (err) {
      if (err.response?.data?.message?.includes("already registered")) {
        try {
          await api.post("/auth/request-login-otp", { email });
          setStep("otp");
          toast.info("Email already registered. Logging you in via OTP...");
        } catch (lErr) {
          toast.error(lErr.response?.data?.message || "Failed to proceed");
        }
      } else {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter a 6-digit code");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/login", { email, otp });

      const regData = sportType === 'team' ? {
        sport_id: selectedSport,
        type: 'team',
        team_name: teamName,
        captain_name: fullName,
        captain_email: email,
        captain_phone: phone,
        members: teamMembers
      } : {
        sport_id: selectedSport,
        type: 'single',
        player_name: fullName,
        phone: phone
      };

      await api.post("/participant/register", regData);

      setStep("success");
      toast.success("Tournament registration submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center p-8 border-2 shadow-soft">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2 text-foreground">Registration Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Your registration has been verified. The admin will review your application and notify you once approved.
          </p>
          <Button onClick={() => window.location.href = "/tie-sheets"}>
            View Tie Sheets
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="container py-12 max-w-md">
        <Card className="border-2 shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-display">Verify Your Email</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button onClick={handleVerifyOtp} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Complete"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Tournament Registration</h1>
        <p className="text-muted-foreground">Join the BIC Athletics season 2025</p>
      </div>

      <Card className="border-2 shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="sport">Select Sport *</Label>
              <Select value={selectedSport} onValueChange={handleSportChange}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Choose a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      <div className="flex items-center gap-2">
                        {sport.type === "team" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        {sport.name}
                        <span className="text-xs text-muted-foreground">({sport.type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sportType && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (@bicnepal.edu.np) *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@bicnepal.edu.np or gmail.com" required />
                </div>

                {sportType === "team" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name *</Label>
                      <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Team Members</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                          <Plus className="h-4 w-4 mr-1" /> Add Member
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                            <Input placeholder="Name" value={member.member_name} onChange={(e) => updateTeamMember(index, "member_name", e.target.value)} required />
                            <Input placeholder="Section" value={member.section} onChange={(e) => updateTeamMember(index, "section", e.target.value)} className="w-24" />
                            {teamMembers.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeTeamMember(index)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue to Verification"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}