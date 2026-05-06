import { tool } from "ai";
import { z } from "zod";
import { savedApartmentSchema } from "@/types/apartment";

export const listSavedApartmentsTool = tool({
  description:
    "Summarize the user's currently saved shortlist apartments and optionally filter by status.",
  inputSchema: z.object({
    apartments: z.array(savedApartmentSchema),
    status: z
      .enum(["saved", "touring", "applied", "rejected", "signed", "archived"])
      .optional(),
  }),
  execute: async ({ apartments, status }) => {
    const filtered = status
      ? apartments.filter((apartment) => apartment.status === status)
      : apartments;

    return {
      apartments: filtered,
      count: filtered.length,
      summary:
        filtered.length > 0
          ? `There are ${filtered.length} apartment(s) in this shortlist view.`
          : "There are no apartments in this shortlist view.",
    };
  },
});
