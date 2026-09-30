import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser, signupUser, getMySession } from "@/lib/session.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Atelier Vermilion Studio & Client Portal" },
      {
        name: "description",
        content:
          "Sign in to the Atelier Vermilion studio workspace or client portal to track designs, approvals, documents and payments.",
      },
      { property: "og:title", content: "Sign in — Atelier Vermilion" },
      { property: "og:description", content: "Studio workspace and client portal access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchLogin = useServerFn(loginUser);
  const fetchSignup = useServerFn(signupUser);
  const fetchSession = useServerFn(getMySession);

  useEffect(() => {
    fetchSession()
      .then((session) => {
        if (session) {
          if (session.isStaff) {
            navigate({ to: "/studio" });
          } else if (session.roles.includes("client")) {
            navigate({ to: "/portal" });
          } else {
            navigate({ to: "/" });
          }
        }
      })
      .catch(() => {
        // Not logged in
      });
  }, [navigate, fetchSession]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await fetchSignup({
          data: {
            email,
            password,
            fullName,
          },
        });
        if (!res.success) throw new Error("Registration failed.");
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success("Account created successfully. Welcome to Atelier Vermilion!");
        if (res.session.isStaff) {
          navigate({ to: "/studio" });
        } else {
          navigate({ to: "/portal" });
        }
      } else {
        const res = await fetchLogin({
          data: {
            email,
            password,
          },
        });
        if (!res.success) throw new Error("Invalid credentials.");
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success("Signed in successfully.");
        if (res.session.isStaff) {
          navigate({ to: "/studio" });
        } else if (res.session.roles.includes("client")) {
          navigate({ to: "/portal" });
        } else {
          navigate({ to: "/" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-[1400px] gap-16 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">Portal access</p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Clients see progress, design sets, approvals, documents and payment status. Studio team
            members reach the full workspace.
          </p>

          <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-5">
            {mode === "signup" && (
              <div>
                <Label className="eyebrow">Full name</Label>
                <Input
                  className="mt-2"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label className="eyebrow">Email</Label>
              <Input
                className="mt-2"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="eyebrow">Password</Label>
              <Input
                className="mt-2"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full py-6 text-xs tracking-[0.2em] uppercase cursor-pointer"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-muted-foreground hover:text-accent block text-center w-full cursor-pointer"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>

        <DriveImage
          src={GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1Xl45R4J6Rvhq8m7kL_wK3Wb1Z0d17_0_"}
          alt="A calm sunlit interior with stone flooring and oak joinery"
          className="aspect-[4/5] w-full object-cover"
          wrapperClassName="hidden aspect-[4/5] w-full overflow-hidden lg:block"
        />
      </section>
    </PublicShell>
  );
}
