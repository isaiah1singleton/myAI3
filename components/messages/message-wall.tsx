import { UIMessage } from "ai";
import { AssistantMessage } from "./assistant-message";
import { UserMessage } from "./user-message";
import { ApartmentResultCardData } from "@/components/apartments/apartment-result-card";
import { SavedApartmentStatus } from "@/types/apartment";

export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
  onApartmentSave,
  onApartmentStatusChange,
  onApartmentScheduleTour,
  onApartmentStartApplication,
}: {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
  onApartmentSave?: (apartment: ApartmentResultCardData) => void;
  onApartmentStatusChange?: (
    apartment: ApartmentResultCardData,
    status: SavedApartmentStatus
  ) => void;
  onApartmentScheduleTour?: (apartment: ApartmentResultCardData) => void;
  onApartmentStartApplication?: (apartment: ApartmentResultCardData) => void;
}) {
  return (
    <div className="w-full max-w-3xl space-y-6">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;

        if (message.role === "user") {
          return <UserMessage key={message.id} message={message} />;
        }

        return (
          <AssistantMessage
            key={message.id}
            message={message}
            status={status}
            isLastMessage={isLastMessage}
            durations={durations}
            onDurationChange={onDurationChange}
            onApartmentSave={onApartmentSave}
            onApartmentStatusChange={onApartmentStatusChange}
            onApartmentScheduleTour={onApartmentScheduleTour}
            onApartmentStartApplication={onApartmentStartApplication}
          />
        );
      })}
    </div>
  );
}
