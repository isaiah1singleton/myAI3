import { tool } from "ai";
import { z } from "zod";
import {
  apartmentListingSchema,
  renterPreferencesSchema,
} from "@/types/apartment";
import { compareApartments } from "@/lib/apartment-comparison";

export const compareApartmentsTool = tool({
  description:
    "Compare multiple apartment listings against renter preferences and return a ranked shortlist with tradeoffs.",
  inputSchema: z.object({
    preferences: renterPreferencesSchema,
    listings: z.array(apartmentListingSchema).min(2).max(5),
  }),
  execute: async ({ preferences, listings }) => {
    return compareApartments(preferences, listings);
  },
});
