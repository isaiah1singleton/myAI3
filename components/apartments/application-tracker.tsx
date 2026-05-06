"use client";

import {
  ApplicationRecord,
  ApplicationStage,
  SavedApartment,
} from "@/types/apartment";
import { createDefaultApplicationDocuments } from "@/lib/apartment-workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

export function ApplicationTracker({
  apartments,
  applications,
  onCreateApplication,
  onUpdateApplication,
}: {
  apartments: SavedApartment[];
  applications: ApplicationRecord[];
  onCreateApplication: (application: ApplicationRecord) => void;
  onUpdateApplication: (application: ApplicationRecord) => void;
}) {
  const eligibleApartments = useMemo(
    () => apartments.filter((apartment) => apartment.status !== "archived"),
    [apartments]
  );
  const [selectedApartmentId, setSelectedApartmentId] = useState("");

  const selectedApartment = eligibleApartments.find(
    (apartment) => apartment.id === selectedApartmentId
  );

  const createApplication = () => {
    if (!selectedApartment) return;

    const now = new Date().toISOString();
    onCreateApplication({
      id: `app-${Date.now()}`,
      apartmentId: selectedApartment.id,
      apartmentTitle: selectedApartment.title,
      apartmentAddress: selectedApartment.address,
      stage: "docs_needed",
      feesPaid: 0,
      requiredDocuments: createDefaultApplicationDocuments(),
      coverNote: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateStage = (application: ApplicationRecord, stage: ApplicationStage) => {
    onUpdateApplication({
      ...application,
      stage,
      updatedAt: new Date().toISOString(),
      submittedAt: stage === "submitted" ? new Date().toISOString() : application.submittedAt,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm"
            value={selectedApartmentId}
            onChange={(e) => setSelectedApartmentId(e.target.value)}
          >
            <option value="">Select an apartment</option>
            {eligibleApartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.title}
              </option>
            ))}
          </select>
          <Button onClick={createApplication} disabled={!selectedApartmentId}>
            Create Application Record
          </Button>
        </CardContent>
      </Card>

      <ScrollArea className="h-[560px]">
        <div className="space-y-4 pr-3">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                No application records yet.
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{application.apartmentTitle}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {application.apartmentAddress}
                      </div>
                    </div>
                    <Badge variant="outline">{application.stage}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "docs_needed",
                        "ready_to_apply",
                        "submitted",
                        "under_review",
                        "approved",
                        "rejected",
                        "withdrawn",
                      ] as ApplicationStage[]
                    ).map((stage) => (
                      <Button
                        key={stage}
                        size="sm"
                        variant="outline"
                        onClick={() => updateStage(application, stage)}
                      >
                        {stage.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Required Documents
                    </div>
                    {application.requiredDocuments.map((document) => (
                      <label
                        key={document.name}
                        className="flex items-center gap-2 rounded-xl bg-muted/35 px-3 py-2 text-sm"
                      >
                        <Checkbox
                          checked={document.provided}
                          onCheckedChange={(checked) =>
                            onUpdateApplication({
                              ...application,
                              requiredDocuments: application.requiredDocuments.map((item) =>
                                item.name === document.name
                                  ? { ...item, provided: Boolean(checked) }
                                  : item
                              ),
                              updatedAt: new Date().toISOString(),
                            })
                          }
                        />
                        {document.name}
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={application.dueDate ?? ""}
                      onChange={(e) =>
                        onUpdateApplication({
                          ...application,
                          dueDate: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      value={application.feesPaid}
                      onChange={(e) =>
                        onUpdateApplication({
                          ...application,
                          feesPaid: Number(e.target.value) || 0,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      placeholder="Fees paid"
                    />
                  </div>

                  <Textarea
                    value={application.coverNote}
                    onChange={(e) =>
                      onUpdateApplication({
                        ...application,
                        coverNote: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="Cover note to landlord or broker"
                  />

                  <Textarea
                    value={application.notes}
                    onChange={(e) =>
                      onUpdateApplication({
                        ...application,
                        notes: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="Application notes"
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
