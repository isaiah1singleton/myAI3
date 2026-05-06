"use client";

import {
  ApplicationRecord,
  SavedApartment,
  SavedApartmentStatus,
  TourRecord,
} from "@/types/apartment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShortlistPanel } from "./shortlist-panel";
import { TourManager } from "./tour-manager";
import { ApplicationTracker } from "./application-tracker";
import { DashboardOverview } from "./dashboard-overview";

export function WorkflowPanel({
  apartments,
  tours,
  applications,
  activeTab,
  onTabChange,
  onShortlistStatusChange,
  onShortlistRemove,
  onCreateTour,
  onUpdateTour,
  onCreateApplication,
  onUpdateApplication,
}: {
  apartments: SavedApartment[];
  tours: TourRecord[];
  applications: ApplicationRecord[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onShortlistStatusChange: (id: string, status: SavedApartmentStatus) => void;
  onShortlistRemove: (id: string) => void;
  onCreateTour: (tour: TourRecord) => void;
  onUpdateTour: (tour: TourRecord) => void;
  onCreateApplication: (application: ApplicationRecord) => void;
  onUpdateApplication: (application: ApplicationRecord) => void;
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 rounded-xl border border-border/70 bg-muted/50 p-1">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
        <TabsTrigger value="tours">Tours</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-4">
        <DashboardOverview
          apartments={apartments}
          tours={tours}
          applications={applications}
        />
      </TabsContent>

      <TabsContent value="shortlist" className="mt-4">
        <ShortlistPanel
          apartments={apartments}
          onStatusChange={onShortlistStatusChange}
          onRemove={onShortlistRemove}
        />
      </TabsContent>

      <TabsContent value="tours" className="mt-4">
        <TourManager
          apartments={apartments}
          tours={tours}
          onCreateTour={onCreateTour}
          onUpdateTour={onUpdateTour}
        />
      </TabsContent>

      <TabsContent value="applications" className="mt-4">
        <ApplicationTracker
          apartments={apartments}
          applications={applications}
          onCreateApplication={onCreateApplication}
          onUpdateApplication={onUpdateApplication}
        />
      </TabsContent>
    </Tabs>
  );
}
