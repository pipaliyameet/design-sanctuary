import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser, loginWithGoogle, directAdminLogin, getMySession } from "@/lib/session.functions";
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
  Loader2,
  Zap,
} from "lucide-react";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: (search.redirect as string) || undefined,
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
  const queryClient = useQueryClient();

  // Login Form State pre-populated with official studio admin credentials
  const [email, setEmail] = useState("rightangle011@gmail.com");
  const [password, setPassword] = useState("Admin@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function getSafeDestination(): string {
    const raw = search.redirect;
    if (!raw || raw === "/" || raw === "/auth" || raw === "/login" || raw === "/studio") {
      return "/studio/media";
    }
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const u = new URL(raw);
        return u.pathname === "/" || u.pathname === "/auth" || u.pathname === "/studio" ? "/studio/media" : u.pathname;
      } catch {
        return "/studio/media";
      }
    }
    return raw;
  }

  function goToDestination() {
    const dest = getSafeDestination();
    try {
      navigate({ to: dest as any });
    } catch {
      window.location.href = dest;
    }
  }

  useEffect(() => {
    getMySession().then((session) => {
      if (session && session.email) {
        goToDestination();
      }
    });
  }, []);

  async function handleDirectAdminClick() {
    setErrorMessage(null);
    setBusy(true);

    try {
      const res = await directAdminLogin();
      if (!res.success) {
        throw new Error("Could not log in as administrator.");
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });
      goToDestination();
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Direct admin access could not be established. Please try using the login form.";
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  }

  // Google Identity Services (GIS) integration
  useEffect(() => {
    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      "598456381509-vp9b3a5go2sqd19js8avi55tnk7ec8ui.apps.googleusercontent.com";

    function onCredentialResponse(response: any) {
      if (!response?.credential) return;
      handleGoogleLogin({ credential: response.credential });
    }

    const initGsi = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: onCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const container = document.getElementById("gsi-button-mount");
          if (container) {
            container.innerHTML = "";
            (window as any).google.accounts.id.renderButton(container, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: container.offsetWidth > 100 ? container.offsetWidth : 320,
            });
          }
        } catch (e) {
          console.warn("GIS initialization notice:", e);
        }
      }
    };

    if (typeof window !== "undefined") {
      if ((window as any).google?.accounts?.id) {
        initGsi();
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGsi();
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  // Listen for OAuth hash redirect tokens (e.g. from direct Google OAuth flow)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setGoogleLoading(true);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((r) => r.json())
          .then(async (googleUser) => {
            if (googleUser?.email) {
              await handleGoogleLogin({
                token: accessToken,
                email: googleUser.email,
                name: googleUser.name,
              });
              window.history.replaceState(null, "", window.location.pathname);
            }
          })
          .catch(() => {
            setErrorMessage("Google authorization could not be completed. Please try again.");
          })
          .finally(() => setGoogleLoading(false));
      }
    }
  }, [navigate, targetRedirect]);

  async function handleGoogleLogin(payload: { credential?: string; token?: string; email?: string; name?: string }) {
    setErrorMessage(null);
    setGoogleLoading(true);
    setBusy(true);

    try {
      const res = await loginWithGoogle({ data: payload });

      if (!res.success) {
        throw new Error("Could not sign in with Google. Please try again.");
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });
      goToDestination();
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Google authentication failed. Please try again or use your password.";
      setErrorMessage(message);
    } finally {
      setGoogleLoading(false);
      setBusy(false);
    }
  }

  function handleCustomGoogleClick() {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is blocked or dismissed, launch Google OAuth popup/redirect
          launchDirectGoogleOAuth();
        }
      });
    } else {
      launchDirectGoogleOAuth();
    }
  }

  function launchDirectGoogleOAuth() {
    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      "598456381509-vp9b3a5go2sqd19js8avi55tnk7ec8ui.apps.googleusercontent.com";
    const redirectUri = window.location.origin + "/auth";
    const scope = "email profile openid";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = authUrl;
  }

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
      goToDestination();
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
                <span className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground font-medium">
                  Studio Portal
                </span>
              </div>

              {/* Form Title */}
              <div className="mt-8">
                <h1 className="text-xl sm:text-2xl font-display font-normal text-foreground tracking-tight">
                  Sign In to Studio Portal
                </h1>
                <p className="mt-2 text-sm text-foreground/85 font-normal leading-relaxed">
                  Enter your verified credentials to access projects, media assets, and executive workflows.
                </p>
              </div>

              {/* 1-Click Direct Admin Access Card */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-stone-900 to-stone-950 text-white border border-stone-800 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                      <Zap className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>1-Click Owner & Admin Access</span>
                    </div>
                    <p className="mt-1 font-display text-base font-medium text-white truncate">
                      Ravi Pipaliya (Principal Architect)
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono truncate">
                      rightangle011@gmail.com
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleDirectAdminClick}
                    disabled={busy || googleLoading}
                    className="shrink-0 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider h-9 px-3.5 rounded shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open Admin</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Google Authentication */}
              <div className="mt-6 space-y-3">
                <div id="gsi-button-mount" className="w-full flex justify-center min-h-[44px]" />

                <button
                  type="button"
                  onClick={handleCustomGoogleClick}
                  disabled={busy || googleLoading}
                  className="w-full h-11 flex items-center justify-center gap-3 px-4 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-sans text-xs sm:text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-400 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="size-4 animate-spin text-accent" />
                  ) : (
                    <GoogleIcon className="size-4.5 shrink-0" />
                  )}
                  <span>{googleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
                </button>

                <div className="relative flex items-center justify-center pt-2">
                  <div className="border-t border-border/80 w-full" />
                  <span className="bg-card px-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
                    Or sign in with email
                  </span>
                  <div className="border-t border-border/80 w-full" />
                </div>
              </div>

              {/* Form Render */}
              <form onSubmit={onLogin} className="mt-4 space-y-4">
                <div>
                  <Label className="eyebrow flex items-center gap-1.5 text-xs sm:text-sm text-foreground font-semibold mb-1.5">
                    <Mail className="size-3.5 text-accent" />
                    Email Address
                  </Label>
                  <Input
                    className="h-11 text-sm bg-background border-border/80 text-foreground placeholder:text-foreground/50 focus-visible:ring-accent transition-all"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="rightangle011@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                  />
                </div>

                <div>
                  <Label className="eyebrow flex items-center gap-1.5 text-xs sm:text-sm text-foreground font-semibold mb-1.5">
                    <Lock className="size-3.5 text-accent" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      className="h-11 pr-10 text-sm bg-background border-border/80 text-foreground placeholder:text-foreground/50 focus-visible:ring-accent transition-all"
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-accent" />
                      ) : (
                        <Eye className="size-4 text-foreground/60" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3 text-sm rounded border border-destructive/40 bg-destructive/10 text-destructive animate-in fade-in duration-200"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 text-xs sm:text-sm tracking-[0.08em] uppercase cursor-pointer bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-semibold shadow-md flex items-center justify-center gap-2 mt-4"
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
            <div className="mt-8 pt-4 border-t border-border/70 flex items-center justify-between text-xs sm:text-sm text-foreground/80 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-accent shrink-0" />
                <span>256-Bit SSL Encrypted JWT Session</span>
              </div>
              <span className="font-mono text-xs text-foreground/75 font-semibold">v2.4 Production</span>
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
            
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-amber-300 font-semibold mb-1.5 drop-shadow-xs">
                <Building2 className="size-3.5" />
                <span>Right Angle Design Studio</span>
              </div>
              <p className="font-display text-xl font-normal leading-snug drop-shadow-xs">
                Bespoke Interior Architecture & Project Command
              </p>
              <p className="text-sm text-white/95 font-normal mt-1.5 drop-shadow-xs leading-relaxed">
                Restricted access for certified studio architects, partners, and authorized client representatives.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PublicShell>
  );
}
