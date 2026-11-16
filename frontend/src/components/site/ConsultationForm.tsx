import { useState } from "react";
import { ArrowRight, CheckCircle2, Send, MessageSquare, AlertCircle } from "lucide-react";
import { submitEnquiry, STUDIO_DETAILS } from "@/lib/public.functions";
import { WhatsAppIcon } from "./PublicShell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConsultationFormProps {
  initialProjectType?: string;
  className?: string;
}

export function ConsultationForm({ className }: ConsultationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact: "", // Phone Number or Email
    city: "Jetpur",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Please enter your full name.";
    }

    const contactVal = formData.contact.trim();
    const isEmail = contactVal.includes("@") && contactVal.includes(".");
    const digitsOnly = contactVal.replace(/\D/g, "");
    const isPhone = digitsOnly.length >= 7;

    if (!contactVal) {
      errs.contact = "Please provide your phone number or email address.";
    } else if (!isEmail && !isPhone) {
      errs.contact = "Please enter a valid phone number (e.g. +91 98765 43210) or email address.";
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errs.message = "Please briefly describe your space or requirements.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const contactVal = formData.contact.trim();
      const isEmail = contactVal.includes("@");
      
      const payload = {
        name: formData.name.trim(),
        contact: contactVal,
        email: isEmail ? contactVal : "",
        phone: !isEmail ? contactVal : "",
        city: formData.city,
        notes: `[Location: ${formData.city}] ${formData.message.trim()}`,
        message: formData.message.trim(),
      };

      await submitEnquiry({ data: payload });
      setSubmittedData({ name: formData.name.trim() });
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to Ravi Pipaliya and the studio team.");
    } catch (err: any) {
      console.error("Enquiry submission error:", err);
      toast.error("Could not send enquiry right now. Please message us on WhatsApp or call.");
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = () => {
    const nameStr = submittedData?.name || formData.name || "Client";
    const msgStr = formData.message ? `• Requirements: ${formData.message}` : "";
    const text = `Hello Right Angle Design Studio,\n\nI have submitted an inquiry:\n• Name: ${nameStr}\n${msgStr}\n\nLooking forward to connecting with Ravi Pipaliya and the design team.`;
    return `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  if (submitted) {
    return (
      <div className={cn("rounded-lg border border-border/90 bg-card p-6 sm:p-10 shadow-sm animate-in fade-in duration-300", className)}>
        <div className="mx-auto max-w-lg text-center py-6">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-7" />
          </div>

          <h3 className="mt-5 font-display text-2xl sm:text-3xl text-foreground font-normal">
            Message Received
          </h3>

          <p className="mt-3 text-sm sm:text-base text-foreground/85 leading-relaxed font-normal">
            Thank you, <strong className="text-foreground font-semibold">{submittedData?.name}</strong>. Ravi Pipaliya and our senior design team have received your details. We will connect with you shortly.
          </p>

          <div className="mt-6 rounded-md bg-muted/40 border border-border/80 p-4 text-xs sm:text-sm text-foreground/80 text-center">
            <p className="text-foreground/80">
              Response timeframe: Within 24 business hours.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs sm:text-sm font-semibold tracking-[0.06em] shadow-sm transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="size-4" />
              <span>Connect Faster on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "",
                  contact: "",
                  message: "",
                });
                setSubmittedData(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded border border-border bg-background px-5 py-3 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border/90 bg-card p-6 sm:p-8 lg:p-10 shadow-sm", className)}>
      <div className="mb-6 pb-5 border-b border-border/70">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.08em] font-semibold text-accent font-mono">
            Direct Studio Inquiry
          </p>
          <span className="text-xs text-foreground/60 font-medium">Confidential</span>
        </div>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl font-normal text-foreground">
          Send an Architectural Brief
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
          Share your essential project parameters and our team will get in touch promptly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Field 1: Full Name */}
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs uppercase tracking-[0.06em] font-semibold text-foreground mb-1.5"
          >
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className={cn(
              "w-full rounded border bg-background px-4 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:outline-none",
              errors.name ? "border-destructive focus:border-destructive" : "border-border/80",
            )}
          />
          {errors.name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="size-3 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Field 2: Phone Number or Email */}
        <div>
          <label
            htmlFor="contact-detail"
            className="block text-xs uppercase tracking-[0.06em] font-semibold text-foreground mb-1.5"
          >
            Phone Number or Email <span className="text-destructive">*</span>
          </label>
          <input
            id="contact-detail"
            type="text"
            name="contact"
            required
            autoComplete="email tel"
            value={formData.contact}
            onChange={handleChange}
            placeholder="+91 98765 43210 or name@example.com"
            className={cn(
              "w-full rounded border bg-background px-4 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:outline-none",
              errors.contact ? "border-destructive focus:border-destructive" : "border-border/80",
            )}
          />
          {errors.contact ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="size-3 shrink-0" />
              <span>{errors.contact}</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-foreground/60 font-normal">
              We respect your privacy. No marketing spam, ever.
            </p>
          )}
        </div>

        {/* Field 3 & 4: Preferred Studio / Location and Message (In One Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label
              htmlFor="contact-city"
              className="block text-xs uppercase tracking-[0.06em] font-semibold text-foreground mb-1.5"
            >
              Preferred Studio / Location
            </label>
            <select
              id="contact-city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded border border-border/80 bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
            >
              <option value="Jetpur">Jetpur (HQ Studio)</option>
              <option value="Rajkot">Rajkot (Design Studio)</option>
              <option value="Ahmedabad">Ahmedabad (On-Site Booking)</option>
              <option value="Other Gujarat">Other Gujarat City</option>
              <option value="Pan-India">Pan-India Commission</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs uppercase tracking-[0.06em] font-semibold text-foreground mb-1.5"
            >
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={3}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about the space (e.g. 4BHK apartment, villa), target possession date, or design vision..."
              className={cn(
                "w-full rounded border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:outline-none resize-none leading-relaxed",
                errors.message ? "border-destructive focus:border-destructive" : "border-border/80",
              )}
            />
            {errors.message && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive font-medium">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Button & Reassurance */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-foreground px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span>Sending Brief…</span>
            ) : (
              <>
                <span>Submit Inquiry</span>
                <Send className="size-3.5" />
              </>
            )}
          </button>

          <span className="text-xs text-foreground/70 font-medium text-center sm:text-right">
            Inquiries reviewed by senior partners
          </span>
        </div>
      </form>
    </div>
  );
}
