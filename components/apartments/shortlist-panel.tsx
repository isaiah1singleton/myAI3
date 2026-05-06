"use client";

import { SavedApartment, SavedApartmentStatus } from "@/types/apartment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ShortlistPanelProps = {
  apartments: SavedApartment[];
  onStatusChange: (id: string, status: SavedApartmentStatus) => void;
  onRemove: (id: string) => void;
};

function getStatusVariant(status: SavedApartmentStatus) {
  switch (status) {
    case "saved":
      return "secondary";
    case "touring":
      return "default";
    case "applied":
      return "default";
    case "rejected":
      return "destructive";
    case "signed":
      return "default";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
}

export function ShortlistPanel({
  apartments,
  onStatusChange,
  onRemove,
}: ShortlistPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Saved Apartments</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[560px] px-4 pb-4">
          <div className="space-y-3">
            {apartments.length === 0 ? (
              <div className="rounded-xl bg-muted/45 px-4 py-6 text-sm text-muted-foreground">
                No saved apartments yet.
              </div>
            ) : (
              apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{apartment.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {apartment.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {apartment.city}
                          {apartment.neighborhood
                            ? ` • ${apartment.neighborhood}`
                            : ""}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(apartment.status)}>
                        {apartment.status}
                      </Badge>
                    </div>

                    <div className="text-sm font-medium">
                      ${apartment.monthlyRent.toLocaleString()}/month
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {apartment.fitScore !== undefined && (
                        <span>Fit: {apartment.fitScore}/100</span>
                      )}
                      {apartment.affordabilityRisk && (
                        <span>Affordability: {apartment.affordabilityRisk}</span>
                      )}
                      {apartment.listingRiskLevel && (
                        <span>Risk: {apartment.listingRiskLevel}</span>
                      )}
                    </div>
                  </div>

                  {apartment.notes && (
                    <div className="rounded-xl bg-muted/45 px-3 py-3 text-xs text-muted-foreground">
                      Notes: {apartment.notes}
                    </div>
                  )}

                  {apartment.rejectedReason && (
                    <div className="rounded-xl bg-destructive/10 px-3 py-3 text-xs text-red-600">
                      Rejected: {apartment.rejectedReason}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(apartment.id, "saved")}
                    >
                      Saved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(apartment.id, "touring")}
                    >
                      Touring
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(apartment.id, "applied")}
                    >
                      Applied
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(apartment.id, "signed")}
                    >
                      Signed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(apartment.id, "archived")}
                    >
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(apartment.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
