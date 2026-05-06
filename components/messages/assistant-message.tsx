import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";
import {
  ApartmentResultCard,
  ApartmentResultCardData,
} from "@/components/apartments/apartment-result-card";
import { SavedApartmentStatus } from "@/types/apartment";

type ToolLikePart = {
  type?: string;
  toolName?: string;
  state?: string;
  output?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function withOptionalString(
  target: ApartmentResultCardData,
  key: "neighborhood" | "notes" | "sourceUrl",
  value: unknown
) {
  if (typeof value === "string") {
    target[key] = value;
  }
}

function extractToolName(part: ToolLikePart): string | undefined {
  if (part.toolName) return part.toolName;
  if (part.type?.startsWith("tool-")) return part.type.slice(5);
  return undefined;
}

function buildApartmentCardFromToolOutput(
  toolName: string | undefined,
  output: unknown
): ApartmentResultCardData[] {
  if (!toolName || !isRecord(output)) return [];

  if (toolName === "saveApartmentTool") {
    const apartment = output.apartment;
    if (!isRecord(apartment)) return [];

    const card: ApartmentResultCardData = {
      id: typeof apartment.id === "string" ? apartment.id : `apt-${Date.now()}`,
      title: typeof apartment.title === "string" ? apartment.title : "Apartment",
      address:
        typeof apartment.address === "string"
          ? apartment.address
          : "Address unavailable",
      city: typeof apartment.city === "string" ? apartment.city : "Unknown city",
      monthlyRent:
        typeof apartment.monthlyRent === "number" ? apartment.monthlyRent : 0,
    };

    if (typeof apartment.fitScore === "number") {
      card.fitScore = apartment.fitScore;
    }

    if (
      apartment.affordabilityRisk === "low" ||
      apartment.affordabilityRisk === "medium" ||
      apartment.affordabilityRisk === "high"
    ) {
      card.affordabilityRisk = apartment.affordabilityRisk;
    }

    if (
      apartment.listingRiskLevel === "low" ||
      apartment.listingRiskLevel === "medium" ||
      apartment.listingRiskLevel === "high"
    ) {
      card.listingRiskLevel = apartment.listingRiskLevel;
    }

    withOptionalString(card, "neighborhood", apartment.neighborhood);
    withOptionalString(card, "notes", apartment.notes);
    withOptionalString(card, "sourceUrl", apartment.sourceUrl);

    return [card];
  }

  if (toolName === "scoreApartmentFitTool") {
    const listing = output.listing;
    const fit = output.fit;

    if (!isRecord(listing)) return [];

    const card: ApartmentResultCardData = {
      id:
        typeof listing.address === "string"
          ? `listing-${listing.address}`
          : `listing-${Date.now()}`,
      title: typeof listing.title === "string" ? listing.title : "Apartment",
      address:
        typeof listing.address === "string"
          ? listing.address
          : "Address unavailable",
      city: typeof listing.city === "string" ? listing.city : "Unknown city",
      monthlyRent:
        typeof listing.monthlyRent === "number" ? listing.monthlyRent : 0,
    };

    if (isRecord(fit) && typeof fit.score === "number") {
      card.fitScore = fit.score;
    }

    if (isRecord(fit) && typeof fit.explanation === "string") {
      card.notes = fit.explanation;
    }

    withOptionalString(card, "neighborhood", listing.neighborhood);
    withOptionalString(card, "sourceUrl", listing.sourceUrl);

    return [card];
  }

  if (toolName === "calculateAffordabilityTool") {
    const listing = output.listing;
    const affordability = output.affordability;

    if (!isRecord(listing)) return [];

    const card: ApartmentResultCardData = {
      id:
        typeof listing.address === "string"
          ? `listing-${listing.address}`
          : `listing-${Date.now()}`,
      title: typeof listing.title === "string" ? listing.title : "Apartment",
      address:
        typeof listing.address === "string"
          ? listing.address
          : "Address unavailable",
      city: typeof listing.city === "string" ? listing.city : "Unknown city",
      monthlyRent:
        typeof listing.monthlyRent === "number" ? listing.monthlyRent : 0,
    };

    if (
      isRecord(affordability) &&
      (affordability.affordabilityRisk === "low" ||
        affordability.affordabilityRisk === "medium" ||
        affordability.affordabilityRisk === "high")
    ) {
      card.affordabilityRisk = affordability.affordabilityRisk;
    }

    if (isRecord(affordability) && typeof affordability.explanation === "string") {
      card.notes = affordability.explanation;
    }

    withOptionalString(card, "neighborhood", listing.neighborhood);
    withOptionalString(card, "sourceUrl", listing.sourceUrl);

    return [card];
  }

  if (toolName === "detectListingRiskTool") {
    const listing = output.listing;
    const risk = output.risk;

    if (!isRecord(listing)) return [];

    const card: ApartmentResultCardData = {
      id:
        typeof listing.address === "string"
          ? `listing-${listing.address}`
          : `listing-${Date.now()}`,
      title: typeof listing.title === "string" ? listing.title : "Apartment",
      address:
        typeof listing.address === "string"
          ? listing.address
          : "Address unavailable",
      city: typeof listing.city === "string" ? listing.city : "Unknown city",
      monthlyRent:
        typeof listing.monthlyRent === "number" ? listing.monthlyRent : 0,
    };

    if (
      isRecord(risk) &&
      (risk.riskLevel === "low" ||
        risk.riskLevel === "medium" ||
        risk.riskLevel === "high")
    ) {
      card.listingRiskLevel = risk.riskLevel;
    }

    if (isRecord(risk) && typeof risk.explanation === "string") {
      card.notes = risk.explanation;
    }

    withOptionalString(card, "neighborhood", listing.neighborhood);
    withOptionalString(card, "sourceUrl", listing.sourceUrl);

    return [card];
  }

  if (toolName === "compareApartmentsTool") {
    const ranked = output.ranked;
    if (!Array.isArray(ranked)) return [];

    const cards: ApartmentResultCardData[] = [];

    ranked.forEach((item, index) => {
      if (!isRecord(item) || !isRecord(item.listing) || !isRecord(item.fit)) {
        return;
      }

      const listing = item.listing;
      const fit = item.fit;

      const card: ApartmentResultCardData = {
        id:
          typeof listing.address === "string"
            ? `compare-${listing.address}-${index}`
            : `compare-${index}`,
        title: typeof listing.title === "string" ? listing.title : "Apartment",
        address:
          typeof listing.address === "string"
            ? listing.address
            : "Address unavailable",
        city: typeof listing.city === "string" ? listing.city : "Unknown city",
        monthlyRent:
          typeof listing.monthlyRent === "number" ? listing.monthlyRent : 0,
      };

      if (typeof fit.score === "number") {
        card.fitScore = fit.score;
      }

      if (typeof fit.explanation === "string") {
        card.notes = fit.explanation;
      }

      withOptionalString(card, "neighborhood", listing.neighborhood);
      withOptionalString(card, "sourceUrl", listing.sourceUrl);

      cards.push(card);
    });

    return cards;
  }

  return [];
}

export function AssistantMessage({
  message,
  status,
  isLastMessage,
  durations,
  onDurationChange,
  onApartmentSave,
  onApartmentStatusChange,
  onApartmentScheduleTour,
  onApartmentStartApplication,
}: {
  message: UIMessage;
  status?: string;
  isLastMessage?: boolean;
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
    <div className="w-full">
      <div className="text-sm flex flex-col gap-4">
        {message.parts.map((part, i) => {
          const isStreaming =
            status === "streaming" && isLastMessage && i === message.parts.length - 1;
          const durationKey = `${message.id}-${i}`;
          const duration = durations?.[durationKey];

          if (part.type === "text") {
            return <Response key={`${message.id}-${i}`}>{part.text}</Response>;
          }

          if (part.type === "reasoning") {
            return (
              <ReasoningPart
                key={`${message.id}-${i}`}
                part={part}
                isStreaming={isStreaming}
                duration={duration}
                onDurationChange={
                  onDurationChange
                    ? (d) => onDurationChange(durationKey, d)
                    : undefined
                }
              />
            );
          }

          if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
            const toolPart = part as unknown as ToolLikePart;

            if (toolPart.state === "output-available") {
              const toolName = extractToolName(toolPart);
              const cards = buildApartmentCardFromToolOutput(
                toolName,
                toolPart.output
              );

              return (
                <div key={`${message.id}-${i}`} className="space-y-3">
                  <ToolResult part={part as unknown as ToolResultPart} />
                  {cards.length > 0 && onApartmentSave && onApartmentStatusChange && (
                    <div className="space-y-3">
                      {cards.map((card) => (
                        <ApartmentResultCard
                          key={card.id}
                          apartment={card}
                          onSave={onApartmentSave}
                          onStatusChange={onApartmentStatusChange}
                          onScheduleTour={onApartmentScheduleTour}
                          onStartApplication={onApartmentStartApplication}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <ToolCall
                key={`${message.id}-${i}`}
                part={part as unknown as ToolCallPart}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

