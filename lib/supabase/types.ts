export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user?: SupabaseUser;
};

export type SupabaseUser = {
  id: string;
  email?: string;
};

export type ChatSessionRecord = {
  id: string;
  user_id: string;
  title: string;
  messages: unknown[];
  created_at: string;
  updated_at: string;
};

export type WorkspaceRecord = {
  user_id: string;
  saved_apartments: unknown[];
  tours: unknown[];
  applications: unknown[];
  workflow_tab: string;
  created_at: string;
  updated_at: string;
};
