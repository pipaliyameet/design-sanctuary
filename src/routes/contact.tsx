import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { submitEnquiry } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Start an Interior Design Project | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Tell us about your space, city and budget band. Atelier Vermilion replies to every enquiry within two working days.",
      },
      { property: "og:title", content: "Contact — Atelier Vermilion" },
      { property: "og:description", content: "Start an interior design enquiry with the studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SPACES = ["Apartment", "Villa", "Penthouse", "Office", "Hospitality", "Retail", "Other"];
const BUDGETS = ["Under ₹25L", "₹25L – ₹75L", "₹75L – ₹1.5Cr", "₹1.5Cr – ₹3Cr", "Above ₹3Cr"];

function Contact() {
  const send = useServerFn(submitEnquiry);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    space_type: "",
    budget_band: "",
    message: "",
  });
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => send({ data: form }),
    onSuccess: () => {
      setDone(true);
      toast.success("Enquiry received — we'll be in touch within two working days.");
    },
    onError: () => toast.error("Please check the form and try again."),
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Contact"
        title="Start a project."
        intro="Share the brief, the city and a rough budget band. Every enquiry is read by a senior designer."
      />

      <section className="mx-auto grid max-w-[1400px] gap-16 px-5 py-16 pb-24 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        {done ? (
          <div className="border border-border bg-card p-10">
            <h2 className="text-3xl">Thank you — your enquiry is with us.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A senior designer will reply within two working days. If it's urgent, call
              +91 98200 41100.
            </p>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                  placeholder="Aarav Mehta"
                />
              </Field>
              <Field label="Email" required>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="+91 98200 00000"
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => set("city")(e.target.value)}
                  placeholder="Mumbai"
                />
              </Field>
            </div>

            <div>
              <Label className="eyebrow">Type of space</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {SPACES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("space_type")(s)}
                    className={
                      form.space_type === s
                        ? "border border-accent bg-accent px-3 py-1.5 text-xs text-accent-foreground"
                        : "border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/40"
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="eyebrow">Budget band</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("budget_band")(b)}
                    className={
                      form.budget_band === b
                        ? "border border-accent bg-accent px-3 py-1.5 text-xs text-accent-foreground"
                        : "border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/40"
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <Field label="About the project">
              <Textarea
                rows={5}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                placeholder="Carpet area, rooms in scope, timelines, anything you already know you want."
              />
            </Field>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="px-8 py-6 text-xs tracking-[0.2em] uppercase"
            >
              {mutation.isPending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        )}

        <aside className="space-y-8 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          <div>
            <p className="eyebrow">Studio</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              studio@ateliervermilion.example
              <br />
              +91 98200 41100
              <br />
              Mumbai · Bengaluru
            </p>
          </div>
          <div>
            <p className="eyebrow">Working hours</p>
            <p className="mt-3 text-sm text-muted-foreground">Monday – Saturday, 10am – 7pm IST</p>
          </div>
          <div>
            <p className="eyebrow">Already a client?</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in to your portal for approvals, documents and payment status.
            </p>
          </div>
        </aside>
      </section>
    </PublicShell>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="eyebrow">
        {label}
        {required ? " *" : ""}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
