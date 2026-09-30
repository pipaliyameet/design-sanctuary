export type AppRole = "admin" | "designer" | "project_manager" | "accounts" | "client";

export interface SessionUser {
  userId: string;
  id: string;
  email: string;
  fullName: string;
  title: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  roles: AppRole[];
  isStaff: boolean;
  clientIds: string[];
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  details?: any;
}

export interface ProjectItem {
  _id?: string;
  id: string;
  title: string;
  code: string;
  slug?: string | null;
  clientId: string;
  clientName: string;
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
  status: "concept" | "design" | "procurement" | "execution" | "handover" | "completed" | "on_hold" | "lead" | "archived";
  stage?: string | null;
  health: "on_track" | "delayed" | "attention" | "ahead";
  leadDesignerName: string;
  projectManagerName?: string | null;
  siteSupervisorName?: string | null;
  coverImage: string;
  description?: string | null;
  brief?: string | null;
  isFeaturedOnWebsite: boolean;
  isOnHomepage: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface ClientItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface LeadItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface EnquiryItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface RoomItem {
  _id?: string;
  id: string;
  projectId: string;
  name: string;
  roomType: string;
  areaSqft: number;
  status: "planning" | "design" | "execution" | "completed";
  itemsCount: number;
  budget: number;
  sortOrder: number;
  heroImage?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface TaskItem {
  _id?: string;
  id: string;
  projectId: string;
  roomId?: string | null;
  title: string;
  description?: string | null;
  assigneeName?: string | null;
  assigneeId?: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface MediaItem {
  _id?: string;
  id: string;
  projectId?: string | null;
  roomId?: string | null;
  fileName: string;
  driveFileId: string;
  driveUrl: string;
  thumbnailUrl?: string | null;
  mimeType: string;
  size: number;
  category: "project_gallery" | "site_progress" | "render" | "material_sample" | "document" | "before_after" | "portfolio" | "general";
  caption?: string | null;
  alt?: string | null;
  visibility: "website" | "client_only" | "internal" | "private";
  isFeatured?: boolean;
  isCover?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface DesignFileItem {
  _id?: string;
  id: string;
  projectId: string;
  roomId?: string | null;
  title: string;
  category: string;
  fileUrl: string;
  driveFileId?: string | null;
  version: number;
  uploadedByName?: string | null;
  visibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface ApprovalCommentItem {
  id: string;
  authorId?: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  [key: string]: any;
}

export interface ApprovalItem {
  _id?: string;
  id: string;
  projectId: string;
  roomId?: string | null;
  designFileId?: string | null;
  title: string;
  notes?: string | null;
  status: "pending" | "approved" | "changes_requested";
  requestedAt: string;
  decidedAt?: string | null;
  decidedByName?: string | null;
  comments?: ApprovalCommentItem[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface SiteUpdateItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface DocumentItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface QuotationItem {
  _id?: string;
  id: string;
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
    [key: string]: any;
  }>;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface InvoiceItem {
  _id?: string;
  id: string;
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
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface PaymentItem {
  _id?: string;
  id: string;
  projectId: string;
  invoiceId?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  status: "completed" | "pending" | "failed";
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface ExpenseItem {
  _id?: string;
  id: string;
  projectId?: string | null;
  category: string;
  amount: number;
  date: string;
  paidTo: string;
  description: string;
  receiptUrl?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface BoqItem {
  _id?: string;
  id: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface MaterialItem {
  _id?: string;
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface VendorItem {
  _id?: string;
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  rating: number;
  activeOrders: number;
  address?: string | null;
  gstNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface TeamMemberItem {
  _id?: string;
  id: string;
  userId?: string | null;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "on_site" | "leave";
  assignedProjects: string[];
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface NotificationItem {
  _id?: string;
  id: string;
  userId?: string | null;
  title: string;
  description: string;
  type: string;
  isRead?: boolean;
  read?: boolean;
  link?: string | null;
  createdAt?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ActivityLogItem {
  _id?: string;
  id: string;
  projectId?: string | null;
  actorId?: string | null;
  actorLabel: string;
  action: string;
  entity: string;
  entityId?: string | null;
  entityTitle?: string | null;
  detail?: string | null;
  createdAt: string;
  [key: string]: any;
}

export interface CaseCard {
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  year: number;
  hero_image: string;
  summary: string;
  space_type: string;
  style: string;
  area_sqft: number;
  featured: boolean;
  published_at: string;
  [key: string]: any;
}

export interface CaseStudyDetail extends CaseCard {
  client_brief?: string;
  concept?: string;
  execution?: string;
  palette?: Array<{ name: string; hex: string; role: string }>;
  specifications?: Array<{ label: string; value: string }>;
  gallery?: Array<{ url: string; caption: string; space: string }>;
  materials?: Array<{ name: string; type: string; provenance: string }>;
  testimonial?: { quote: string; author: string; role: string };
  [key: string]: any;
}

