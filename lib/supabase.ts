import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          title: string
          description: string | null
          creator_email: string
          creator_name: string
          max_vote_balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          description?: string | null
          creator_email: string
          creator_name: string
          max_vote_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          description?: string | null
          creator_email?: string
          creator_name?: string
          max_vote_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          event_id: string
          vote_balance: number
          is_active: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          vote_balance?: number
          is_active?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          vote_balance?: number
          is_active?: boolean
          joined_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          event_id: string
          title: string
          type: "quiz" | "voting"
          voting_mode: "single" | "multi"
          time_limit: number
          votes_required: number
          is_active: boolean
          is_completed: boolean
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          type: "quiz" | "voting"
          voting_mode: "single" | "multi"
          time_limit?: number
          votes_required?: number
          is_active?: boolean
          is_completed?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          type?: "quiz" | "voting"
          voting_mode?: "single" | "multi"
          time_limit?: number
          votes_required?: number
          is_active?: boolean
          is_completed?: boolean
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      task_options: {
        Row: {
          id: string
          task_id: string
          text: string
          is_correct: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          text: string
          is_correct?: boolean
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          text?: string
          is_correct?: boolean
          order_index?: number
          created_at?: string
        }
      }
      user_responses: {
        Row: {
          id: string
          user_id: string
          task_id: string
          option_id: string
          votes_used: number
          responded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          option_id: string
          votes_used?: number
          responded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          option_id?: string
          votes_used?: number
          responded_at?: string
        }
      }
    }
  }
}
