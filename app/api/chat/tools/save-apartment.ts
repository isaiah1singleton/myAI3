import { tool } from "ai";
import { z } from "zod";
import { apartmentListingSchema, savedApartmentSchema } from "@/types/apartment";

export const saveApartmentTool = tool({
  description:
    "Prepare a normalized apartment to be saved to the user's shortlist with optional fit and risk metadata.",
  inputSchema: z.object({
    listing: apartmentListingSchema,
    fitScore: z.number().min(0).max(100).optional(),
    affordabilityRisk: z.enum(["low", "medium", "high"]).optional(),
    listingRiskLevel: z.enum(["low", "medium", "high"]).optional(),
    notes: z.string().optional(),
  }),
  execute: async ({ listing, fitScore, affordabilityRisk, listingRiskLevel, notes }) => {
    const now = new Date().toISOString();

    const apartment = savedApartmentSchema.parse({
      id: `apt-${Date.now()}`,
      title: listing.title,
      address: listing.address,
      city: listing.city,
      monthlyRent: listing.monthlyRent,
      neighborhood: listing.neighborhood,
      sourceUrl: listing.sourceUrl,
      status: "saved",
      fitScore,
      affordabilityRisk,
      listingRiskLevel,
      notes: notes ?? "",
      createdAt: now,
      updatedAt: now,
    });

    return {
      apartment,
      message: `${listing.title} is ready to save to the shortlist.`,
    };
  },
});
