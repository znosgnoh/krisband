export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          singer: string;
          added_by: string;
          status: "to_practice" | "practicing" | "done";
          youtube_url: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          board_id: string;
          title: string;
          singer: string;
          added_by: string;
          status: "to_practice" | "practicing" | "done";
          youtube_url?: string | null;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          title?: string;
          singer?: string;
          added_by?: string;
          status?: "to_practice" | "practicing" | "done";
          youtube_url?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
