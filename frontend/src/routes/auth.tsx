import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser } from "@/lib/session.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/studio",
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Studio Access & Login — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Authentication portal for Right Angle Design Studio. Access project control, client portal, and design vault.",
      },
      { property: "og:title", content: "Studio Access & Login — Right Angle Design Studio" },
      { property: "og:description", content: "Bespoke interior architecture command portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const targetRedirect = search.redirect || "/studio";
  const queryClient = useQueryClient();

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setBusy(true);

    try {
      const res = await loginUser({
        data: {
          email: email.trim().toLowerCase(),
          password,
        },
      });

      if (!res.success) {
        throw new Error("Incorrect email address or password. Please try again.");
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate({ to: targetRedirect });
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Incorrect email or password. Please verify your credentials and try again.";
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-12 overflow-hidden rounded-xl border border-border/80 shadow-2xl bg-card">
          
          {/* Left Column: Pure Luxury Login Form */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-card">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-6 border-b border-border/60">
                <Link to="/" className="inline-block transition-opacity hover:opacity-80">
                  <BrandLogo variant="horizontal" size="sm" />
                </Link>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 border border-accent/20">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  Studio Command
                </div>
              </div>

              {/* Form Title */}
              <div className="mt-8">
                <h1 className="text-xl sm:text-2xl font-display font-light text-foreground tracking-tight">
                  Sign In to Studio Portal
                </h1>
                <p className="mt-1.5 text-xs text-muted-foreground font-light leading-relaxed">
                  Enter your verified credentials to access projects, media assets, and executive workflows.
                </p>
              </div>

              {/* Form Render */}
              <form onSubmit={onLogin} className="mt-6 space-y-4">
                <div>
                  <Label className="eyebrow flex items-center gap-1.5 text-[11px] text-foreground/80 mb-1.5">
                    <Mail className="size-3 text-accent" />
                    Email Address
                  </Label>
                  <Input
                    className="h-10 text-sm bg-background border-border/80 focus-visible:ring-accent transition-all"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@rightangle.design"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                  />
                </div>

                <div>
                  <Label className="eyebrow flex items-center gap-1.5 text-[11px] text-foreground/80 mb-1.5">
                    <Lock className="size-3 text-accent" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      className="h-10 pr-10 text-sm bg-background border-border/80 focus-visible:ring-accent transition-all"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-accent" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3 text-xs rounded border border-destructive/40 bg-destructive/10 text-destructive animate-in fade-in duration-200"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 text-xs tracking-[0.18em] uppercase cursor-pointer bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-semibold shadow-md flex items-center justify-center gap-2 mt-4"
                >
                  {busy ? (
                    "Authenticating…"
                  ) : (
                    <>
                      <span>Authenticate & Sign In</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Bottom Security Footer */}
            <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-accent shrink-0" />
                <span>256-Bit SSL Encrypted JWT Session</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/70">v2.4 Production</span>
            </div>
          </div>

          {/* Right Column: Architectural Visual Sanctuary */}
          <div className="lg:col-span-6 relative hidden lg:block bg-secondary/20 min-h-[560px]">
            <DriveImage
              src={GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1Xl45R4J6Rvhq8m7kL_wK3Wb1Z0d17_0_"}
              alt="Right Angle Architectural Project"
              className="absolute inset-0 size-full object-cover"
              wrapperClassName="size-full"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-1.5">
                <Building2 className="size-3.5" />
                <span>Right Angle Design Studio</span>
              </div>
              <p className="font-display text-lg font-light leading-snug">
                Bespoke Interior Architecture & Project Command
              </p>
              <p className="text-xs text-white/70 font-light mt-1">
                Restricted access for certified studio architects, partners, and authorized client representatives.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PublicShell>
  );
}
