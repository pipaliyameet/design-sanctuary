import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser, signupUser, getMySession } from "@/lib/session.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import { Shield, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Owner Access — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Executive login to the Right Angle Design Studio command center, project controls, Google Drive vault, and finances.",
      },
      { property: "og:title", content: "Owner Access — Right Angle Design Studio" },
      { property: "og:description", content: "Executive studio command center access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("a@gmail.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMySession()
      .then((session) => {
        if (session) {
          navigate({ to: "/studio" });
        }
      })
      .catch(() => {
        // Not logged in
      });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await signupUser({
          data: {
            email: email.trim().toLowerCase(),
            password,
            fullName: fullName.trim() || "Studio Principal",
            role: "admin",
            title: "Studio Owner & Principal",
          },
        });
        if (!res.success) throw new Error("Registration failed.");
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success("Owner account created successfully. Welcome to Right Angle Studio!");
        navigate({ to: "/studio" });
      } else {
        const res = await loginUser({
          data: {
            email: email.trim().toLowerCase(),
            password,
          },
        });
        if (!res.success) throw new Error("Invalid credentials.");
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success("Signed in successfully. Welcome back to Owner Panel!");
        navigate({ to: "/studio" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  const fillOwnerCredentials = () => {
    setMode("signin");
    setEmail("a@gmail.com");
    setPassword("password123");
    toast.info("Filled Owner credentials (a@gmail.com / password123)");
  };

  const fillPrincipalCredentials = () => {
    setMode("signin");
    setEmail("ira@ateliervermilion.com");
    setPassword("password123");
    toast.info("Filled Principal credentials (ira@ateliervermilion.com / password123)");
  };

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-[1400px] gap-16 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Studio Executive & Owner Command Center
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl font-display font-normal">
            {mode === "signin" ? "Owner Sign In." : "Register Owner Account."}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Full administrative access to client project management, live site camera feeds, Google Drive vault, finance sheets, and design approvals.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 p-4 rounded border border-accent/40 bg-accent/5 max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Quick One-Click Owner Access
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillOwnerCredentials}
                className="text-xs h-9 border-accent/40 bg-background hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 font-medium transition-all"
              >
                <Shield className="h-3.5 w-3.5 text-accent" />
                Fill Owner (a@gmail.com)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillPrincipalCredentials}
                className="text-xs h-9 border-border bg-background hover:border-accent flex items-center gap-1.5 font-medium transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                Fill Principal (Ira Kapoor)
              </Button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="eyebrow">Full name</Label>
                <Input
                  className="mt-1.5"
                  required
                  placeholder="e.g. Studio Principal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label className="eyebrow">Email address</Label>
              <Input
                className="mt-1.5"
                type="email"
                required
                placeholder="a@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="eyebrow">Password</Label>
              <Input
                className="mt-1.5"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full py-6 text-xs tracking-[0.2em] uppercase cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-md"
            >
              {busy ? "Authenticating…" : mode === "signin" ? "Sign in to Owner Panel" : "Create Owner Account"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-xs text-muted-foreground hover:text-accent block text-center w-full cursor-pointer transition-colors pt-2"
            >
              {mode === "signin"
                ? "Don't have an account yet? Register a new Owner Account"
                : "Already have an account? Sign in directly"}
            </button>
          </form>
        </div>

        <DriveImage
          src={GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1Xl45R4J6Rvhq8m7kL_wK3Wb1Z0d17_0_"}
          alt="A calm sunlit interior with stone flooring and oak joinery"
          className="aspect-[4/5] w-full object-cover rounded shadow-lg border border-border"
          wrapperClassName="hidden aspect-[4/5] w-full overflow-hidden lg:block"
        />
      </section>
    </PublicShell>
  );
}
