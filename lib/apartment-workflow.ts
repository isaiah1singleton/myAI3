import {
  ApplicationRecord,
  SavedApartment,
  TourChecklistItem,
  TourRecord,
} from "@/types/apartment";

export function createDefaultTourChecklist(): TourChecklistItem[] {
  return [
    { id: "water-pressure", label: "Test water pressure", category: "unit", checked: false, note: "" },
    { id: "windows-locks", label: "Check windows and locks", category: "unit", checked: false, note: "" },
    { id: "appliances", label: "Run appliances and inspect outlets", category: "unit", checked: false, note: "" },
    { id: "noise", label: "Listen for hallway and street noise", category: "neighborhood", checked: false, note: "" },
    { id: "laundry-trash", label: "Inspect laundry, trash, and package areas", category: "building", checked: false, note: "" },
    { id: "fees", label: "Ask for full fee and utility breakdown", category: "landlord", checked: false, note: "" },
  ];
}

export function createDefaultApplicationDocuments(): ApplicationRecord["requiredDocuments"] {
  return [
    { name: "Government-issued ID", provided: false },
    { name: "Recent pay stubs or proof of income", provided: false },
    { name: "Bank statements", provided: false },
    { name: "Employment verification letter", provided: false },
    { name: "References", provided: false },
  ];
}

export function getDecisionStats(
  apartments: SavedApartment[],
  tours: TourRecord[],
  applications: ApplicationRecord[]
) {
  const activeShortlist = apartments.filter(
    (apartment) => apartment.status !== "archived" && apartment.status !== "rejected"
  );
  const averageFitScore =
    activeShortlist.length > 0
      ? Math.round(
          activeShortlist.reduce(
            (sum, apartment) => sum + (apartment.fitScore ?? 0),
            0
          ) / activeShortlist.length
        )
      : 0;

  const upcomingTours = tours.filter((tour) => tour.status === "scheduled").length;
  const activeApplications = applications.filter(
    (application) =>
      application.stage !== "approved" &&
      application.stage !== "rejected" &&
      application.stage !== "withdrawn"
  ).length;

  return {
    activeShortlistCount: activeShortlist.length,
    averageFitScore,
    upcomingTours,
    activeApplications,
  };
}
