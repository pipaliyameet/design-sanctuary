// Right-Angle-Design-Studio Data Types & Initial Schema Models
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
  space_type: string;
  approx_budget: number;
  area_sqft: number;
  stage: "new" | "contacted" | "site_visit_scheduled" | "proposal_sent" | "negotiation" | "won" | "lost";
  priority: "low" | "medium" | "high" | "vip";
  source: string;
  assigned_to: string;
  notes: string;
  created_at: string;
  last_follow_up: string;
}

export interface StudioClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  city: string;
  total_spent: number;
  active_projects_count: number;
  status: "active" | "completed" | "prospect";
  avatar?: string;
  created_at: string;
}

export interface StudioDocument {
  id: string;
  project_id: string;
  project_name: string;
  title: string;
  category: "cad" | "render" | "boq" | "contract" | "invoice" | "spec_sheet" | "site_photo";
  file_url: string;
  file_type: string;
  file_size: string;
  version: string;
  uploaded_by: string;
  uploaded_at: string;
  is_approved: boolean;
}

export interface StudioQuotation {
  id: string;
  quotation_number: string;
  project_id: string;
  project_name: string;
  client_name: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "approved" | "revised" | "rejected";
  version: number;
  line_items: Array<{
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
}

export interface StudioMaterial {
  id: string;
  name: string;
  category: "stone" | "wood" | "metal" | "fabric" | "glass" | "lighting" | "sanitary" | "hardware";
  brand: string;
  vendor_name: string;
  unit_price: number;
  unit: string;
  sku: string;
  lead_time_days: number;
  sample_available: boolean;
  image_url: string;
  tags: string[];
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
  status: "active" | "preferred" | "under_review";
  total_orders_value: number;
}

export interface StudioFinanceRecord {
  id: string;
  type: "income" | "expense";
  category: string;
  project_id?: string;
  project_name?: string;
  description: string;
  amount: number;
  date: string;
  status: "cleared" | "pending" | "reconciled";
  invoice_ref?: string;
}

export interface StudioTeamMember {
  id: string;
  name: string;
  role: "Principal Architect" | "Senior Interior Designer" | "Project Manager" | "Site Supervisor" | "3D Visualizer" | "Accounts Lead";
  email: string;
  phone: string;
  active_projects: string[];
  capacity_percentage: number;
  avatar: string;
}

export interface StudioNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  is_read: boolean;
  category: "approval" | "finance" | "site" | "lead" | "deadline";
  link: string;
}

// Clean production initial arrays (zero fake data)
export const INITIAL_PROJECTS: StudioProject[] = [];
export const INITIAL_CLIENTS: StudioClient[] = [];
export const INITIAL_LEADS: StudioLead[] = [];
export const INITIAL_MEDIA: any[] = [];
export const INITIAL_DOCUMENTS: StudioDocument[] = [];
export const INITIAL_QUOTATIONS: StudioQuotation[] = [];
export const INITIAL_MATERIALS: StudioMaterial[] = [];
export const INITIAL_VENDORS: StudioVendor[] = [];
export const INITIAL_FINANCE_RECORDS: StudioFinanceRecord[] = [];
export const INITIAL_TEAM: StudioTeamMember[] = [];
export const INITIAL_NOTIFICATIONS: StudioNotification[] = [];
export const INITIAL_ACTIVITY_LOGS: Array<{
  id: string;
  user: string;
  action: string;
  detail: string;
  timestamp: string;
  project?: string;
}> = [];
