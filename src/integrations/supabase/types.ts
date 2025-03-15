export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      article_bookmarks: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "health_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          messages: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cycle_entries: {
        Row: {
          created_at: string
          cycle_day: number | null
          cycle_phase: Database["public"]["Enums"]["cycle_phase"] | null
          date: string
          flow_intensity: Database["public"]["Enums"]["flow_intensity"]
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_day?: number | null
          cycle_phase?: Database["public"]["Enums"]["cycle_phase"] | null
          date: string
          flow_intensity?: Database["public"]["Enums"]["flow_intensity"]
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_day?: number | null
          cycle_phase?: Database["public"]["Enums"]["cycle_phase"] | null
          date?: string
          flow_intensity?: Database["public"]["Enums"]["flow_intensity"]
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cycle_statistics: {
        Row: {
          average_cycle_length: number | null
          average_period_length: number | null
          created_at: string
          id: string
          last_cycle_start_date: string | null
          next_predicted_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cycle_length?: number | null
          average_period_length?: number | null
          created_at?: string
          id?: string
          last_cycle_start_date?: string | null
          next_predicted_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cycle_length?: number | null
          average_period_length?: number | null
          created_at?: string
          id?: string
          last_cycle_start_date?: string | null
          next_predicted_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          description: string
          feedback_type: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          feedback_type: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          feedback_type?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
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
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          reading_time: number
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          reading_time?: number
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          reading_time?: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_history: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          taken: boolean
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          taken?: boolean
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          taken?: boolean
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_history_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          start_date: string
          time_of_day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          start_date: string
          time_of_day: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          time_of_day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          date: string
          energy_score: number | null
          id: string
          mood_score: number | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          energy_score?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_score?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      symptom_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          severity: number | null
          symptom_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          severity?: number | null
          symptom_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          severity?: number | null
          symptom_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cycle_phase: "menstrual" | "follicular" | "ovulation" | "luteal"
      flow_intensity: "none" | "light" | "medium" | "heavy" | "very_heavy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
