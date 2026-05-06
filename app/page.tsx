"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { ArrowUp, Loader2, LogOut, Plus, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ChatHeader, ChatHeaderBlock } from "@/app/parts/chat-header";
import {
  ApartmentResultCardData,
  toSavedApartment,
} from "@/components/apartments/apartment-result-card";
import {
  ChatHistoryItem,
  ChatHistoryPanel,
} from "@/components/apartments/chat-history-panel";
import { WorkflowPanel } from "@/components/apartments/workflow-panel";
import { useAuth } from "@/components/auth/auth-provider";
import { MessageWall } from "@/components/messages/message-wall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AI_NAME,
  CLEAR_CHAT_TEXT,
  OWNER_NAME,
  WELCOME_MESSAGE,
} from "@/config";
import {
  createChatSession,
  deleteChatSession,
  getWorkspace,
  listChatSessions,
  updateChatSession,
  upsertWorkspace,
} from "@/lib/supabase/data-client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import {
  ChatSessionRecord,
  WorkspaceRecord,
} from "@/lib/supabase/types";
import {
  ApplicationRecord,
  applicationRecordSchema,
  SavedApartment,
  savedApartmentSchema,
  SavedApartmentStatus,
  TourRecord,
  tourRecordSchema,
} from "@/types/apartment";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(4000, "Message must be at most 4000 characters."),
});

type ToolLikePart = {
  type?: string;
  toolName?: string;
  state?: string;
  output?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractToolName(part: ToolLikePart): string | undefined {
  if (part.toolName) return part.toolName;
  if (part.type?.startsWith("tool-")) return part.type.slice(5);
  return undefined;
}

function isSavedApartment(value: unknown): value is SavedApartment {
  const parsed = savedApartmentSchema.safeParse(value);
  return parsed.success;
}

function upsertApartment(
  apartments: SavedApartment[],
  apartment: SavedApartment
): SavedApartment[] {
  const existingIndex = apartments.findIndex((item) => item.id === apartment.id);

  if (existingIndex === -1) {
    return [apartment, ...apartments];
  }

  return apartments.map((item) => (item.id === apartment.id ? apartment : item));
}

function upsertTour(tours: TourRecord[], tour: TourRecord): TourRecord[] {
  const existingIndex = tours.findIndex((item) => item.id === tour.id);

  if (existingIndex === -1) {
    return [tour, ...tours];
  }

  return tours.map((item) => (item.id === tour.id ? tour : item));
}

function upsertApplication(
  applications: ApplicationRecord[],
  application: ApplicationRecord
): ApplicationRecord[] {
  const existingIndex = applications.findIndex(
    (item) => item.id === application.id
  );

  if (existingIndex === -1) {
    return [application, ...applications];
  }

  return applications.map((item) =>
    item.id === application.id ? application : item
  );
}

function getWelcomeMessage(): UIMessage {
  return {
    id: "welcome-message",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: WELCOME_MESSAGE,
      },
    ],
  };
}

function normalizeMessages(value: unknown): UIMessage[] {
  return Array.isArray(value) ? (value as UIMessage[]) : [];
}

function deriveChatTitleFromText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "New Search";
  return trimmed.length > 72 ? `${trimmed.slice(0, 69)}...` : trimmed;
}

function deriveChatTitleFromMessages(messages: UIMessage[]) {
  for (const message of messages) {
    if (message.role !== "user") continue;
    for (const part of message.parts) {
      if (part.type === "text" && "text" in part && part.text.trim()) {
        return deriveChatTitleFromText(part.text);
      }
    }
  }
  return "New Search";
}

