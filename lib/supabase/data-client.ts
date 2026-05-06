import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from "./config";
import { ChatSessionRecord, WorkspaceRecord } from "./types";

function restHeaders(accessToken: string, prefer?: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function restRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...restHeaders(accessToken),
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Supabase data request failed");
  }

  return data as T;
}

export async function listChatSessions(accessToken: string, userId: string) {
  const query =
    `chat_sessions?user_id=eq.${userId}` +
    `&select=id,user_id,title,messages,created_at,updated_at` +
    `&order=updated_at.desc`;

  return restRequest<ChatSessionRecord[]>(query, accessToken, {
    method: "GET",
  });
}

export async function createChatSession(
  accessToken: string,
  payload: Pick<ChatSessionRecord, "user_id" | "title" | "messages">
) {
  return restRequest<ChatSessionRecord[]>("chat_sessions", accessToken, {
    method: "POST",
    headers: restHeaders(accessToken, "return=representation"),
    body: JSON.stringify(payload),
  }).then((rows) => rows[0]);
}

export async function updateChatSession(
  accessToken: string,
  id: string,
  payload: Partial<Pick<ChatSessionRecord, "title" | "messages">>
) {
  return restRequest<ChatSessionRecord[]>(
    `chat_sessions?id=eq.${id}&select=id,user_id,title,messages,created_at,updated_at`,
    accessToken,
    {
      method: "PATCH",
      headers: restHeaders(accessToken, "return=representation"),
      body: JSON.stringify(payload),
    }
  ).then((rows) => rows[0]);
}

export async function deleteChatSession(accessToken: string, id: string) {
  await restRequest<null>(`chat_sessions?id=eq.${id}`, accessToken, {
    method: "DELETE",
  });
}

export async function getWorkspace(accessToken: string, userId: string) {
  const query =
    `user_workspaces?user_id=eq.${userId}` +
    `&select=user_id,saved_apartments,tours,applications,workflow_tab,created_at,updated_at`;

  return restRequest<WorkspaceRecord[]>(query, accessToken, {
    method: "GET",
  }).then((rows) => rows[0] ?? null);
}

export async function upsertWorkspace(
  accessToken: string,
  payload: Pick<
    WorkspaceRecord,
    "user_id" | "saved_apartments" | "tours" | "applications" | "workflow_tab"
  >
) {
  return restRequest<WorkspaceRecord[]>(
    "user_workspaces?on_conflict=user_id",
    accessToken,
    {
      method: "POST",
      headers: restHeaders(
        accessToken,
        "resolution=merge-duplicates,return=representation"
      ),
      body: JSON.stringify(payload),
    }
  ).then((rows) => rows[0]);
}
