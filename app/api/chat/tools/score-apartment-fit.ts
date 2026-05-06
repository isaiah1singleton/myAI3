import { tool } from "ai";
import { z } from "zod";
import {
  apartmentListingSchema,
  renterPreferencesSchema,
} from "@/types/apartment";
import { scoreApartmentFit } from "@/lib/apartment-scoring";

export const scoreApartmentFitTool = tool({
  description:
    "Score an apartment listing against a renter's stated preferences and explain the fit, tradeoffs, costs, and concerns.",
  inputSchema: z.object({
    preferences: renterPreferencesSchema,
    listing: apartmentListingSchema,
  }),
  execute: async ({ preferences, listing }) => {
    const fit = scoreApartmentFit(preferences, listing);

    return {
      listing: {
        title: listing.title,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
        neighborhood: listing.neighborhood,
        sourceUrl: listing.sourceUrl,
      },
      fit,
    };
  },
});
