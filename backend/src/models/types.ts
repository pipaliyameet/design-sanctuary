import { ObjectId } from "mongodb";

export type AppRole = "admin" | "designer" | "project_manager" | "accounts" | "client";

export interface UserDoc {
  _id?: ObjectId | string;
  email: string;
  passwordHash: string;
  fullName: string;
  title?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: AppRole[];
  isStaff: boolean;
  clientIds?: string[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDoc {
  _id?: ObjectId | string;
  name: string;
  primaryContactName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  billingAddress?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  status: "lead" | "onboarding" | "active" | "completed" | "inactive";
  associatedProjectIds?: string[];
  portalAccessEnabled: boolean;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnquiryDoc {
  _id?: ObjectId | string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  spaceType?: string | null;
  scope?: string | null;
  budgetBand?: string | null;
  estimatedTimeline?: string | null;
  notes?: string | null;
  status: "new" | "contacted" | "qualified" | "converted" | "declined" | "closed";
  source?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadDoc {
  _id?: ObjectId | string;
  clientId?: string | null;
  title: string;
  contactName: string;
  email: string;
  phone: string;
  spaceType: string;
  scope: string;
  budgetBand: string;
  estimatedValue?: number | null;
  stage: "enquiry" | "consultation" | "proposal" | "negotiation" | "won" | "lost";
  probabilityPct?: number | null;
  targetStartDate?: string | null;
  locationCity?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  notes?: string | null;
  status: "active" | "won" | "lost" | "on_hold";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDoc {
  _id?: ObjectId | string;
  clientId: string;
  clientName: string;
  title: string;
  slug?: string | null;
  code: string;
  status: "concept" | "design" | "procurement" | "execution" | "handover" | "completed" | "on_hold" | "lead" | "archived";
  stage?: string | null;
  spaceType: string;
  scope: string;
  locationCity: string;
  locationAddress?: string | null;
  areaSqft: number;
  contractValue: number;
  collectedAmount: number;
  startDate: string;
  targetHandoverDate: string;
  actualHandoverDate?: string | null;
  progressPercentage: number;
  leadDesignerId?: string | null;
  leadDesignerName: string;
  projectManagerName?: string | null;
  siteSupervisorName?: string | null;
  isActive: boolean;
  isFeaturedOnWebsite: boolean;
  isOnHomepage: boolean;
  coverImage: string;
  health: "on_track" | "delayed" | "attention" | "ahead";
  brief?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomDoc {
  _id?: ObjectId | string;
  projectId: string;
  name: string;
  roomType: string;
  areaSqft: number;
  status: "planning" | "design" | "execution" | "completed";
  itemsCount: number;
  budget: number;
  sortOrder: number;
  heroImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDoc {
  _id?: ObjectId | string;
  projectId: string;
  roomId?: string | null;
  title: string;
  description?: string | null;
  assigneeName?: string | null;
  assigneeId?: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaDoc {
  _id?: ObjectId | string;
  projectId?: string | null;
  roomId?: string | null;
  fileName: string;
  driveFileId: string;
  driveUrl: string;
  thumbnailUrl?: string | null;
  mimeType: string;
  size: number;
  category: "project_gallery" | "site_progress" | "render" | "material_sample" | "document" | "before_after" | "portfolio" | "general" | string;
  title?: string | null;
  caption?: string | null;
  description?: string | null;
  alt?: string | null;
  tags?: string[];
  room?: string | null;
  mediaType?: "image" | "video" | "floor_plan" | "render" | "before_after" | "document" | string;
  visibility: "website" | "client_only" | "internal" | "private";
  isFeatured?: boolean;
  isCover?: boolean;
  isHomepageVisible?: boolean;
  homepageOrder?: number;
  status?: "active" | "archived" | "deleted" | string;
  uploadedBy?: string | null;
  publicUrl?: string | null;
  streamUrl?: string | null;
  sortOrder?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  driveViewUrl?: string;
  directUrl?: string;
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignFileDoc {
  _id?: ObjectId | string;
  projectId: string;
  roomId?: string | null;
  title: string;
  category: "moodboard" | "cad_layout" | "3d_render" | "elevation" | "specification" | "shop_drawing" | "other";
  fileUrl: string;
  driveFileId?: string | null;
  version: number;
  uploadedByName?: string | null;
  visibleToClient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalCommentDoc {
  id: string;
  authorId?: string | null;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface ApprovalDoc {
  _id?: ObjectId | string;
  projectId: string;
  roomId?: string | null;
  designFileId?: string | null;
  title: string;
  notes?: string | null;
  status: "pending" | "approved" | "changes_requested";
  requestedAt: Date;
  decidedAt?: Date | null;
  decidedByName?: string | null;
  comments?: ApprovalCommentDoc[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDoc {
  _id?: ObjectId | string;
  projectId: string;
  projectTitle?: string | null;
  title: string;
  category: string;
  version: string;
  fileUrl: string;
  driveFileId?: string | null;
  fileSize?: string | null;
  fileType?: string | null;
  uploadedBy?: string | null;
  status: "draft" | "review_pending" | "approved" | "superseded";
  isApproved: boolean;
  visibleToClient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceDoc {
  _id?: ObjectId | string;
  projectId: string;
  clientId?: string | null;
  invoiceNumber: string;
  title?: string | null;
  milestoneTitle: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  issuedDate: string;
  dueDate: string;
  pdfUrl?: string | null;
  driveFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDoc {
  _id?: ObjectId | string;
  projectId: string;
  invoiceId?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: "bank_transfer" | "cheque" | "upi" | "card" | "cash";
  referenceNumber?: string | null;
  status: "completed" | "pending" | "failed";
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationDoc {
  _id?: ObjectId | string;
  projectId: string;
  quotationNumber: string;
  version: number;
  title: string;
  clientName?: string | null;
  status: "draft" | "sent" | "approved" | "rejected" | "superseded";
  totalAmount: number;
  validUntil: string;
  items: Array<{
    id: string;
    room?: string | null;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    total: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoqItemDoc {
  _id?: ObjectId | string;
  projectId: string;
  roomId?: string | null;
  category: string;
  itemCode?: string | null;
  description: string;
  specification?: string | null;
  quantity: number;
  unit: string;
  estimatedRate: number;
  actualRate?: number | null;
  vendorId?: string | null;
  status: "specified" | "approved" | "ordered" | "delivered" | "installed";
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteUpdateDoc {
  _id?: ObjectId | string;
  projectId: string;
  projectTitle?: string | null;
  date: string;
  weekNumber?: number;
  summary: string;
  workCompleted: string[];
  blockers?: string[];
  nextAction?: string | null;
  authorName: string;
  photos: string[];
  driveFileIds?: string[];
  clientVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseDoc {
  _id?: ObjectId | string;
  projectId?: string | null;
  category: string;
  amount: number;
  date: string;
  paidTo: string;
  description: string;
  receiptUrl?: string | null;
  approvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialDoc {
  _id?: ObjectId | string;
  name: string;
  category: string;
  image: string;
  driveFileId?: string | null;
  description: string;
  provenance: string;
  vendorName?: string | null;
  sampleLocation?: string | null;
  costRange?: string | null;
  projectSlug?: string | null;
  projectTitle?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorDoc {
  _id?: ObjectId | string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  rating: number;
  activeOrders: number;
  address?: string | null;
  gstNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberDoc {
  _id?: ObjectId | string;
  userId?: string | null;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "on_site" | "leave";
  assignedProjects: string[];
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLogDoc {
  _id?: ObjectId | string;
  projectId?: string | null;
  actorId?: string | null;
  actorLabel: string;
  action: string;
  entity: string;
  entityId?: string | null;
  entityTitle?: string | null;
  detail?: string | null;
  createdAt: Date;
}

export interface NotificationDoc {
  _id?: ObjectId | string;
  userId?: string | null;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "approval" | "finance";
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface WeeklySummaryDoc {
  _id?: ObjectId | string;
  weekNumber: number;
  year: number;
  periodLabel: string;
  payload: Record<string, any>;
  computedAt: Date;
}

export interface CaseStudyDoc {
  _id?: ObjectId | string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  year: number;
  heroImage: string;
  summary: string;
  spaceType: string;
  style: string;
  areaSqft: number;
  featured: boolean;
  publishedAt: string;
  clientBrief?: string;
  concept?: string;
  execution?: string;
  palette?: Array<{ name: string; hex: string; role: string }>;
  specifications?: Array<{ label: string; value: string }>;
  gallery?: Array<{ url: string; caption: string; space: string }>;
  materials?: Array<{ name: string; type: string; provenance: string }>;
  testimonial?: { quote: string; author: string; role: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPostDoc {
  _id?: ObjectId | string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readingTimeMinutes: number;
  publishedAt: string;
  category: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettingsDoc {
  _id?: ObjectId | string;
  key: string;
  value: Record<string, any>;
  updatedAt: Date;
}

export interface ServiceDoc {
  _id?: ObjectId | string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  image: string;
  driveFileId?: string | null;
  link: string;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessStepDoc {
  _id?: ObjectId | string;
  number: string;
  title: string;
  description: string;
  timeline: string;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialDoc {
  _id?: ObjectId | string;
  clientName: string;
  project: string;
  location: string;
  text: string;
  quote?: string;
  role?: string;
  approved: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
