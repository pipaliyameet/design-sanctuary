// Realistic, comprehensive studio state & mock dataset for Atelier Vermilion Studio Command Center
import { GOOGLE_DRIVE_PHOTOS } from "./google-drive-photos";

export interface StudioProject {
  id: string;
  code: string;
  title: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  city: string;
  space_type: string;
  style: string;
  area_sqft: number;
  budget_amount: number;
  spent_amount: number;
  received_amount: number;
  stage:
    | "brief"
    | "site_visit"
    | "concept"
    | "design_development"
    | "client_approval"
    | "quotation"
    | "execution"
    | "installation"
    | "final_inspection"
    | "handover"
    | "completed";
  progress: number;
  start_date: string;
  target_date: string;
  lead_designer_name: string;
  project_manager_name: string;
  site_supervisor_name: string;
  is_active: boolean;
  is_featured_on_website: boolean;
  is_on_homepage: boolean;
  cover_image: string;
  health: "on_track" | "delayed" | "attention" | "ahead";
  description: string;
}


export interface StudioRoom {
  id: string;
  project_id: string;
  name: string;
  area_sqft: number;
  status: "planning" | "design" | "execution" | "completed";
  items_count: number;
  budget: number;
  hero_image?: string;
}

export interface StudioLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  property_type: string;
  project_type: string;
  budget_band: string;
  estimated_value: number;
  source: "Website" | "Instagram" | "WhatsApp" | "Referral" | "Walk-in" | "Phone" | "Other";
  stage: "new" | "contacted" | "site_visit" | "proposal" | "negotiation" | "won" | "lost";
  assigned_to: string;
  next_follow_up: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StudioClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  total_projects: number;
  total_contract_value: number;
  total_paid: number;
  total_outstanding: number;
  pending_approvals: number;
  status: "active" | "completed" | "prospect";
  since: string;
  notes: string;
}

export interface StudioMediaAsset {
  id: string;
  project_id: string;
  project_title: string;
  room_name?: string;
  category:
    "3d_renders" | "site_photos" | "final_photos" | "before_after" | "floor_plans" | "documents";
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  uploaded_by: string;
  upload_date: string;
  tags: string[];
  visibility: "website" | "private" | "client_only" | "internal";
  is_featured: boolean;
  is_cover: boolean;
  aspect_ratio?: string;
}

