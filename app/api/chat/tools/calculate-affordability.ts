import { tool } from "ai";
import { z } from "zod";
import {
  apartmentListingSchema,
  renterPreferencesSchema,
} from "@/types/apartment";
import { calculateAffordability } from "@/lib/apartment-affordability";

export const calculateAffordabilityTool = tool({
  description:
    "Calculate affordability for an apartment listing using rent, estimated total monthly cost, upfront move-in cost, and optional income and savings inputs.",
  inputSchema: z.object({
    preferences: renterPreferencesSchema,
    listing: apartmentListingSchema,
    financialProfile: z
      .object({
        grossMonthlyIncome: z.number().min(0).optional(),
        savingsAvailable: z.number().min(0).optional(),
        movingCostEstimate: z.number().min(0).optional(),
        rentersInsuranceEstimateMonthly: z.number().min(0).optional(),
        lastMonthRentRequired: z.boolean().optional(),
      })
      .optional(),
  }),
  execute: async ({ preferences, listing, financialProfile }) => {
    const analysis = calculateAffordability(
      preferences,
      listing,
      financialProfile ?? {}
    );

    return {
      listing: {
        title: listing.title,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
      },
      affordability: analysis,
    };
  },
});
