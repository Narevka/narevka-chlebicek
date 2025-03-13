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
      agent_sources: {
        Row: {
          agent_id: string
          chars: number
          content: string
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          chars?: number
          content: string
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          chars?: number
          content?: string
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_sources_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean
          is_public: boolean
          name: string
          openai_assistant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_public?: boolean
          name: string
          openai_assistant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_public?: boolean
          name?: string
          openai_assistant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_analytics: {
        Row: {
          agent_id: string | null
          country: string | null
          created_at: string
          date: string
          id: string
          thumbs_down: number
          thumbs_up: number
          total_chats: number
          total_messages: number
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          country?: string | null
          created_at?: string
          date: string
          id?: string
          thumbs_down?: number
          thumbs_up?: number
          total_chats?: number
          total_messages?: number
          user_id: string
        }
        Update: {
          agent_id?: string | null
          country?: string | null
          created_at?: string
          date?: string
          id?: string
          thumbs_down?: number
          thumbs_up?: number
          total_chats?: number
          total_messages?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          source: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          confidence: number | null
          content: string
          conversation_id: string
          created_at: string
          has_thumbs_down: boolean | null
          has_thumbs_up: boolean | null
          id: string
          is_bot: boolean
        }
        Insert: {
          confidence?: number | null
          content: string
          conversation_id: string
          created_at?: string
          has_thumbs_down?: boolean | null
          has_thumbs_up?: boolean | null
          id?: string
          is_bot?: boolean
        }
        Update: {
          confidence?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          has_thumbs_down?: boolean | null
          has_thumbs_up?: boolean | null
          id?: string
          is_bot?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sentiment_analytics: {
        Row: {
          agent_id: string | null
          created_at: string
          date: string
          id: string
          negative: number
          neutral: number
          positive: number
          unspecified: number
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          date: string
          id?: string
          negative?: number
          neutral?: number
          positive?: number
          unspecified?: number
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          date?: string
          id?: string
          negative?: number
          neutral?: number
          positive?: number
          unspecified?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_analytics: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          topic_id: string | null
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          id?: string
          topic_id?: string | null
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_analytics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          agent_id: string | null
          count: number
          created_at: string
          frozen: boolean
          id: string
          name: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          count?: number
          created_at?: string
          frozen?: boolean
          id?: string
          name: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          count?: number
          created_at?: string
          frozen?: boolean
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