function sortChats(chats: ChatHistoryItem[]) {
  return [...chats].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function toChatHistoryItem(record: ChatSessionRecord): ChatHistoryItem {
  return {
    id: record.id,
    title: record.title,
    updatedAt: record.updated_at,
    messages: normalizeMessages(record.messages),
  };
}

function parseWorkspaceArray<T>(
  items: unknown[],
  schema: z.ZodType<T>
): T[] {
  return items
    .map((item) => schema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export default function HomePage() {
  const router = useRouter();
  const { loading, user, session, signOut } = useAuth();
  const welcomeMessage = useMemo(() => getWelcomeMessage(), []);
  const initialDraftChatId = useMemo(() => `draft-${Date.now()}`, []);

  const [durations, setDurations] = useState<Record<string, number>>({});
  const [savedApartments, setSavedApartments] = useState<SavedApartment[]>([]);
  const [tours, setTours] = useState<TourRecord[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [workflowTab, setWorkflowTab] = useState("dashboard");
  const [chatSessions, setChatSessions] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatViewId, setChatViewId] = useState(initialDraftChatId);
  const [chatBootstrapMessages, setChatBootstrapMessages] = useState<UIMessage[]>([
    welcomeMessage,
  ]);
  const [chatHistoryCollapsed, setChatHistoryCollapsed] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  const initializedRef = useRef(false);
  const processedToolResultsRef = useRef<Set<string>>(new Set());
  const skipNextChatPersistRef = useRef(false);

  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: chatViewId,
    messages: chatBootstrapMessages,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user || !session) return;

    let cancelled = false;
    const accessToken = session.access_token;
    const userId = user.id;

    async function hydrateWorkspace() {
      setWorkspaceLoading(true);

      try {
        const [workspaceRecord, chatRecords] = await Promise.all([
          getWorkspace(accessToken, userId),
          listChatSessions(accessToken, userId),
        ]);

        if (cancelled) return;

        const nextChats = sortChats(chatRecords.map(toChatHistoryItem));
        const nextWorkspace = workspaceRecord as WorkspaceRecord | null;

        setChatSessions(nextChats);

        if (nextChats.length > 0) {
          skipNextChatPersistRef.current = true;
          setCurrentChatId(nextChats[0].id);
          setChatViewId(nextChats[0].id);
          setChatBootstrapMessages(
            nextChats[0].messages.length > 0
              ? nextChats[0].messages
              : [welcomeMessage]
          );
        } else {
          setCurrentChatId(null);
          setChatViewId(`draft-${Date.now()}`);
          setChatBootstrapMessages([welcomeMessage]);
        }

        if (nextWorkspace) {
          setSavedApartments(
            parseWorkspaceArray(
              nextWorkspace.saved_apartments,
              savedApartmentSchema
            )
          );
          setTours(
            parseWorkspaceArray(nextWorkspace.tours, tourRecordSchema)
          );
          setApplications(
            parseWorkspaceArray(
              nextWorkspace.applications,
              applicationRecordSchema
            )
          );
          setWorkflowTab(nextWorkspace.workflow_tab || "dashboard");
        } else {
          setSavedApartments([]);
          setTours([]);
          setApplications([]);
          setWorkflowTab("dashboard");
        }

        setDurations({});
        initializedRef.current = true;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load your account workspace."
        );
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      }
    }

    hydrateWorkspace();

    return () => {
      cancelled = true;
    };
  }, [loading, session, user, welcomeMessage]);

  useEffect(() => {
    if (!initializedRef.current || !session || !user) return;

    const timeout = window.setTimeout(async () => {
      try {
        await upsertWorkspace(session.access_token, {
          user_id: user.id,
          saved_apartments: savedApartments,
          tours,
          applications,
          workflow_tab: workflowTab,
        });
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [applications, savedApartments, session, tours, user, workflowTab]);

  useEffect(() => {
    if (!initializedRef.current || !session || !currentChatId) return;
    if (skipNextChatPersistRef.current) {
      skipNextChatPersistRef.current = false;
      return;
    }

    const timeout = window.setTimeout(async () => {
      const title = deriveChatTitleFromMessages(messages);

      try {
        const updated = await updateChatSession(session.access_token, currentChatId, {
          title,
          messages,
        });

        setChatSessions((prev) =>
          sortChats(
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    title: updated.title,
                    updatedAt: updated.updated_at,
                    messages: normalizeMessages(updated.messages),
                  }
                : chat
            )
          )
        );
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [currentChatId, messages, session]);

  useEffect(() => {
    if (!initializedRef.current) return;

    for (const message of messages) {
      message.parts.forEach((part, index) => {
        const toolPart = part as ToolLikePart;
        const toolName = extractToolName(toolPart);

        if (!toolName || toolPart.state !== "output-available") {
          return;
        }

        const resultKey = `${message.id}-${index}-${toolName}`;
        if (processedToolResultsRef.current.has(resultKey)) {
          return;
        }

        const output = toolPart.output;
        if (!isRecord(output)) {
          processedToolResultsRef.current.add(resultKey);
          return;
        }

        if (toolName === "saveApartmentTool") {
          const apartment = output.apartment;
          if (isSavedApartment(apartment)) {
            setSavedApartments((prev) => upsertApartment(prev, apartment));
            toast.success(
              typeof output.message === "string"
                ? output.message
                : `${apartment.title} saved to shortlist`
            );
          }
        }

        if (toolName === "updateSavedApartmentTool") {
          const apartment = output.apartment;
          if (isSavedApartment(apartment)) {
            setSavedApartments((prev) => upsertApartment(prev, apartment));
            toast.success(
              typeof output.message === "string"
                ? output.message
                : `${apartment.title} updated`
            );
          }
        }

        if (toolName === "removeSavedApartmentTool") {
          const apartment = output.apartment;
          const remove = output.remove;

          if (isSavedApartment(apartment)) {
            if (remove === true) {
              setSavedApartments((prev) =>
                prev.filter((item) => item.id !== apartment.id)
              );
            } else {
              setSavedApartments((prev) => upsertApartment(prev, apartment));
            }

            toast.success(
              typeof output.message === "string"
                ? output.message
                : `${apartment.title} updated`
            );
          }
        }

        processedToolResultsRef.current.add(resultKey);
      });
    }
  }, [messages]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prev) => ({
      ...prev,
      [key]: duration,
    }));
  };

  const handleApartmentSave = (apartment: ApartmentResultCardData) => {
    const saved = toSavedApartment(apartment, "saved");
    setSavedApartments((prev) => upsertApartment(prev, saved));
    setWorkflowTab("shortlist");
    toast.success(`${saved.title} saved to shortlist`);
  };

  const handleApartmentStatusChange = (
    apartment: ApartmentResultCardData,
    nextStatus: SavedApartmentStatus
  ) => {
    setSavedApartments((prev) => {
      const existing = prev.find((item) => item.id === apartment.id);

      if (existing) {
        return prev.map((item) =>
          item.id === apartment.id
            ? {
                ...item,
                status: nextStatus,
                rejectedReason:
                  nextStatus === "rejected"
                    ? item.rejectedReason || "Rejected from apartment card"
                    : item.rejectedReason,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
      }

      const created = toSavedApartment(apartment, nextStatus);
      if (nextStatus === "rejected") {
        created.rejectedReason = "Rejected from apartment card";
      }
      return upsertApartment(prev, created);
    });

    setWorkflowTab("shortlist");
    toast.success(`${apartment.title} updated to ${nextStatus}`);
  };

  const handleApartmentScheduleTour = (apartment: ApartmentResultCardData) => {
    const now = new Date().toISOString();
    const saved = toSavedApartment(apartment, "touring");

    setSavedApartments((prev) => upsertApartment(prev, saved));
    setWorkflowTab("tours");
    setTours((prev) =>
      upsertTour(prev, {
        id: `tour-${saved.id}`,
        apartmentId: saved.id,
        apartmentTitle: saved.title,
        apartmentAddress: saved.address,
        scheduledAt: now,
        status: "scheduled",
        checklist: [],
        questionsToAsk: [],
        notes: "",
        createdAt: now,
        updatedAt: now,
      })
    );

    toast.success(`Tour workflow started for ${apartment.title}`);
  };

  const handleApartmentStartApplication = (
    apartment: ApartmentResultCardData
  ) => {
    const now = new Date().toISOString();
    const saved = toSavedApartment(apartment, "applied");

    setSavedApartments((prev) => upsertApartment(prev, saved));
    setWorkflowTab("applications");
    setApplications((prev) =>
      upsertApplication(prev, {
        id: `app-${saved.id}`,
        apartmentId: saved.id,
        apartmentTitle: saved.title,
        apartmentAddress: saved.address,
        stage: "docs_needed",
        feesPaid: 0,
        requiredDocuments: [],
        coverNote: "",
        notes: "",
        createdAt: now,
        updatedAt: now,
      })
    );

    toast.success(`Application workflow started for ${apartment.title}`);
  };

  const handleShortlistStatusChange = (
    id: string,
    nextStatus: SavedApartmentStatus
  ) => {
    setSavedApartments((prev) =>
      prev.map((apartment) =>
        apartment.id === id
          ? {
              ...apartment,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : apartment
      )
    );
    toast.success(`Apartment updated to ${nextStatus}`);
  };

  const handleShortlistRemove = (id: string) => {
    setSavedApartments((prev) => prev.filter((apartment) => apartment.id !== id));
    toast.success("Apartment removed from shortlist");
  };

  const handleCreateTour = (tour: TourRecord) => {
    setTours((prev) => upsertTour(prev, tour));
    setWorkflowTab("tours");
  };

  const handleUpdateTour = (tour: TourRecord) => {
    setTours((prev) => upsertTour(prev, tour));
  };

  const handleCreateApplication = (application: ApplicationRecord) => {
    setApplications((prev) => upsertApplication(prev, application));
    setWorkflowTab("applications");
  };

  const handleUpdateApplication = (application: ApplicationRecord) => {
    setApplications((prev) => upsertApplication(prev, application));
  };

  const handleSelectChat = (chatId: string) => {
    const nextChat = chatSessions.find((chat) => chat.id === chatId);
    if (!nextChat) return;

    skipNextChatPersistRef.current = true;
    setCurrentChatId(chatId);
    setChatViewId(chatId);
    setChatBootstrapMessages(
      nextChat.messages.length > 0 ? nextChat.messages : [welcomeMessage]
    );
    setDurations({});
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!session) return;

    try {
      await deleteChatSession(session.access_token, chatId);
      const remaining = chatSessions.filter((chat) => chat.id !== chatId);
      setChatSessions(sortChats(remaining));

      if (currentChatId === chatId) {
        if (remaining.length > 0) {
          const fallback = sortChats(remaining)[0];
          skipNextChatPersistRef.current = true;
          setCurrentChatId(fallback.id);
          setChatViewId(fallback.id);
          setChatBootstrapMessages(
            fallback.messages.length > 0 ? fallback.messages : [welcomeMessage]
          );
        } else {
          setCurrentChatId(null);
          setChatViewId(`draft-${Date.now()}`);
          setChatBootstrapMessages([welcomeMessage]);
        }
      }

      toast.success("Chat deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat."
      );
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setChatViewId(`draft-${Date.now()}`);
    setChatBootstrapMessages([welcomeMessage]);
    setDurations({});
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session || !user) return;

    const trimmed = values.message.trim();
    if (!trimmed) return;

    try {
      let nextChatId = currentChatId;

      if (!nextChatId) {
        const created = await createChatSession(session.access_token, {
          user_id: user.id,
          title: deriveChatTitleFromText(trimmed),
          messages,
        });

        const historyItem = toChatHistoryItem(created);
        nextChatId = created.id;
        setCurrentChatId(nextChatId);
        setChatSessions((prev) => sortChats([historyItem, ...prev]));
      }

      sendMessage({ text: trimmed });
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start the chat."
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign out."
      );
    }
  };

  if (!hasSupabaseConfig()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/35 px-5">
        <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-background p-8 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)]">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Supabase configuration required
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            to your environment before using authentication, saved apartments,
            and persistent chat history.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user || workspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/35">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-40 pb-4 backdrop-blur-sm">
          <ChatHeader>
            <ChatHeaderBlock>
              <div className="space-y-0.5">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Signed in
                </div>
                <div className="text-sm font-medium text-foreground">
                  {user.email ?? "Account"}
                </div>
              </div>
            </ChatHeaderBlock>

            <ChatHeaderBlock className="justify-center">
              <Avatar className="size-9 ring-1 ring-primary/25">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <Image src="/logo.png" alt="Logo" width={36} height={36} />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 text-center">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Apartment workflow assistant
                </div>
                <div className="text-base font-semibold tracking-tight text-foreground">
                  {AI_NAME}
                </div>
              </div>
            </ChatHeaderBlock>

            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        <div
          className={cn(
            "grid flex-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)_380px]",
            chatHistoryCollapsed &&
              "xl:grid-cols-[88px_minmax(0,1fr)_380px]"
          )}
        >
          <div className="hidden xl:block">
            <div className="sticky top-[112px]">
              <ChatHistoryPanel
                chats={chatSessions}
                activeChatId={currentChatId}
                onSelect={handleSelectChat}
                onNewChat={handleNewChat}
                onDelete={handleDeleteChat}
                collapsed={chatHistoryCollapsed}
                onToggleCollapse={() =>
                  setChatHistoryCollapsed((value) => !value)
                }
              />
            </div>
          </div>

          <div className="flex h-[calc(100vh-148px)] min-h-[680px] flex-col overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-[0_18px_48px_-30px_rgba(15,23,42,0.18)]">
            <div className="border-b border-border/70 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Active search
                  </div>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {currentChatId
                      ? chatSessions.find((chat) => chat.id === currentChatId)
                          ?.title || "Conversation"
                      : "New apartment search"}
                  </h1>
                </div>
                <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                  Saved apartments: {savedApartments.length}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col items-center justify-end min-h-full">
                <MessageWall
                  messages={messages}
                  status={status}
                  durations={durations}
                  onDurationChange={handleDurationChange}
                  onApartmentSave={handleApartmentSave}
                  onApartmentStatusChange={handleApartmentStatusChange}
                  onApartmentScheduleTour={handleApartmentScheduleTour}
                  onApartmentStartApplication={handleApartmentStartApplication}
                />
                {status === "submitted" && (
                  <div className="flex justify-start max-w-3xl w-full">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border/70 px-6 py-5">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="chat-form-message" className="sr-only">
                          Message
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="chat-form-message"
                            className="h-14 rounded-2xl border-border/70 bg-muted/30 px-5 pr-16"
                            placeholder="Ask about apartments, leases, tours, or applications..."
                            disabled={status === "streaming"}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />
                          {(status === "ready" || status === "error") && (
                            <Button
                              className="absolute right-2 top-2 rounded-full"
                              type="submit"
                              disabled={!field.value.trim()}
                              size="icon"
                            >
                              <ArrowUp className="size-4" />
                            </Button>
                          )}
                          {(status === "streaming" || status === "submitted") && (
                            <Button
                              className="absolute right-2 top-2 rounded-full"
                              size="icon"
                              type="button"
                              onClick={stop}
                            >
                              <Square className="size-4" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="hidden xl:block">
              <div className="sticky top-[112px]">
                <WorkflowPanel
                  apartments={savedApartments}
                  tours={tours}
                  applications={applications}
                  activeTab={workflowTab}
                  onTabChange={setWorkflowTab}
                  onShortlistStatusChange={handleShortlistStatusChange}
                  onShortlistRemove={handleShortlistRemove}
                  onCreateTour={handleCreateTour}
                  onUpdateTour={handleUpdateTour}
                  onCreateApplication={handleCreateApplication}
                  onUpdateApplication={handleUpdateApplication}
                />
              </div>
            </div>

            <div className="grid gap-6 xl:hidden">
              <ChatHistoryPanel
                chats={chatSessions}
                activeChatId={currentChatId}
                onSelect={handleSelectChat}
                onNewChat={handleNewChat}
                onDelete={handleDeleteChat}
                collapsed={false}
              />
              <WorkflowPanel
                apartments={savedApartments}
                tours={tours}
                applications={applications}
                activeTab={workflowTab}
                onTabChange={setWorkflowTab}
                onShortlistStatusChange={handleShortlistStatusChange}
                onShortlistRemove={handleShortlistRemove}
                onCreateTour={handleCreateTour}
                onUpdateTour={handleUpdateTour}
                onCreateApplication={handleCreateApplication}
                onUpdateApplication={handleUpdateApplication}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {OWNER_NAME}&nbsp;
          <Link href="/terms" className="underline underline-offset-4">
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
