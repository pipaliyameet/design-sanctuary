import { useState } from "react";
import { ArrowRight, MessageSquare, Phone, Mail, CheckCircle2 } from "lucide-react";
import { submitEnquiry, STUDIO_DETAILS } from "@/lib/public.functions";
import { toast } from "sonner";

interface ConsultationFormProps {
  initialProjectType?: string;
  className?: string;
}

export function ConsultationForm({ initialProjectType, className }: ConsultationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Mumbai",
    property_type: "Apartment / Penthouse",
    space_type: initialProjectType ?? "Full Interior Architecture",
    area_sqft: "",
    budget_band: "₹50 Lakhs – ₹1.5 Crore",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateWhatsAppLink = () => {
    const text = `Hello Atelier Vermilion Studio,\n\nI would like to inquire about a project:\n• Name: ${formData.name || "[Your Name]"}\n• City: ${formData.city}\n• Property Type: ${formData.property_type}\n• Scope: ${formData.space_type}\n• Approx Area: ${formData.area_sqft ? formData.area_sqft + " sq ft" : "Not specified"}\n• Budget Band: ${formData.budget_band}\n• Notes: ${formData.message || "Looking forward to speaking with a principal designer."}`;
    return `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitEnquiry({ data: formData });
      setSubmitted(true);
      toast.success("Thank you. A principal designer will review your brief within 48 hours.");
    } catch (err) {
      toast.error("Could not send enquiry right now. Please message us on WhatsApp or call.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className} id="consultation">
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left Column: Context & Direct Reach */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <p className="eyebrow">Consultation & Enquiries</p>
            <h2 className="mt-4 text-3xl font-display leading-[1.1] sm:text-5xl text-foreground">
              Have a space in mind?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We take on a limited number of residential and boutique commercial commissions each
              year to maintain personal design oversight on every site.
            </p>

            <div className="mt-10 space-y-6 border-t border-border pt-8 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center border border-border bg-secondary/30 text-accent">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Studio Direct</p>
                  <p className="text-muted-foreground">+91 98200 41100 · Mon – Sat (10am – 7pm)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center border border-border bg-secondary/30 text-accent">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Design Inquiries</p>
                  <p className="text-muted-foreground">studio@ateliervermilion.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center border border-border bg-secondary/30 text-accent">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Instant WhatsApp Consultation</p>
                  <p className="text-muted-foreground mb-2">
                    Prefer direct chat? Share brief parameters instantly with our design coordinator.
                  </p>
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent hover:underline"
                  >
                    Open WhatsApp Chat <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Offices in Lower Parel, Mumbai and Lavelle Road, Bengaluru. On-site commissions
              undertaken pan-India and internationally.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 bg-card/60 p-6 sm:p-10 border border-border/80">
          {submitted ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/20 text-accent">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="mt-6 font-display text-2xl sm:text-3xl text-foreground">
                Brief Received with Gratitude
              </h3>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you, {formData.name}. Our principal design team will review your project
                parameters and reach out via email and phone within two business days.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-accent bg-accent px-6 py-3 text-xs uppercase tracking-[0.2em] text-accent-foreground"
                >
                  Message On WhatsApp
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-secondary/40"
                >
                  Send Another Note
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Your Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ira Shah"
                    className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98200 00000"
                    className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    City / Project Location
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai, Bengaluru, Ahmedabad, etc."
                    className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full border border-border/80 bg-background px-3 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="Apartment / Penthouse">Apartment / Penthouse</option>
                    <option value="Independent Villa / Bungalow">Independent Villa</option>
                    <option value="Heritage Restoration">Heritage Restoration</option>
                    <option value="Boutique Hospitality / Restaurant">Hospitality / F&B</option>
                    <option value="Commercial Office / Studio">Commercial / Studio</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Project Scope
                  </label>
                  <select
                    name="space_type"
                    value={formData.space_type}
                    onChange={handleChange}
                    className="w-full border border-border/80 bg-background px-3 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="Full Interior Architecture">Full Interior Architecture</option>
                    <option value="Turnkey Execution (Design + Build)">Turnkey Execution</option>
                    <option value="Renovation & Architectural Upgrade">Renovation & Upgrade</option>
                    <option value="Bespoke Joinery & Styling">Joinery & Furniture Styling</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-wider uppercase text-muted-foreground">
                    Approx Area (Sq Ft)
                  </label>
                  <input
                    type="text"
                    name="area_sqft"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    placeholder="e.g. 4,500"
                    className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wider uppercase text-muted-foreground">
                  Target Investment / Budget Band
                </label>
                <select
                  name="budget_band"
                  value={formData.budget_band}
                  onChange={handleChange}
                  className="w-full border border-border/80 bg-background px-3 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="₹35 Lakhs – ₹75 Lakhs">₹35 Lakhs – ₹75 Lakhs</option>
                  <option value="₹75 Lakhs – ₹1.5 Crore">₹75 Lakhs – ₹1.5 Crore</option>
                  <option value="₹1.5 Crore – ₹3.5 Crore">₹1.5 Crore – ₹3.5 Crore</option>
                  <option value="₹3.5 Crore+ (Ultra Luxury / Estate)">
                    ₹3.5 Crore+ (Ultra Luxury / Estate)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-wider uppercase text-muted-foreground">
                  Brief Details / Vision
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about the space, possession date, family requirements, or specific material aesthetic you appreciate..."
                  className="w-full border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground px-8 py-4 text-xs font-semibold tracking-[0.2em] text-background uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending Brief..." : "Book a Consultation"}{" "}
                  <ArrowRight className="size-3.5" />
                </button>

                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-accent/80 px-6 py-4 text-xs font-semibold tracking-[0.18em] text-accent uppercase hover:bg-accent/10"
                >
                  <MessageSquare className="size-3.5" /> Send Via WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
