import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicShell } from "@/components/site/PublicShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
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
              className="w-full py-6 text-xs tracking-[0.2em] uppercase"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-muted-foreground hover:text-accent"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>

        <img
          src="/portfolio/p3.jpg"
          alt="A calm sunlit interior with stone flooring and oak joinery"
          className="hidden aspect-[4/5] w-full object-cover lg:block"
        />
      </section>
    </PublicShell>
  );
}
