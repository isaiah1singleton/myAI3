import { tool } from "ai";
import { z } from "zod";
import { apartmentListingSchema, renterPreferencesSchema } from "@/types/apartment";

export const prepareApplicationPlanTool = tool({
  description:
    "Prepare an apartment application checklist with required documents, likely risks, and next steps based on the listing and renter profile.",
  inputSchema: z.object({
    preferences: renterPreferencesSchema,
    listing: apartmentListingSchema,
    creditScoreRange: z.string().optional(),
    guarantorAvailable: z.boolean().optional(),
  }),
  execute: async ({ preferences, listing, creditScoreRange, guarantorAvailable }) => {
    const requiredDocuments = [
      "Government-issued ID",
      "Recent pay stubs or proof of income",
      "Bank statements",
      "Employment verification letter",
      "References",
    ];

    if (preferences.householdNotes?.toLowerCase().includes("self-employed")) {
      requiredDocuments.push("Recent tax return or 1099 income documentation");
    }

    if (guarantorAvailable) {
      requiredDocuments.push("Guarantor ID and proof of income");
    }

    const warnings: string[] = [];

    if ((listing.applicationFee ?? 0) > 100) {
      warnings.push("Application fee is on the high side and should be verified before paying.");
    }

    if ((listing.brokerFee ?? 0) > 0 && preferences.willingToUseBroker === false) {
      warnings.push("This listing has a broker fee even though the renter prefers to avoid brokers.");
    }

    if (creditScoreRange && /poor|low|sub/i.test(creditScoreRange)) {
      warnings.push("The renter may want to confirm minimum credit requirements before applying.");
    }

    const nextSteps = [
      "Confirm the unit is still available and request a written fee breakdown.",
      "Collect the required documents before starting the application.",
      "Verify the exact move-in date, deposit, and lease term in writing.",
    ];

    if (guarantorAvailable) {
      nextSteps.push("Ask whether the guarantor documents must be submitted with the main application.");
    }

    return {
      listing: {
        title: listing.title,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
      },
      requiredDocuments,
      warnings,
      nextSteps,
      summary: `Prepared an application plan for ${listing.title}.`,
    };
  },
});
