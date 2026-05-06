import { cn } from "@/lib/utils";

export function ChatHeaderBlock({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={cn("gap-3 flex flex-1 items-center", className)}>
            {children}
        </div>
    )
}

export function ChatHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto flex w-full max-w-7xl items-center rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-[0_12px_32px_-22px_rgba(15,23,42,0.18)]">
            {children}
        </div>
    )
}
