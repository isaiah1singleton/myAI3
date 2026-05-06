"use client";

import { SavedApartment, TourRecord, ApplicationRecord } from "@/types/apartment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDecisionStats } from "@/lib/apartment-workflow";

export function DashboardOverview({
  apartments,
  tours,
  applications,
}: {
  apartments: SavedApartment[];
  tours: TourRecord[];
  applications: ApplicationRecord[];
}) {
  const stats = getDecisionStats(apartments, tours, applications);
  const topApartment = [...apartments]
    .filter((apartment) => apartment.status !== "archived")
    .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0))[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="gap-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              Active Shortlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.activeShortlistCount}</div>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              Avg Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.averageFitScore}</div>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              Upcoming Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.upcomingTours}</div>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              Active Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.activeApplications}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decision Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {topApartment ? (
            <>
              <div>
                <div className="font-semibold">{topApartment.title}</div>
                <div className="text-muted-foreground leading-6">
                  Current strongest saved option based on fit score.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {topApartment.fitScore !== undefined && (
                  <Badge variant="secondary">Fit {topApartment.fitScore}/100</Badge>
                )}
                {topApartment.affordabilityRisk && (
                  <Badge variant="outline">
                    Affordability {topApartment.affordabilityRisk}
                  </Badge>
                )}
                {topApartment.listingRiskLevel && (
                  <Badge variant="outline">Risk {topApartment.listingRiskLevel}</Badge>
                )}
              </div>
              <div className="rounded-xl bg-muted/45 px-3 py-3 text-muted-foreground">
                Next best action:{" "}
                {topApartment.status === "saved"
                  ? "schedule a tour"
                  : topApartment.status === "touring"
                    ? "capture post-tour notes"
                    : topApartment.status === "applied"
                      ? "track application progress"
                      : "review final decision"}
                .
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-muted/45 px-3 py-3 text-muted-foreground">
              Save apartments to start a shortlist and decision dashboard.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
