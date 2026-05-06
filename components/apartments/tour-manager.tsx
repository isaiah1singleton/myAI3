"use client";

import { SavedApartment, TourRecord, TourStatus } from "@/types/apartment";
import { createDefaultTourChecklist } from "@/lib/apartment-workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";

export function TourManager({
  apartments,
  tours,
  onCreateTour,
  onUpdateTour,
}: {
  apartments: SavedApartment[];
  tours: TourRecord[];
  onCreateTour: (tour: TourRecord) => void;
  onUpdateTour: (tour: TourRecord) => void;
}) {
  const schedulableApartments = useMemo(
    () => apartments.filter((apartment) => apartment.status !== "archived"),
    [apartments]
  );
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState("");

  const selectedApartment = schedulableApartments.find(
    (apartment) => apartment.id === selectedApartmentId
  );

  const createTour = () => {
    if (!selectedApartment || !scheduledAt) return;

    const now = new Date().toISOString();
    onCreateTour({
      id: `tour-${Date.now()}`,
      apartmentId: selectedApartment.id,
      apartmentTitle: selectedApartment.title,
      apartmentAddress: selectedApartment.address,
      scheduledAt,
      status: "scheduled",
      checklist: createDefaultTourChecklist(),
      questionsToAsk: [
        "What utilities are included and what are typical monthly totals?",
        "How are maintenance requests handled?",
        "Are there any move-in or service fees not shown in the listing?",
      ],
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
    setScheduledAt("");
  };

  const updateChecklist = (
    tour: TourRecord,
    itemId: string,
    updates: Partial<TourRecord["checklist"][number]>
  ) => {
    onUpdateTour({
      ...tour,
      checklist: tour.checklist.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateStatus = (tour: TourRecord, status: TourStatus) => {
    onUpdateTour({
      ...tour,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule Tour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm"
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(e.target.value)}
          >
            <option value="">Select an apartment</option>
            {schedulableApartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.title}
              </option>
            ))}
          </select>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
          <Button onClick={createTour} disabled={!selectedApartmentId || !scheduledAt}>
            Add Tour
          </Button>
        </CardContent>
      </Card>

      <ScrollArea className="h-[560px]">
        <div className="space-y-4 pr-3">
          {tours.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                No tours scheduled yet.
              </CardContent>
            </Card>
          ) : (
            tours.map((tour) => (
              <Card key={tour.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{tour.apartmentTitle}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {tour.apartmentAddress}
                      </div>
                    </div>
                    <Badge variant="outline">{tour.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/45 px-3 py-3 text-sm text-muted-foreground">
                    Scheduled: {new Date(tour.scheduledAt).toLocaleString()}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(tour, "scheduled")}>
                      Scheduled
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(tour, "completed")}>
                      Completed
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(tour, "canceled")}>
                      Canceled
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Checklist
                    </div>
                    {tour.checklist.map((item) => (
                      <div key={item.id} className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-3">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={(checked) =>
                              updateChecklist(tour, item.id, { checked: Boolean(checked) })
                            }
                          />
                          <div className="text-sm">{item.label}</div>
                        </div>
                        <Input
                          value={item.note}
                          onChange={(e) =>
                            updateChecklist(tour, item.id, { note: e.target.value })
                          }
                          placeholder="Add note"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Questions To Ask
                    </div>
                    <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                      {tour.questionsToAsk.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </div>

                  <Textarea
                    value={tour.notes}
                    onChange={(e) =>
                      onUpdateTour({
                        ...tour,
                        notes: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="Post-tour notes"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