export interface StudioQuotationItem {
  id: string;
  category: string;
  room: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface StudioQuotation {
  id: string;
  number: string;
  project_id: string;
  project_title: string;
  client_name: string;
  client_email: string;
  version: "V1" | "V2" | "V3" | "Final";
  status: "draft" | "sent" | "approved" | "rejected" | "revised";
  created_at: string;
  valid_until: string;
  subtotal: number;
  discount_total: number;
  gst_total: number;
  grand_total: number;
  items: StudioQuotationItem[];
  notes: string;
  payment_terms: string;
}

export interface StudioInvoice {
  id: string;
  number: string;
  project_id: string;
  project_title: string;
  client_name: string;
  amount: number;
  amount_paid: number;
  status: "paid" | "partially_paid" | "pending" | "overdue";
  due_date: string;
  issued_at: string;
}

export interface StudioExpense {
  id: string;
  project_id?: string;
  project_title?: string;
  category:
    | "Materials"
    | "Labour / Contractor"
    | "Site Logistics"
    | "Software & Licenses"
    | "Studio Rent & Utilities"
    | "Travel"
    | "Other";
  description: string;
  vendor_name: string;
  amount: number;
  date: string;
  paid_by: string;
  status: "paid" | "pending_reimbursement";
}

export interface StudioMaterial {
  id: string;
  name: string;
  category:
    | "Stone & Marble"
    | "Timber & Millwork"
    | "Lighting & Electrical"
    | "Hardware & Joinery"
    | "Plaster & Paint"
    | "Soft Furnishings & Fabrics"
    | "Sanitary & Bath";
  brand: string;
  vendor_name: string;
  unit: string;
  unit_rate: number;
  project_id: string;
  project_title: string;
  room_name: string;
  quantity: number;
  total_cost: number;
  status:
    "requested" | "quoted" | "approved" | "ordered" | "in_transit" | "delivered" | "installed";
  order_date?: string;
  expected_delivery?: string;
}

export interface StudioVendor {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  rating: number;
  active_orders_count: number;
  total_spent: number;
  outstanding_balance: number;
  notes: string;
}

export interface StudioSiteUpdate {
  id: string;
  project_id: string;
  project_title: string;
  date: string;
  title: string;
  work_completed: string;
  work_pending: string;
  issues?: string;
  materials_received?: string;
  next_action: string;
  uploaded_by: string;
  photos: string[];
}

export interface StudioDocument {
  id: string;
  project_id: string;
  project_title: string;
  title: string;
  category:
    | "Floor Plans"
    | "2D Drawings"
    | "3D Designs"
    | "Electrical"
    | "Plumbing"
    | "Furniture"
    | "Material Boards"
    | "Contracts"
    | "Invoices"
    | "Quotations"
    | "Other";
  version: "V1" | "V2" | "V3" | "Approved";
  file_url: string;
  file_size: string;
  file_type: string;
  uploaded_by: string;
  upload_date: string;
  status: "draft" | "review_pending" | "approved" | "superseded";
  is_approved: boolean;
  visibility: "website" | "client_only" | "internal";
}

export interface StudioTeamMember {
  id: string;
  name: string;
  role:
    | "Principal Architect"
    | "Project Director"
    | "Senior Interior Designer"
    | "3D Visualizer & Render Lead"
    | "Site Execution Supervisor"
    | "Accounts & Procurement Manager";
  email: string;
  phone: string;
  status: "active" | "on_site" | "leave";
  assigned_projects: string[];
  tasks_count: number;
  avatar_url?: string;
}

export interface StudioAuditEntry {
  id: string;
  timestamp: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  detail: string;
}

export interface StudioNotification {
  id: string;
  title: string;
  description: string;
  type:
    | "approval"
    | "payment"
    | "lead"
    | "site_update"
    | "material_delay"
    | "task_overdue"
    | "quotation";
  project_id?: string;
  project_title?: string;
  timestamp: string;
  read: boolean;
  action_url: string;
  action_label: string;
}

/* ========================================================================== */
/* SEEDED DATABASE                                                            */
/* ========================================================================== */

export const INITIAL_PROJECTS: StudioProject[] = [
  {
    id: "proj-patel",
    code: "AV-101",
    title: "Patel Residence",
    client_id: "client-patel",
    client_name: "Ketan & Aarti Patel",
    client_email: "ketan.patel@patelchem.com",
    client_phone: "+91 98250 11422",
    city: "Rajkot, Gujarat",
    space_type: "3BHK Luxury Apartment",
    style: "Architectural Minimalist",
    area_sqft: 2850,
    budget_amount: 1850000,
    spent_amount: 1258000,
    received_amount: 1400000,
    stage: "execution",
    progress: 68,
    start_date: "2026-05-10",
    target_date: "2026-11-20",
    lead_designer_name: "Ira Kapoor",
    project_manager_name: "Nikhil Menon",
    site_supervisor_name: "Haresh Solanki",
    is_active: true,
    is_featured_on_website: true,
    is_on_homepage: true,
    cover_image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    health: "on_track",
    description:
      "Complete interior overhaul featuring lime-washed surfaces, bespoke fumed oak millwork, brushed brass fittings, and fluted glass partitions.",
  },
  {
    id: "proj-shah",
    code: "AV-102",
    title: "Shah Villa",
    client_id: "client-shah",
    client_name: "Pratik Shah",
    client_email: "pratik@shahgroup.in",
    client_phone: "+91 98980 44211",
    city: "Ahmedabad, Gujarat",
    space_type: "4BHK Courtyard Villa",
    style: "Courtyard & Warm Plaster",
    area_sqft: 6400,
    budget_amount: 3200000,
    spent_amount: 1344000,
    received_amount: 1600000,
    stage: "design_development",
    progress: 42,
    start_date: "2026-06-01",
    target_date: "2026-12-30",
    lead_designer_name: "Ira Kapoor",
    project_manager_name: "Nikhil Menon",
    site_supervisor_name: "Haresh Solanki",
    is_active: true,
    is_featured_on_website: true,
    is_on_homepage: true,
    cover_image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    health: "attention",
    description:
      "Monolithic brick and Roman travertine residence planned around an open water courtyard with tailored lighting and custom cast bronze hardware.",
  },
  {
    id: "proj-mehta",
    code: "AV-103",
    title: "Mehta Executive Suite",
    client_id: "client-mehta",
    client_name: "Devang Mehta",
    client_email: "devang@mehtafin.com",
    client_phone: "+91 94260 88231",
    city: "Rajkot, Gujarat",
    space_type: "Boutique Financial Office",
    style: "Modern Classic & Walnut",
    area_sqft: 1950,
    budget_amount: 1280000,
    spent_amount: 1036800,
    received_amount: 1100000,
    stage: "installation",
    progress: 81,
    start_date: "2026-04-15",
    target_date: "2026-10-15",
    lead_designer_name: "Nikhil Menon",
    project_manager_name: "Ira Kapoor",
    site_supervisor_name: "Mahesh Rawat",
    is_active: true,
    is_featured_on_website: true,
    is_on_homepage: false,
    cover_image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    health: "ahead",
    description:
      "A refined workspace with acoustic slat panelling, Italian marble reception desk, private boardroom, and concealed bar credenzas.",
  },
  {
    id: "proj-oberoi",
    code: "AV-104",
    title: "The Oberoi Penthouse",
    client_id: "client-oberoi",
    client_name: "Vikram & Malini Oberoi",
    client_email: "v.oberoi@oberoiholdings.com",
    client_phone: "+91 98201 55901",
    city: "Mumbai, Maharashtra",
    space_type: "Luxury Sea-view Penthouse",
    style: "Editorial Quiet Luxury",
    area_sqft: 5200,
    budget_amount: 4800000,
    spent_amount: 4320000,
    received_amount: 4500000,
    stage: "final_inspection",
    progress: 90,
    start_date: "2026-02-01",
    target_date: "2026-09-30",
    lead_designer_name: "Ira Kapoor",
    project_manager_name: "Nikhil Menon",
    site_supervisor_name: "Mahesh Rawat",
    is_active: true,
    is_featured_on_website: true,
    is_on_homepage: true,
    cover_image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    health: "on_track",
    description:
      "Ultra-prime duplex penthouse facing Arabian Sea. Bespoke marble island, custom art display niches, curved micro-cement stair, and master retreat.",
  },
  {
    id: "proj-ananya",
    code: "AV-105",
    title: "Ananya Duplex",
    client_id: "client-ananya",
    client_name: "Dr. Sameer & Neha Joshi",
    client_email: "sameer.joshi@ananyaclinic.com",
    client_phone: "+91 97277 33190",
    city: "Vadodara, Gujarat",
    space_type: "Contemporary Duplex",
    style: "Scandi-Indian Fusion",
    area_sqft: 3400,
    budget_amount: 2450000,
    spent_amount: 367500,
    received_amount: 500000,
    stage: "concept",
    progress: 15,
    start_date: "2026-08-15",
    target_date: "2027-02-28",
    lead_designer_name: "Ira Kapoor",
    project_manager_name: "Nikhil Menon",
    site_supervisor_name: "Haresh Solanki",
    is_active: true,
    is_featured_on_website: false,
    is_on_homepage: false,
    cover_image: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    health: "on_track",
    description:
      "Modern family residence blending terracotta elements, ash wood joinery, light plaster, and open kitchen layout.",
  },
  {
    id: "proj-kothari",
    code: "AV-106",
    title: "Kothari Haven",
    client_id: "client-kothari",
    client_name: "Rajesh Kothari",
    client_email: "rajesh@kotharigroup.com",
    client_phone: "+91 99099 22180",
    city: "Surat, Gujarat",
    space_type: "Private Bungalow",
    style: "Tropical Brutalism & Wood",
    area_sqft: 4800,
    budget_amount: 3800000,
    spent_amount: 2090000,
    received_amount: 2500000,
    stage: "execution",
    progress: 55,
    start_date: "2026-04-01",
    target_date: "2026-12-15",
    lead_designer_name: "Nikhil Menon",
    project_manager_name: "Ira Kapoor",
    site_supervisor_name: "Mahesh Rawat",
    is_active: true,
    is_featured_on_website: true,
    is_on_homepage: false,
    cover_image: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    health: "delayed",
    description:
      "Extensive renovation including double-height lounge, cantilevered walnut staircase, and landscaped courtyard balcony.",
  },
];

export const INITIAL_ROOMS: StudioRoom[] = [
  {
    id: "room-1",
    project_id: "proj-patel",
    name: "Formal Living & Foyer",
    area_sqft: 650,
    status: "execution",
    items_count: 14,
    budget: 480000,
    hero_image: GOOGLE_DRIVE_PHOTOS[0]?.url,
  },
  {
    id: "room-2",
    project_id: "proj-patel",
    name: "Master Bedroom Sanctuary",
    area_sqft: 480,
    status: "execution",
    items_count: 12,
    budget: 420000,
    hero_image: GOOGLE_DRIVE_PHOTOS[1]?.url,
  },
  {
    id: "room-3",
    project_id: "proj-patel",
    name: "Culinary Studio & Dining",
    area_sqft: 520,
    status: "design",
    items_count: 16,
    budget: 510000,
    hero_image: GOOGLE_DRIVE_PHOTOS[2]?.url,
  },
  {
    id: "room-4",
    project_id: "proj-patel",
    name: "Parents' Suite",
    area_sqft: 380,
    status: "planning",
    items_count: 8,
    budget: 240000,
    hero_image: GOOGLE_DRIVE_PHOTOS[3]?.url,
  },
  {
    id: "room-5",
    project_id: "proj-patel",
    name: "Private Balcony Garden",
    area_sqft: 220,
    status: "planning",
    items_count: 5,
    budget: 200000,
    hero_image: GOOGLE_DRIVE_PHOTOS[4]?.url,
  },
  {
    id: "room-6",
    project_id: "proj-shah",
    name: "Central Water Court & Lounge",
    area_sqft: 1400,
    status: "design",
    items_count: 22,
    budget: 950000,
    hero_image: GOOGLE_DRIVE_PHOTOS[5]?.url,
  },
  {
    id: "room-7",
    project_id: "proj-shah",
    name: "Grand Dining & Show Kitchen",
    area_sqft: 900,
    status: "planning",
    items_count: 18,
    budget: 780000,
    hero_image: GOOGLE_DRIVE_PHOTOS[6]?.url,
  },
  {
    id: "room-8",
    project_id: "proj-shah",
    name: "Master Suite & Walk-in Wardrobe",
    area_sqft: 850,
    status: "planning",
    items_count: 15,
    budget: 690000,
    hero_image: GOOGLE_DRIVE_PHOTOS[7]?.url,
  },
];


export const INITIAL_LEADS: StudioLead[] = [
  {
    id: "lead-1",
    name: "Rohan & Sneha Doshi",
    email: "rohan.doshi@doshitrading.com",
    phone: "+91 98251 77334",
    city: "Rajkot, Gujarat",
    property_type: "4BHK Penthouse",
    project_type: "Full Turnkey Interior",
    budget_band: "₹25L – ₹35L",
    estimated_value: 3000000,
    source: "Website",
    stage: "proposal",
    assigned_to: "Ira Kapoor",
    next_follow_up: "2026-09-19",
    notes:
      "Client reviewed initial moodboard. Awaiting BOQ breakdown for living and master suites.",
    created_at: "2026-09-12T10:30:00Z",
    updated_at: "2026-09-16T15:00:00Z",
  },
  {
    id: "lead-2",
    name: "Anand Singhania",
    email: "anand@singhaniagroup.in",
    phone: "+91 99042 11990",
    city: "Ahmedabad, Gujarat",
    property_type: "Independent Villa",
    project_type: "Interior Architecture & Joinery",
    budget_band: "₹50L+",
    estimated_value: 5500000,
    source: "Referral",
    stage: "site_visit",
    assigned_to: "Nikhil Menon",
    next_follow_up: "2026-09-20",
    notes: "Site visit scheduled for Saturday 11 AM with structural drawings in hand.",
    created_at: "2026-09-14T09:15:00Z",
    updated_at: "2026-09-16T12:00:00Z",
  },
  {
    id: "lead-3",
    name: "Meera Trivedi",
    email: "meera.trivedi@gmail.com",
    phone: "+91 97245 66012",
    city: "Mumbai, Maharashtra",
    property_type: "3BHK Highrise",
    project_type: "Living & Kitchen Renovation",
    budget_band: "₹15L – ₹20L",
    estimated_value: 1800000,
    source: "Instagram",
    stage: "new",
    assigned_to: "Ira Kapoor",
    next_follow_up: "2026-09-18",
    notes: "Inquired via Instagram DM regarding our warm stone & oak aesthetic. Needs callback.",
    created_at: "2026-09-17T08:20:00Z",
    updated_at: "2026-09-17T08:20:00Z",
  },
  {
    id: "lead-4",
    name: "Dr. Harshavardhan Rao",
    email: "h.rao@cardiocenter.in",
    phone: "+91 98450 99231",
    city: "Vadodara, Gujarat",
    property_type: "Wellness Clinic Lounge",
    project_type: "Commercial Interior",
    budget_band: "₹20L – ₹30L",
    estimated_value: 2200000,
    source: "WhatsApp",
    stage: "contacted",
    assigned_to: "Nikhil Menon",
    next_follow_up: "2026-09-21",
    notes: "Sent digital studio portfolio and introductory questionnaire.",
    created_at: "2026-09-15T14:40:00Z",
    updated_at: "2026-09-16T16:10:00Z",
  },
  {
    id: "lead-5",
    name: "Kunal & Tanvi Merchant",
    email: "kunal@merchanttextiles.com",
    phone: "+91 98240 55119",
    city: "Surat, Gujarat",
    property_type: "Row House",
    project_type: "Turnkey Architecture & Interior",
    budget_band: "₹35L – ₹50L",
    estimated_value: 4200000,
    source: "Referral",
    stage: "negotiation",
    assigned_to: "Ira Kapoor",
    next_follow_up: "2026-09-19",
    notes: "Finalizing turnkey scope and payment milestone schedule. Very positive.",
    created_at: "2026-08-28T11:00:00Z",
    updated_at: "2026-09-15T18:00:00Z",
  },
];

export const INITIAL_CLIENTS: StudioClient[] = [
  {
    id: "client-patel",
    name: "Ketan & Aarti Patel",
    email: "ketan.patel@patelchem.com",
    phone: "+91 98250 11422",
    city: "Rajkot, Gujarat",
    address: "B-1402, Royal Palms, Racecourse Ring Road, Rajkot",
    total_projects: 1,
    total_contract_value: 1850000,
    total_paid: 1400000,
    total_outstanding: 450000,
    pending_approvals: 2,
    status: "active",
    since: "May 2026",
    notes:
      "Very attentive to material textures and lighting warmth. Prefers WhatsApp updates on Fridays.",
  },
  {
    id: "client-shah",
    name: "Pratik Shah",
    email: "pratik@shahgroup.in",
    phone: "+91 98980 44211",
    city: "Ahmedabad, Gujarat",
    address: "Plot 42, Gulmohar Enclave, Sindhu Bhavan Road, Ahmedabad",
    total_projects: 1,
    total_contract_value: 3200000,
    total_paid: 1600000,
    total_outstanding: 1600000,
    pending_approvals: 1,
    status: "active",
    since: "June 2026",
    notes:
      "Multi-generational family home. Client travels frequently; meetings best scheduled on Zoom.",
  },
  {
    id: "client-mehta",
    name: "Devang Mehta",
    email: "devang@mehtafin.com",
    phone: "+91 94260 88231",
    city: "Rajkot, Gujarat",
    address: "5th Floor, Silver Arch Commercial Plaza, Yagnik Road, Rajkot",
    total_projects: 1,
    total_contract_value: 1280000,
    total_paid: 1100000,
    total_outstanding: 180000,
    pending_approvals: 0,
    status: "active",
    since: "April 2026",
    notes: "Corporate client with strict handover date. Site running ahead of schedule.",
  },
  {
    id: "client-oberoi",
    name: "Vikram & Malini Oberoi",
    email: "v.oberoi@oberoiholdings.com",
    phone: "+91 98201 55901",
    city: "Mumbai, Maharashtra",
    address: "28th Floor, Sea View Towers, Worli Seaface, Mumbai",
    total_projects: 1,
    total_contract_value: 4800000,
    total_paid: 4500000,
    total_outstanding: 300000,
    pending_approvals: 1,
    status: "active",
    since: "Feb 2026",
    notes: "Final stage inspection underway. High-profile project for website showcase.",
  },
];

export const INITIAL_MEDIA: StudioMediaAsset[] = GOOGLE_DRIVE_PHOTOS.map((p, idx) => ({
  id: `med-${p.id}`,
  project_id: p.projectId,
  project_title: p.projectTitle,
  room_name: p.category,
  category:
    idx % 4 === 0
      ? "final_photos"
      : idx % 4 === 1
      ? "3d_renders"
      : idx % 4 === 2
      ? "site_photos"
      : "before_after",
  title: p.title,
  description: p.caption,
  url: p.url,
  thumbnail_url: p.thumbnailUrl,
  uploaded_by: "Ira Kapoor (Studio Principal)",
  upload_date: p.uploadedAt || "2026-09-25",
  tags: p.tags,
  visibility: "website",
  is_featured: idx < 12,
  is_cover: idx === 0,
}));


export const INITIAL_QUOTATIONS: StudioQuotation[] = [
  {
    id: "quot-101",
    number: "EST-2026-101",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    client_name: "Ketan & Aarti Patel",
    client_email: "ketan.patel@patelchem.com",
    version: "V3",
    status: "approved",
    created_at: "2026-05-18",
    valid_until: "2026-06-18",
    subtotal: 1650000,
    discount_total: 50000,
    gst_total: 250000,
    grand_total: 1850000,
    notes:
      "All materials specified are genuine Hafele / Asian Paints Royal Aspira / Italian Botticino Marble.",
    payment_terms:
      "30% Advance on signing, 30% on Civil/POP completion, 30% on Millwork installation, 10% on Final Handover.",
    items: [
      {
        id: "qi-1",
        category: "Civil & Flooring",
        room: "Living & Foyer",
        description:
          "Italian Botticino Marble supply, mirror polishing and diamond abrasive finishing",
        quantity: 650,
        unit: "sq ft",
        rate: 450,
        discount: 0,
        tax_rate: 18,
        total: 292500,
      },
      {
        id: "qi-2",
        category: "Ceiling & Lighting",
        room: "Living & Foyer",
        description:
          "Seamless gypsum false ceiling with 12mm shadow line reveal and magnetic track channels",
        quantity: 650,
        unit: "sq ft",
        rate: 180,
        discount: 0,
        tax_rate: 18,
        total: 117000,
      },
      {
        id: "qi-3",
        category: "Bespoke Millwork",
        room: "Living & Foyer",
        description:
          "TV credenza in fumed white oak veneer with concealed soft-close drawer hardware",
        quantity: 1,
        unit: "lump sum",
        rate: 220000,
        discount: 10000,
        tax_rate: 18,
        total: 210000,
      },
      {
        id: "qi-4",
        category: "Bespoke Millwork",
        room: "Master Bedroom",
        description:
          "Full height 9ft wardrobe with fluted oak glass shutters and internal sensor LED strips",
        quantity: 140,
        unit: "sq ft",
        rate: 2100,
        discount: 0,
        tax_rate: 18,
        total: 294000,
      },
      {
        id: "qi-5",
        category: "Surface Finishes",
        room: "All Rooms",
        description: "Hand-trowelled lime plaster finish with natural breathable wax seal",
        quantity: 3200,
        unit: "sq ft",
        rate: 95,
        discount: 15000,
        tax_rate: 18,
        total: 289000,
      },
      {
        id: "qi-6",
        category: "Design & Project Fee",
        room: "Overall",
        description:
          "Comprehensive turnkey architectural design, 3D development and on-site supervision",
        quantity: 1,
        unit: "fixed",
        rate: 447500,
        discount: 25000,
        tax_rate: 18,
        total: 447500,
      },
    ],
  },
  {
    id: "quot-102",
    number: "EST-2026-102",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    client_name: "Pratik Shah",
    client_email: "pratik@shahgroup.in",
    version: "V2",
    status: "sent",
    created_at: "2026-09-08",
    valid_until: "2026-10-08",
    subtotal: 2800000,
    discount_total: 100000,
    gst_total: 500000,
    grand_total: 3200000,
    notes:
      "Phase 1 estimate covering courtyard, ground floor living, show kitchen, and master suite.",
    payment_terms:
      "25% on Confirmation, 25% on Structural/Stone completion, 30% on Joinery delivery, 20% on Handover.",
    items: [
      {
        id: "qi-7",
        category: "Stone & Masonry",
        room: "Courtyard Lounge",
        description:
          "Honed Roman Travertine cladding and floor stone with perimeter water channel waterproofing",
        quantity: 1400,
        unit: "sq ft",
        rate: 680,
        discount: 20000,
        tax_rate: 18,
        total: 932000,
      },
      {
        id: "qi-8",
        category: "Custom Joinery",
        room: "Show Kitchen",
        description:
          "German ceramic island countertop with marine-grade oak carcass and Blum servo-drive drawers",
        quantity: 1,
        unit: "lump sum",
        rate: 850000,
        discount: 30000,
        tax_rate: 18,
        total: 820000,
      },
      {
        id: "qi-9",
        category: "Architectural Lighting",
        room: "Entire Villa",
        description:
          "Lumina architectural recessed spotlights (CRI 98, 2700K) and DALI automated dimming",
        quantity: 1,
        unit: "package",
        rate: 450000,
        discount: 0,
        tax_rate: 18,
        total: 450000,
      },
      {
        id: "qi-10",
        category: "Studio Professional Fee",
        room: "Overall",
        description:
          "Full interior architecture, detailed CAD working drawings, and turnkey procurement",
        quantity: 1,
        unit: "fixed",
        rate: 598000,
        discount: 50000,
        tax_rate: 18,
        total: 598000,
      },
    ],
  },
];

export const INITIAL_INVOICES: StudioInvoice[] = [
  {
    id: "inv-1",
    number: "INV-2026-041",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    client_name: "Ketan & Aarti Patel",
    amount: 555000,
    amount_paid: 555000,
    status: "paid",
    due_date: "2026-05-25",
    issued_at: "2026-05-15",
  },
  {
    id: "inv-2",
    number: "INV-2026-058",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    client_name: "Ketan & Aarti Patel",
    amount: 555000,
    amount_paid: 555000,
    status: "paid",
    due_date: "2026-07-15",
    issued_at: "2026-07-05",
  },
  {
    id: "inv-3",
    number: "INV-2026-079",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    client_name: "Ketan & Aarti Patel",
    amount: 555000,
    amount_paid: 290000,
    status: "partially_paid",
    due_date: "2026-09-15",
    issued_at: "2026-09-01",
  },
  {
    id: "inv-4",
    number: "INV-2026-062",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    client_name: "Pratik Shah",
    amount: 800000,
    amount_paid: 800000,
    status: "paid",
    due_date: "2026-06-20",
    issued_at: "2026-06-10",
  },
  {
    id: "inv-5",
    number: "INV-2026-081",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    client_name: "Pratik Shah",
    amount: 800000,
    amount_paid: 800000,
    status: "paid",
    due_date: "2026-08-30",
    issued_at: "2026-08-15",
  },
  {
    id: "inv-6",
    number: "INV-2026-088",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    client_name: "Pratik Shah",
    amount: 800000,
    amount_paid: 0,
    status: "pending",
    due_date: "2026-09-28",
    issued_at: "2026-09-14",
  },
  {
    id: "inv-7",
    number: "INV-2026-075",
    project_id: "proj-mehta",
    project_title: "Mehta Executive Suite",
    client_name: "Devang Mehta",
    amount: 384000,
    amount_paid: 384000,
    status: "paid",
    due_date: "2026-08-20",
    issued_at: "2026-08-05",
  },
];

export const INITIAL_EXPENSES: StudioExpense[] = [
  {
    id: "exp-1",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    category: "Materials",
    description: "Italian Botticino Marble 650 sqft consignment",
    vendor_name: "Stones & Craft Gujarat",
    amount: 185000,
    date: "2026-09-02",
    paid_by: "Studio Corporate Card",
    status: "paid",
  },
  {
    id: "exp-2",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    category: "Labour / Contractor",
    description: "Civil POP & ceiling contractor running milestone payment",
    vendor_name: "Solanki Civil Works",
    amount: 120000,
    date: "2026-09-10",
    paid_by: "Bank Transfer",
    status: "paid",
  },
  {
    id: "exp-3",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    category: "Materials",
    description: "Custom extruded antique brass shadow reveals",
    vendor_name: "Marvel Hardware",
    amount: 95000,
    date: "2026-09-12",
    paid_by: "Studio Corporate Card",
    status: "paid",
  },
  {
    id: "exp-4",
    category: "Software & Licenses",
    description: "Autodesk Revit & 3ds Max Studio Annual Cloud Subscription",
    vendor_name: "Autodesk India",
    amount: 48000,
    date: "2026-09-05",
    paid_by: "Corporate Card",
    status: "paid",
  },
  {
    id: "exp-5",
    category: "Studio Rent & Utilities",
    description: "Design Sanctuary Studio Atelier Rent — September 2026",
    vendor_name: "Shivalik Properties",
    amount: 85000,
    date: "2026-09-01",
    paid_by: "Bank Transfer",
    status: "paid",
  },
];

export const INITIAL_MATERIALS: StudioMaterial[] = [
  {
    id: "mat-1",
    name: "Honed Roman Travertine",
    category: "Stone & Marble",
    brand: "Antolini Italy",
    vendor_name: "Stones & Craft Gujarat",
    unit: "sq ft",
    unit_rate: 680,
    project_id: "proj-shah",
    project_title: "Shah Villa",
    room_name: "Central Water Court",
    quantity: 1400,
    total_cost: 952000,
    status: "in_transit",
    order_date: "2026-09-04",
    expected_delivery: "2026-09-22",
  },
  {
    id: "mat-2",
    name: "Fumed European White Oak Veneer",
    category: "Timber & Millwork",
    brand: "Decowood Premium",
    vendor_name: "Royal Oak Joinery",
    unit: "sheets",
    unit_rate: 4200,
    project_id: "proj-patel",
    project_title: "Patel Residence",
    room_name: "Living & Foyer",
    quantity: 45,
    total_cost: 189000,
    status: "delivered",
    order_date: "2026-08-25",
    expected_delivery: "2026-09-08",
  },
  {
    id: "mat-3",
    name: "Hand-trowelled Lime Plaster (Warm Sand)",
    category: "Plaster & Paint",
    brand: "Vasari Lime Plaster",
    vendor_name: "Asian Paints Pro",
    unit: "buckets",
    unit_rate: 7800,
    project_id: "proj-patel",
    project_title: "Patel Residence",
    room_name: "Master Suite",
    quantity: 18,
    total_cost: 140400,
    status: "installed",
    order_date: "2026-08-10",
    expected_delivery: "2026-08-20",
  },
  {
    id: "mat-4",
    name: "Fluted Solid Brass Profiles (15mm x 15mm)",
    category: "Hardware & Joinery",
    brand: "Atelier Bespoke",
    vendor_name: "Marvel Hardware",
    unit: "running ft",
    unit_rate: 340,
    project_id: "proj-patel",
    project_title: "Patel Residence",
    room_name: "Living Room",
    quantity: 240,
    total_cost: 81600,
    status: "approved",
    order_date: "2026-09-15",
    expected_delivery: "2026-09-25",
  },
  {
    id: "mat-5",
    name: "Architectural 2700K Low-Glare Spotlights",
    category: "Lighting & Electrical",
    brand: "Lumina Atelier",
    vendor_name: "Lumina Atelier",
    unit: "pieces",
    unit_rate: 1850,
    project_id: "proj-shah",
    project_title: "Shah Villa",
    room_name: "Courtyard Lounge",
    quantity: 64,
    total_cost: 118400,
    status: "ordered",
    order_date: "2026-09-12",
    expected_delivery: "2026-09-24",
  },
];

export const INITIAL_VENDORS: StudioVendor[] = [
  {
    id: "vend-1",
    name: "Stones & Craft Gujarat",
    category: "Imported Marble & Granite",
    contact_person: "Bhavin Patel",
    phone: "+91 98254 99011",
    email: "bhavin@stonescraft.com",
    city: "Ahmedabad, Gujarat",
    rating: 4.9,
    active_orders_count: 2,
    total_spent: 1840000,
    outstanding_balance: 95000,
    notes:
      "Reliable importer of Italian travertine and Greek white marble. 14 days lead time for custom slab cutting.",
  },
  {
    id: "vend-2",
    name: "Royal Oak Joinery",
    category: "Veneers & Solid Hardwoods",
    contact_person: "Manish Solanki",
    phone: "+91 97129 33280",
    email: "manish@royaloakmills.com",
    city: "Rajkot, Gujarat",
    rating: 4.8,
    active_orders_count: 3,
    total_spent: 1250000,
    outstanding_balance: 42000,
    notes: "Excellent precision joinery and CNC fluting capabilities.",
  },
  {
    id: "vend-3",
    name: "Lumina Atelier",
    category: "Architectural Lighting & DALI Systems",
    contact_person: "Sanjay Verma",
    phone: "+91 98205 11899",
    email: "sanjay@lumina-atelier.com",
    city: "Mumbai, Maharashtra",
    rating: 5.0,
    active_orders_count: 2,
    total_spent: 980000,
    outstanding_balance: 0,
    notes: "High CRI 98 fittings with magnetic low voltage tracks and museum optics.",
  },
  {
    id: "vend-4",
    name: "Marvel Hardware",
    category: "Architectural Brass & Concealed Hinges",
    contact_person: "Hitesh Shah",
    phone: "+91 94280 44551",
    email: "orders@marvelhardware.in",
    city: "Ahmedabad, Gujarat",
    rating: 4.7,
    active_orders_count: 1,
    total_spent: 450000,
    outstanding_balance: 18000,
    notes: "Authorized dealer for Hafele, Blum, and custom unlacquered brass pulls.",
  },
];

export const INITIAL_SITE_UPDATES: StudioSiteUpdate[] = [
  {
    id: "site-1",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    date: "2026-09-17",
    title: "Living Room False Ceiling Framing & Laser Alignment Complete",
    work_completed:
      "Completed 100% perimeter GI channel grid with 12mm shadow reveal. Conduiting for magnetic light tracks verified.",
    work_pending: "Gypsum board skinning and joint taping scheduled for tomorrow.",
    issues: "Minor alignment adjustment made near AC ducting to maintain 9' 4\" clear height.",
    materials_received: "18 sheets gypsum board delivered from Gyproc depot.",
    next_action: "Complete board fixing and begin first coat lime primer.",
    uploaded_by: "Haresh Solanki (Site Supervisor)",
    photos: [
      GOOGLE_DRIVE_PHOTOS[9]?.url || "",
      GOOGLE_DRIVE_PHOTOS[0]?.url || "",
    ],
  },
  {
    id: "site-2",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    date: "2026-09-14",
    title: "Master Bathroom Wet-Area Waterproofing & Stone Dry-Lay",
    work_completed:
      "Polymer membrane waterproofing test completed with 48hr water ponding. Zero leakage.",
    work_pending: "Dry laying fluted grey travertine wall slabs.",
    materials_received: "All bathroom plumbing rough-ins (Kohler Concealed Mixers) installed.",
    next_action: "Final epoxy grouting and marble threshold installation.",
    uploaded_by: "Haresh Solanki (Site Supervisor)",
    photos: [GOOGLE_DRIVE_PHOTOS[1]?.url || ""],
  },
  {
    id: "site-3",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    date: "2026-09-15",
    title: "Courtyard Travertine Colonnade Base Anchoring",
    work_completed:
      "Reinforced concrete plinth cured. Stainless steel brackets fixed for Roman travertine vertical fins.",
    work_pending: "Water court pond waterproofing second coat.",
    issues: "Stone shipment delayed by 3 days at Mumbai port; rescheduled installation to Sep 24.",
    materials_received: "Concealed IP68 underwater linear LED profiles received from Lumina.",
    next_action: "Pour micro-concrete bedding for travertine pavers.",
    uploaded_by: "Haresh Solanki (Site Supervisor)",
    photos: [GOOGLE_DRIVE_PHOTOS[0]?.url || ""],
  },
];

export const INITIAL_DOCUMENTS: StudioDocument[] = [
  {
    id: "doc-1",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    title: "Living & Foyer Comprehensive Working Drawings (CAD / PDF)",
    category: "2D Drawings",
    version: "Approved",
    file_url: "/docs/patel-living-dwg.pdf",
    file_size: "14.2 MB",
    file_type: "PDF",
    uploaded_by: "Ira Kapoor",
    upload_date: "2026-08-22",
    status: "approved",
    is_approved: true,
    visibility: "client_only",
  },
  {
    id: "doc-2",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    title: "Electrical Layout & Circuit Load Schedules",
    category: "Electrical",
    version: "V2",
    file_url: "/docs/patel-elec-v2.pdf",
    file_size: "6.8 MB",
    file_type: "PDF",
    uploaded_by: "Nikhil Menon",
    upload_date: "2026-08-28",
    status: "approved",
    is_approved: true,
    visibility: "internal",
  },
  {
    id: "doc-3",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    title: "Material Board & Specification Schedule",
    category: "Material Boards",
    version: "Approved",
    file_url: "/docs/patel-materials.pdf",
    file_size: "22.5 MB",
    file_type: "PDF",
    uploaded_by: "Ira Kapoor",
    upload_date: "2026-08-15",
    status: "approved",
    is_approved: true,
    visibility: "website",
  },
  {
    id: "doc-4",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    title: "Courtyard Colonnade Structural & Stone Detail Set",
    category: "2D Drawings",
    version: "V3",
    file_url: "/docs/shah-colonnade.pdf",
    file_size: "18.1 MB",
    file_type: "PDF",
    uploaded_by: "Nikhil Menon",
    upload_date: "2026-09-02",
    status: "review_pending",
    is_approved: false,
    visibility: "client_only",
  },
  {
    id: "doc-5",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    title: "Turnkey Interior Execution Contract (Signed)",
    category: "Contracts",
    version: "Approved",
    file_url: "/docs/patel-contract.pdf",
    file_size: "4.5 MB",
    file_type: "PDF",
    uploaded_by: "Studio Admin",
    upload_date: "2026-05-12",
    status: "approved",
    is_approved: true,
    visibility: "internal",
  },
];

export const INITIAL_TEAM: StudioTeamMember[] = [
  {
    id: "team-1",
    name: "Ira Kapoor",
    role: "Principal Architect",
    email: "ira@ateliervermilion.com",
    phone: "+91 98250 99881",
    status: "active",
    assigned_projects: ["Patel Residence", "Shah Villa", "The Oberoi Penthouse", "Ananya Duplex"],
    tasks_count: 8,
    avatar_url: "/team/ira.jpg",
  },
  {
    id: "team-2",
    name: "Nikhil Menon",
    role: "Project Director",
    email: "nikhil@ateliervermilion.com",
    phone: "+91 98200 44321",
    status: "active",
    assigned_projects: ["Patel Residence", "Shah Villa", "Mehta Executive Suite", "Kothari Haven"],
    tasks_count: 6,
    avatar_url: "/team/nikhil.jpg",
  },
  {
    id: "team-3",
    name: "Haresh Solanki",
    role: "Site Execution Supervisor",
    email: "haresh@ateliervermilion.com",
    phone: "+91 97120 55112",
    status: "on_site",
    assigned_projects: ["Patel Residence", "Shah Villa", "Ananya Duplex"],
    tasks_count: 11,
    avatar_url: "/team/haresh.jpg",
  },
  {
    id: "team-4",
    name: "Mahesh Rawat",
    role: "Site Execution Supervisor",
    email: "mahesh@ateliervermilion.com",
    phone: "+91 94261 88990",
    status: "on_site",
    assigned_projects: ["Mehta Executive Suite", "The Oberoi Penthouse", "Kothari Haven"],
    tasks_count: 7,
    avatar_url: "/team/mahesh.jpg",
  },
  {
    id: "team-5",
    name: "Pooja Trivedi",
    role: "3D Visualizer & Render Lead",
    email: "pooja@ateliervermilion.com",
    phone: "+91 99090 12345",
    status: "active",
    assigned_projects: ["Shah Villa", "Ananya Duplex", "Kothari Haven"],
    tasks_count: 5,
    avatar_url: "/team/pooja.jpg",
  },
  {
    id: "team-6",
    name: "Devanshi Shah",
    role: "Accounts & Procurement Manager",
    email: "accounts@ateliervermilion.com",
    phone: "+91 98244 77660",
    status: "active",
    assigned_projects: ["All Studio Projects"],
    tasks_count: 4,
    avatar_url: "/team/devanshi.jpg",
  },
];

export const INITIAL_NOTIFICATIONS: StudioNotification[] = [
  {
    id: "notif-1",
    title: "Client Approval Pending",
    description:
      "Ketan Patel has not yet approved the Living Room TV Credenza Joinery detail V3 sent 3 days ago.",
    type: "approval",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    timestamp: "10 mins ago",
    read: false,
    action_url: "/studio/projects/proj-patel",
    action_label: "Review Approval",
  },
  {
    id: "notif-2",
    title: "New Website Lead Received",
    description:
      "Meera Trivedi submitted an enquiry for a 3BHK highrise interior in Mumbai (₹18L budget).",
    type: "lead",
    timestamp: "45 mins ago",
    read: false,
    action_url: "/studio/leads",
    action_label: "Open CRM",
  },
  {
    id: "notif-3",
    title: "Material Delivery Alert",
    description:
      "Honed Roman Travertine shipment for Shah Villa is currently in transit, expected Sep 22.",
    type: "material_delay",
    project_id: "proj-shah",
    project_title: "Shah Villa",
    timestamp: "2 hours ago",
    read: false,
    action_url: "/studio/materials",
    action_label: "Track Shipment",
  },
  {
    id: "notif-4",
    title: "Payment Due Reminder",
    description: "Invoice INV-2026-079 (₹2,65,000) for Patel Residence is due in 3 days.",
    type: "payment",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    timestamp: "5 hours ago",
    read: true,
    action_url: "/studio/finance",
    action_label: "View Invoice",
  },
  {
    id: "notif-5",
    title: "Daily Site Log Uploaded",
    description:
      "Haresh Solanki uploaded 2 site photos for Patel Residence living ceiling framing.",
    type: "site_update",
    project_id: "proj-patel",
    project_title: "Patel Residence",
    timestamp: "Yesterday",
    read: true,
    action_url: "/studio/sites",
    action_label: "Inspect Log",
  },
];

export const INITIAL_AUDIT_LOG: StudioAuditEntry[] = [
  {
    id: "aud-1",
    timestamp: "2026-09-17 10:30:15",
    user_name: "Ira Kapoor (Owner)",
    action: "Quotation Updated",
    entity_type: "Quotation",
    entity_id: "quot-101",
    entity_title: "Patel Residence Estimate",
    detail: "Updated millwork item rate and confirmed final discount to ₹18,50,000.",
  },
  {
    id: "aud-2",
    timestamp: "2026-09-17 09:15:22",
    user_name: "Haresh Solanki",
    action: "Site Log Created",
    entity_type: "Site Update",
    entity_id: "site-1",
    entity_title: "Patel Residence",
    detail: "Added daily log for false ceiling GI channel installation with 2 site photos.",
  },
  {
    id: "aud-3",
    timestamp: "2026-09-16 17:40:00",
    user_name: "Nikhil Menon",
    action: "Material Ordered",
    entity_type: "Material",
    entity_id: "mat-5",
    entity_title: "Lumina 2700K Spotlights",
    detail: "Issued Purchase Order PO-2026-088 to Lumina Atelier for 64 units.",
  },
  {
    id: "aud-4",
    timestamp: "2026-09-16 14:10:05",
    user_name: "Ira Kapoor (Owner)",
    action: "Lead Converted",
    entity_type: "Lead",
    entity_id: "lead-won",
    entity_title: "Ananya Duplex",
    detail: "Converted lead Dr. Sameer Joshi into active client and created project AV-105.",
  },
  {
    id: "aud-5",
    timestamp: "2026-09-15 11:20:44",
    user_name: "Devanshi Shah",
    action: "Payment Recorded",
    entity_type: "Payment",
    entity_id: "pay-44",
    entity_title: "Patel Residence",
    detail: "Recorded RTGS payment receipt of ₹2,90,000 against INV-2026-079.",
  },
  {
    id: "aud-6",
    timestamp: "2026-09-14 16:05:30",
    user_name: "Ira Kapoor (Owner)",
    action: "Website Published",
    entity_type: "Website CMS",
    entity_id: "proj-patel",
    entity_title: "Patel Residence",
    detail: "Toggled 'Publish to Website' and 'Homepage Showcase' for Patel Residence.",
  },
];
