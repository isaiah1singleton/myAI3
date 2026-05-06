"use client";

import { UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";

export type ChatHistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
  messages: UIMessage[];
};

function getPreview(messages: UIMessage[]) {
  const userMessage = messages.find((message) => message.role === "user");
  const textPart = userMessage?.parts.find((part) => part.type === "text");
  if (textPart && "text" in textPart) {
    return textPart.text;
  }
  const assistantMessage = messages.find((message) => message.role === "assistant");
  const assistantText = assistantMessage?.parts.find((part) => part.type === "text");
  if (assistantText && "text" in assistantText) {
    return assistantText.text;
  }
  return "No preview available.";
}

function getInitials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "C";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function ChatHistoryPanel({
  chats,
  activeChatId,
  onSelect,
  onNewChat,
  onDelete,
  collapsed = false,
  onToggleCollapse,
}: {
  chats: ChatHistoryItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDelete: (chatId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <Card className="flex h-[calc(100vh-148px)] min-h-[680px] w-full flex-col overflow-hidden">
      <CardHeader
        className={`flex flex-row items-center space-y-0 ${
          collapsed ? "justify-center gap-2 px-3" : "justify-between"
        }`}
      >
        {collapsed ? (
          <>
            <Button size="icon" variant="ghost" onClick={onToggleCollapse}>
              <ChevronRight className="size-4" />
            </Button>
            <Button size="icon" onClick={onNewChat}>
              <MessageSquarePlus className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <CardTitle className="text-base">Past Chats</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={onToggleCollapse}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="sm" onClick={onNewChat}>
                <MessageSquarePlus className="size-4" />
                New
              </Button>
            </div>
          </>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className={collapsed ? "h-full px-2 pb-3" : "h-full px-4 pb-4"}>
          <div className="space-y-3">
            {chats.length === 0 ? (
              <div
                className={`rounded-xl bg-muted/45 text-sm text-muted-foreground ${
                  collapsed
                    ? "px-2 py-4 text-center text-xs"
                    : "px-4 py-6"
                }`}
              >
                No past chats yet.
              </div>
            ) : (
              chats.map((chat) => (
                collapsed ? (
                  <div
                    key={chat.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`size-12 rounded-2xl border ${
                        activeChatId === chat.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/70 bg-background/70"
                      }`}
                      onClick={() => onSelect(chat.id)}
                      title={chat.title}
                    >
                      <span className="text-xs font-semibold">
                        {getInitials(chat.title)}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => onDelete(chat.id)}
                      title={`Delete ${chat.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div
                    key={chat.id}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      activeChatId === chat.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/70 bg-background/70 hover:bg-muted/35"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSelect(chat.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="truncate text-sm font-semibold">{chat.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {getPreview(chat.messages)}
                        </div>
                        <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleString()}
                        </div>
                      </button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(chat.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
