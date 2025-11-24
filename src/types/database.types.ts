// Type definitions for Supabase database

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          folder_id: string | null;
          permissions: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          folder_id?: string | null;
          permissions?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          folder_id?: string | null;
          permissions?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add other tables as needed based on your actual database schema
    };
    Views: {
      // Define views if needed
    };
    Functions: {
      // Define functions if needed
    };
    Enums: {
      // Define enums if needed
    };
    CompositeTypes: {
      // Define composite types if needed
    };
  };
}

// Additional types that might be needed
export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  permissions?: Record<string, any>;
}

// Extend the Window interface to include necessary properties
declare global {
  interface Window {
    // Add any specific window properties your application needs
  }
}