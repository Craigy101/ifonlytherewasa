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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: number
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          depth: number
          id: string
          is_deleted: boolean
          like_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          depth?: number
          id?: string
          is_deleted?: boolean
          like_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          depth?: number
          id?: string
          is_deleted?: boolean
          like_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_profiles: {
        Row: {
          bio: string | null
          created_at: string
          github_username: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          github_username?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          github_username?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_technologies: {
        Row: {
          developer_profile_id: string
          technology_id: number
        }
        Insert: {
          developer_profile_id: string
          technology_id: number
        }
        Update: {
          developer_profile_id?: string
          technology_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "developer_technologies_developer_profile_id_fkey"
            columns: ["developer_profile_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "developer_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          body: string
          contact_ok: boolean
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          contact_ok?: boolean
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          contact_ok?: boolean
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          recipient_id: string
          search_index_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          recipient_id: string
          search_index_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          recipient_id?: string
          search_index_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_search_index_id_fkey"
            columns: ["search_index_id"]
            isOneToOne: false
            referencedRelation: "search_indices"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category_id: number
          post_id: string
        }
        Insert: {
          category_id: number
          post_id: string
        }
        Update: {
          category_id?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          comment_count: number
          created_at: string
          current_solution: string | null
          edited_at: string | null
          fts: unknown
          id: string
          is_deleted: boolean
          is_solved: boolean
          popularity_score: number
          product_type: Database["public"]["Enums"]["product_type"] | null
          reaction_bad: number
          reaction_meh: number
          reaction_nice: number
          reaction_pay: number
          slug: string
          solved_at: string | null
          solved_by: string | null
          solved_vote_count: number
          time_spent_weekly: string | null
          title: string
          updated_at: string
          view_count: number
          weekly_pay_usd: number | null
        }
        Insert: {
          author_id: string
          body: string
          comment_count?: number
          created_at?: string
          current_solution?: string | null
          edited_at?: string | null
          fts?: unknown
          id?: string
          is_deleted?: boolean
          is_solved?: boolean
          popularity_score?: number
          product_type?: Database["public"]["Enums"]["product_type"] | null
          reaction_bad?: number
          reaction_meh?: number
          reaction_nice?: number
          reaction_pay?: number
          slug: string
          solved_at?: string | null
          solved_by?: string | null
          solved_vote_count?: number
          time_spent_weekly?: string | null
          title: string
          updated_at?: string
          view_count?: number
          weekly_pay_usd?: number | null
        }
        Update: {
          author_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          current_solution?: string | null
          edited_at?: string | null
          fts?: unknown
          id?: string
          is_deleted?: boolean
          is_solved?: boolean
          popularity_score?: number
          product_type?: Database["public"]["Enums"]["product_type"] | null
          reaction_bad?: number
          reaction_meh?: number
          reaction_nice?: number
          reaction_pay?: number
          slug?: string
          solved_at?: string | null
          solved_by?: string | null
          solved_vote_count?: number
          time_spent_weekly?: string | null
          title?: string
          updated_at?: string
          view_count?: number
          weekly_pay_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
          username_lower: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
          username_lower?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
          username_lower?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index_matches: {
        Row: {
          created_at: string
          email_sent: boolean
          email_sent_at: string | null
          id: string
          post_id: string
          search_index_id: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          post_id: string
          search_index_id: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          post_id?: string
          search_index_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_index_matches_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_index_matches_search_index_id_fkey"
            columns: ["search_index_id"]
            isOneToOne: false
            referencedRelation: "search_indices"
            referencedColumns: ["id"]
          },
        ]
      }
      search_indices: {
        Row: {
          category_ids: number[]
          created_at: string
          developer_profile_id: string
          id: string
          is_active: boolean
          is_free: boolean
          keyword_patterns: string[]
          min_pay_reactions: number | null
          min_weekly_pay_usd: number | null
          name: string
          product_types: Database["public"]["Enums"]["product_type"][]
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          category_ids?: number[]
          created_at?: string
          developer_profile_id: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          keyword_patterns?: string[]
          min_pay_reactions?: number | null
          min_weekly_pay_usd?: number | null
          name: string
          product_types?: Database["public"]["Enums"]["product_type"][]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          category_ids?: number[]
          created_at?: string
          developer_profile_id?: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          keyword_patterns?: string[]
          min_pay_reactions?: number | null
          min_weekly_pay_usd?: number | null
          name?: string
          product_types?: Database["public"]["Enums"]["product_type"][]
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_indices_developer_profile_id_fkey"
            columns: ["developer_profile_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solved_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solved_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solved_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technologies: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          is_custom: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          is_custom?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          is_custom?: boolean
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "technologies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_popularity_score: {
        Args: {
          p_bad: number
          p_comment_count: number
          p_created_at: string
          p_meh: number
          p_nice: number
          p_pay: number
        }
        Returns: number
      }
      increment_post_view: { Args: { p_post_id: string }; Returns: undefined }
      match_posts_to_search_indices: {
        Args: never
        Returns: {
          new_matches_count: number
        }[]
      }
      recalculate_all_popularity: { Args: never; Returns: undefined }
      run_post_matching: { Args: never; Returns: number }
      search_posts: {
        Args: {
          result_limit?: number
          result_offset?: number
          search_query: string
        }
        Returns: {
          author_id: string
          body: string
          comment_count: number
          created_at: string
          current_solution: string
          id: string
          rank: number
          reaction_bad: number
          reaction_meh: number
          reaction_nice: number
          reaction_pay: number
          slug: string
          title: string
        }[]
      }
      search_usernames: {
        Args: { query: string; result_limit?: number }
        Returns: {
          id: string
          username: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      notification_type:
        | "mention"
        | "reply_post"
        | "reply_comment"
        | "search_match"
      product_type:
        | "website"
        | "app"
        | "desktop_app"
        | "hardware"
        | "physical_product"
        | "automation"
        | "ai_model"
      reaction_type: "pay" | "nice" | "meh" | "bad"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      notification_type: [
        "mention",
        "reply_post",
        "reply_comment",
        "search_match",
      ],
      product_type: [
        "website",
        "app",
        "desktop_app",
        "hardware",
        "physical_product",
        "automation",
        "ai_model",
      ],
      reaction_type: ["pay", "nice", "meh", "bad"],
    },
  },
} as const
