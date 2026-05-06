import { tool } from "ai";
import { z } from "zod";
import {
  apartmentListingSchema,
  renterPreferencesSchema,
} from "@/types/apartment";
import { detectListingRisk } from "@/lib/apartment-risk";

export const detectListingRiskTool = tool({
  description:
    "Detect scam, hidden-cost, or low-confidence risk signals in an apartment listing and explain safer next steps.",
  inputSchema: z.object({
    preferences: renterPreferencesSchema,
    listing: apartmentListingSchema,
  }),
  execute: async ({ preferences, listing }) => {
    const risk = detectListingRisk(preferences, listing);

    return {
      listing: {
        title: listing.title,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
        sourceUrl: listing.sourceUrl,
      },
      risk,
    };
  },
});
