export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_label: string
          created_at: string
          detail: string | null
          entity: string
          entity_id: string | null
          id: string
          project_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_label?: string
          created_at?: string
          detail?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          project_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_label?: string
          created_at?: string
          detail?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_comments: {
        Row: {
          approval_id: string
          author_id: string | null
          author_name: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          approval_id: string
          author_id?: string | null
          author_name?: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          approval_id?: string
          author_id?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_comments_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          decided_at: string | null
          decided_by_name: string | null
          design_file_id: string | null
          id: string
          notes: string | null
          project_id: string
          requested_at: string
          room_id: string | null
          status: Database["public"]["Enums"]["approval_status"]
          title: string
        }
        Insert: {
          decided_at?: string | null
          decided_by_name?: string | null
          design_file_id?: string | null
          id?: string
          notes?: string | null
          project_id: string
          requested_at?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          title: string
        }
        Update: {
          decided_at?: string | null
          decided_by_name?: string | null
          design_file_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          requested_at?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_design_file_id_fkey"
            columns: ["design_file_id"]
            isOneToOne: false
            referencedRelation: "design_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_items: {
        Row: {
          amount: number | null
          category: string
          created_at: string
          description: string
          id: string
          project_id: string
          quantity: number
          rate: number
          room_id: string | null
          unit: string
        }
        Insert: {
          amount?: number | null
          category?: string
          created_at?: string
          description: string
          id?: string
          project_id: string
          quantity?: number
          rate?: number
          room_id?: string | null
          unit?: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          project_id?: string
          quantity?: number
          rate?: number
          room_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          area_sqft: number | null
          brief: string | null
          credits: Json
          featured: boolean
          gallery: Json
          hero_image: string | null
          id: string
          location: string | null
          materials: string[]
          project_id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          solution: string | null
          space_type: string | null
          style: string | null
          subtitle: string | null
          summary: string | null
          title: string
          year: number | null
        }
        Insert: {
          area_sqft?: number | null
          brief?: string | null
          credits?: Json
          featured?: boolean
          gallery?: Json
          hero_image?: string | null
          id?: string
          location?: string | null
          materials?: string[]
          project_id: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          solution?: string | null
          space_type?: string | null
          style?: string | null
          subtitle?: string | null
          summary?: string | null
          title: string
          year?: number | null
        }
        Update: {
          area_sqft?: number | null
          brief?: string | null
          credits?: Json
          featured?: boolean
          gallery?: Json
          hero_image?: string | null
          id?: string
          location?: string | null
          materials?: string[]
          project_id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          solution?: string | null
          space_type?: string | null
          style?: string | null
          subtitle?: string | null
          summary?: string | null
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      design_files: {
        Row: {
          created_at: string
          file_url: string
          id: string
          kind: string
          project_id: string
          room_id: string | null
          title: string
          uploaded_by_name: string | null
          version: number
          visible_to_client: boolean
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          kind?: string
          project_id: string
          room_id?: string | null
          title: string
          uploaded_by_name?: string | null
          version?: number
          visible_to_client?: boolean
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          kind?: string
          project_id?: string
          room_id?: string | null
          title?: string
          uploaded_by_name?: string | null
          version?: number
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "design_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_files_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_url: string
          id: string
          kind: string
          project_id: string
          title: string
          uploaded_by_name: string | null
          visible_to_client: boolean
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          kind?: string
          project_id: string
          title: string
          uploaded_by_name?: string | null
          visible_to_client?: boolean
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          kind?: string
          project_id?: string
          title?: string
          uploaded_by_name?: string | null
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          budget_band: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          source: string
          space_type: string | null
          status: string
        }
        Insert: {
          budget_band?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          source?: string
          space_type?: string | null
          status?: string
        }
        Update: {
          budget_band?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          source?: string
          space_type?: string | null
          status?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number
          created_at: string
          due_at: string | null
          id: string
          issued_at: string | null
          milestone: string
          number: string
          project_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          tax_percent: number
          total: number
        }
        Insert: {
          amount?: number
          amount_paid?: number
          created_at?: string
          due_at?: string | null
          id?: string
          issued_at?: string | null
          milestone?: string
          number: string
          project_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_percent?: number
          total?: number
        }
        Update: {
          amount?: number
          amount_paid?: number
          created_at?: string
          due_at?: string | null
          id?: string
          issued_at?: string | null
          milestone?: string
          number?: string
          project_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_percent?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_posts: {
        Row: {
          author: string
          body: string | null
          category: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          read_minutes: number
          slug: string
          title: string
        }
        Insert: {
          author?: string
          body?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug: string
          title: string
        }
        Update: {
          author?: string
          body?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget_band: string | null
          city: string | null
          client_id: string | null
          created_at: string
          email: string
          enquiry_id: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          space_type: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
          value_estimate: number
        }
        Insert: {
          budget_band?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          enquiry_id?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          space_type?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          value_estimate?: number
        }
        Update: {
          budget_band?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          enquiry_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          space_type?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          value_estimate?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          id: string
          kind: string
          project_id: string | null
          tags: string[]
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          project_id?: string | null
          tags?: string[]
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          project_id?: string | null
          tags?: string[]
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience: Database["public"]["Enums"]["app_role"] | null
          body: string | null
          created_at: string
          id: string
          link: string | null
          project_id: string | null
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          project_id?: string | null
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          project_id?: string | null
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          paid_at: string
          project_id: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          paid_at?: string
          project_id: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          paid_at?: string
          project_id?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      po_items: {
        Row: {
          description: string
          id: string
          purchase_order_id: string
          quantity: number
          rate: number
          unit: string
        }
        Insert: {
          description: string
          id?: string
          purchase_order_id: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Update: {
          description?: string
          id?: string
          purchase_order_id?: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          title?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          area_sqft: number
          brief: string | null
          budget_amount: number
          budget_band: string
          city: string
          client_id: string
          code: string
          cover_image: string | null
          created_at: string
          id: string
          is_active: boolean
          lead_designer_id: string | null
          lead_designer_name: string | null
          progress: number
          slug: string
          space_type: string
          stage: Database["public"]["Enums"]["project_stage"]
          start_date: string | null
          style: string
          target_date: string | null
          title: string
        }
        Insert: {
          area_sqft?: number
          brief?: string | null
          budget_amount?: number
          budget_band?: string
          city?: string
          client_id: string
          code: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          lead_designer_id?: string | null
          lead_designer_name?: string | null
          progress?: number
          slug: string
          space_type?: string
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string | null
          style?: string
          target_date?: string | null
          title: string
        }
        Update: {
          area_sqft?: number
          brief?: string | null
          budget_amount?: number
          budget_band?: string
          city?: string
          client_id?: string
          code?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          lead_designer_id?: string | null
          lead_designer_name?: string | null
          progress?: number
          slug?: string
          space_type?: string
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string | null
          style?: string
          target_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_at: string | null
          id: string
          number: string
          project_id: string
          status: string
          total: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          expected_at?: string | null
          id?: string
          number: string
          project_id: string
          status?: string
          total?: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          expected_at?: string | null
          id?: string
          number?: string
          project_id?: string
          status?: string
          total?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          id: string
          issued_at: string | null
          notes: string | null
          number: string
          project_id: string
          status: string
          subtotal: number
          tax_percent: number
          total: number
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          number: string
          project_id: string
          status?: string
          subtotal?: number
          tax_percent?: number
          total?: number
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issued_at?: string | null
          notes?: string | null
          number?: string
          project_id?: string
          status?: string
          subtotal?: number
          tax_percent?: number
          total?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          area_sqft: number
          id: string
          name: string
          project_id: string
          room_type: string
          sort_order: number
          status: string
        }
        Insert: {
          area_sqft?: number
          id?: string
          name: string
          project_id: string
          room_type?: string
          sort_order?: number
          status?: string
        }
        Update: {
          area_sqft?: number
          id?: string
          name?: string
          project_id?: string
          room_type?: string
          sort_order?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_updates: {
        Row: {
          body: string | null
          created_at: string
          created_by_name: string | null
          id: string
          image_url: string | null
          progress: number | null
          project_id: string
          title: string
          visible_to_client: boolean
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by_name?: string | null
          id?: string
          image_url?: string | null
          progress?: number | null
          project_id: string
          title: string
          visible_to_client?: boolean
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by_name?: string | null
          id?: string
          image_url?: string | null
          progress?: number | null
          project_id?: string
          title?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "site_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          room_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          city: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          rating: number
        }
        Insert: {
          category?: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          rating?: number
        }
        Update: {
          category?: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          created_at: string
          delivery_note: string | null
          delivery_status: string
          generated_at: string
          id: string
          payload: Json
          week_start: string
        }
        Insert: {
          created_at?: string
          delivery_note?: string | null
          delivery_status?: string
          generated_at?: string
          id?: string
          payload?: Json
          week_start: string
        }
        Update: {
          created_at?: string
          delivery_note?: string | null
          delivery_status?: string
          generated_at?: string
          id?: string
          payload?: Json
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_weekly_summary: {
        Args: never
        Returns: {
          created_at: string
          delivery_note: string | null
          delivery_status: string
          generated_at: string
          id: string
          payload: Json
          week_start: string
        }
        SetofOptions: {
          from: "*"
          to: "weekly_summaries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      owns_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "designer" | "project_manager" | "accounts" | "client"
      approval_status: "pending" | "approved" | "changes_requested"
      invoice_status: "draft" | "sent" | "partial" | "paid" | "overdue"
      lead_stage:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "won"
        | "lost"
      project_stage:
        | "brief"
        | "concept"
        | "design_development"
        | "execution"
        | "handover"
        | "completed"
      task_status: "todo" | "in_progress" | "blocked" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "designer", "project_manager", "accounts", "client"],
      approval_status: ["pending", "approved", "changes_requested"],
      invoice_status: ["draft", "sent", "partial", "paid", "overdue"],
      lead_stage: ["new", "contacted", "qualified", "proposal", "won", "lost"],
      project_stage: [
        "brief",
        "concept",
        "design_development",
        "execution",
        "handover",
        "completed",
      ],
      task_status: ["todo", "in_progress", "blocked", "done"],
    },
  },
} as const
