"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavedApartment, SavedApartmentStatus } from "@/types/apartment";

export type ApartmentResultCardData = {
  id: string;
  title: string;
  address: string;
  city: string;
  neighborhood?: string;
  monthlyRent: number;
  fitScore?: number;
  affordabilityRisk?: "low" | "medium" | "high";
  listingRiskLevel?: "low" | "medium" | "high";
  notes?: string;
  sourceUrl?: string;
};

type ApartmentResultCardProps = {
  apartment: ApartmentResultCardData;
  onSave: (apartment: ApartmentResultCardData) => void;
  onStatusChange: (
    apartment: ApartmentResultCardData,
    status: SavedApartmentStatus
  ) => void;
  onScheduleTour?: (apartment: ApartmentResultCardData) => void;
  onStartApplication?: (apartment: ApartmentResultCardData) => void;
};

function riskVariant(level?: "low" | "medium" | "high") {
  if (level === "high") return "destructive";
  if (level === "medium") return "secondary";
  return "outline";
}

export function ApartmentResultCard({
  apartment,
  onSave,
  onStatusChange,
  onScheduleTour,
  onStartApplication,
}: ApartmentResultCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.2)]">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">{apartment.title}</div>
            <div className="text-sm text-muted-foreground">
              {apartment.address}
            </div>
            <div className="text-sm text-muted-foreground">
              {apartment.city}
              {apartment.neighborhood ? ` • ${apartment.neighborhood}` : ""}
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-semibold">
              ${apartment.monthlyRent.toLocaleString()}/mo
            </div>
            {apartment.fitScore !== undefined && (
              <div className="text-sm text-muted-foreground">
                Fit {apartment.fitScore}/100
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {apartment.affordabilityRisk && (
            <Badge variant={riskVariant(apartment.affordabilityRisk)}>
              affordability: {apartment.affordabilityRisk}
            </Badge>
          )}
          {apartment.listingRiskLevel && (
            <Badge variant={riskVariant(apartment.listingRiskLevel)}>
              listing risk: {apartment.listingRiskLevel}
            </Badge>
          )}
        </div>
      </div>

      {apartment.notes && (
        <div className="rounded-xl bg-muted/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {apartment.notes}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" onClick={() => onSave(apartment)}>
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(apartment, "touring")}
        >
          Touring
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(apartment, "applied")}
        >
          Applied
        </Button>
        {onScheduleTour && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onScheduleTour(apartment)}
          >
            Schedule tour
          </Button>
        )}
        {onStartApplication && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStartApplication(apartment)}
          >
            Start application
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onStatusChange(apartment, "rejected")}
        >
          Reject
        </Button>
        {apartment.sourceUrl && (
          <Button size="sm" variant="ghost" asChild>
            <a href={apartment.sourceUrl} target="_blank" rel="noreferrer">
              Open source
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function toSavedApartment(
  apartment: ApartmentResultCardData,
  status: SavedApartmentStatus = "saved"
): SavedApartment {
  const now = new Date().toISOString();

  return {
    id: apartment.id,
    title: apartment.title,
    address: apartment.address,
    city: apartment.city,
    monthlyRent: apartment.monthlyRent,
    neighborhood: apartment.neighborhood,
    sourceUrl: apartment.sourceUrl,
    status,
    fitScore: apartment.fitScore,
    affordabilityRisk: apartment.affordabilityRisk,
    listingRiskLevel: apartment.listingRiskLevel,
    notes: apartment.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
}
