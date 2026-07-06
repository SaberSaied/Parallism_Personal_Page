export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string;
          content: string;
          created_at: string;
          date: string;
          description: string;
          id: string;
          image: string;
          likes: number;
          link: string | null;
          progress: number | null;
          slug: string;
          status: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          content: string;
          created_at?: string;
          date: string;
          description: string;
          id?: string;
          image: string;
          likes?: number;
          link?: string | null;
          progress?: number | null;
          slug: string;
          status?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content?: string;
          created_at?: string;
          date?: string;
          description?: string;
          id?: string;
          image?: string;
          likes?: number;
          link?: string | null;
          progress?: number | null;
          slug?: string;
          status?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          action: string;
          actor_email: string | null;
          actor_id: string;
          created_at: string;
          diff: Json | null;
          entity_id: string;
          entity_type: string;
          id: string;
          summary: string;
        };
        Insert: {
          action: string;
          actor_email?: string | null;
          actor_id: string;
          created_at?: string;
          diff?: Json | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          summary: string;
        };
        Update: {
          action?: string;
          actor_email?: string | null;
          actor_id?: string;
          created_at?: string;
          diff?: Json | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          summary?: string;
        };
        Relationships: [];
      };
      citizen_requests: {
        Row: {
          admin_notes: string;
          assigned_to: string;
          attachments: string[];
          category: string;
          citizen_civil_id: string;
          citizen_email: string | null;
          citizen_name: string;
          citizen_phone: string;
          created_at: string;
          description: string;
          id: string;
          status: Database["public"]["Enums"]["request_status"];
          title: string;
          tracking_number: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string;
          assigned_to?: string;
          attachments?: string[];
          category: string;
          citizen_civil_id: string;
          citizen_email?: string | null;
          citizen_name: string;
          citizen_phone: string;
          created_at?: string;
          description: string;
          id?: string;
          status?: Database["public"]["Enums"]["request_status"];
          title: string;
          tracking_number: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string;
          assigned_to?: string;
          attachments?: string[];
          category?: string;
          citizen_civil_id?: string;
          citizen_email?: string | null;
          citizen_name?: string;
          citizen_phone?: string;
          created_at?: string;
          description?: string;
          id?: string;
          status?: Database["public"]["Enums"]["request_status"];
          title?: string;
          tracking_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          category: string;
          created_at: string;
          date: string;
          id: string;
          image_url: string;
          title: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          date: string;
          id?: string;
          image_url: string;
          title: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          date?: string;
          id?: string;
          image_url?: string;
          title?: string;
        };
        Relationships: [];
      };
      initiatives: {
        Row: {
          category: string;
          content: string;
          created_at: string;
          date: string;
          description: string;
          id: string;
          image: string;
          progress: number;
          slug: string;
          status: Database["public"]["Enums"]["initiative_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          content: string;
          created_at?: string;
          date: string;
          description: string;
          id?: string;
          image: string;
          progress?: number;
          slug: string;
          status?: Database["public"]["Enums"]["initiative_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content?: string;
          created_at?: string;
          date?: string;
          description?: string;
          id?: string;
          image?: string;
          progress?: number;
          slug?: string;
          status?: Database["public"]["Enums"]["initiative_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      parliament_info: {
        Row: {
          bio: string;
          email: string;
          id: string;
          name: string;
          office_address: string;
          phone: string;
          social_media: Json;
          title: string;
          updated_at: string;
          working_hours: string;
        };
        Insert: {
          bio: string;
          email: string;
          id?: string;
          name: string;
          office_address: string;
          phone: string;
          social_media?: Json;
          title: string;
          updated_at?: string;
          working_hours: string;
        };
        Update: {
          bio?: string;
          email?: string;
          id?: string;
          name?: string;
          office_address?: string;
          phone?: string;
          social_media?: Json;
          title?: string;
          updated_at?: string;
          working_hours?: string;
        };
        Relationships: [];
      };
      statistics: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          label: string;
          sort_order: number;
          value: string;
        };
        Insert: {
          created_at?: string;
          icon: string;
          id?: string;
          label: string;
          sort_order?: number;
          value: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          value?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar: string;
          created_at: string;
          id: string;
          name: string;
          role: string;
          text: string;
        };
        Insert: {
          avatar: string;
          created_at?: string;
          id?: string;
          name: string;
          role: string;
          text: string;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          id?: string;
          name?: string;
          role?: string;
          text?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          sort_order: number;
          title: string;
          year: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          sort_order?: number;
          title: string;
          year: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          sort_order?: number;
          title?: string;
          year?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bootstrap_admin: { Args: never; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      initiative_status: "نشط" | "مكتمل" | "مخطط له";
      request_status:
        "submitted" | "under_review" | "assigned" | "in_progress" | "resolved" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      initiative_status: ["نشط", "مكتمل", "مخطط له"],
      request_status: [
        "submitted",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
    },
  },
} as const;
