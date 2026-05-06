import { tool } from "ai";
import { z } from "zod";
import { apartmentListingSchema } from "@/types/apartment";

const ingestApartmentListingInputSchema = z.object({
  title: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  rawListingText: z.string().min(1),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  monthlyRent: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  squareFeet: z.number().min(0).optional(),
  availableDate: z.string().optional(),
  leaseLengthMonths: z.number().int().min(1).max(36).optional(),
  brokerFee: z.number().min(0).optional(),
  applicationFee: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
  parkingMonthly: z.number().min(0).optional(),
  petFeesMonthly: z.number().min(0).optional(),
  utilityEstimateMonthly: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  petsAllowed: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
  transitSummary: z.string().optional(),
  estimatedCommuteMinutes: z.number().int().min(0).max(240).optional(),
  buildingType: z.string().optional(),
  noiseRisk: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().optional(),
});

export const ingestApartmentListing = tool({
  description:
    "Normalize a messy apartment listing into structured apartment fields for later scoring and comparison.",
  inputSchema: ingestApartmentListingInputSchema,
  execute: async (input) => {
    const normalized = apartmentListingSchema.parse({
      title: input.title ?? "Apartment Listing",
      sourceUrl: input.sourceUrl,
      address: input.address ?? "Address not provided",
      neighborhood: input.neighborhood,
      city: input.city ?? "Unknown city",
      monthlyRent: input.monthlyRent ?? 0,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      squareFeet: input.squareFeet,
      availableDate: input.availableDate,
      leaseLengthMonths: input.leaseLengthMonths,
      brokerFee: input.brokerFee,
      applicationFee: input.applicationFee,
      securityDeposit: input.securityDeposit,
      parkingMonthly: input.parkingMonthly,
      petFeesMonthly: input.petFeesMonthly,
      utilityEstimateMonthly: input.utilityEstimateMonthly,
      amenities: input.amenities ?? [],
      petsAllowed: input.petsAllowed,
      parkingAvailable: input.parkingAvailable,
      transitSummary: input.transitSummary,
      estimatedCommuteMinutes: input.estimatedCommuteMinutes,
      buildingType: input.buildingType,
      noiseRisk: input.noiseRisk,
      description: input.description ?? input.rawListingText,
    });

    const missingImportantFields = [
      !input.address ? "address" : null,
      !input.city ? "city" : null,
      input.monthlyRent === undefined ? "monthlyRent" : null,
      !input.availableDate ? "availableDate" : null,
      input.utilityEstimateMonthly === undefined ? "utilityEstimateMonthly" : null,
    ].filter(Boolean);

    return {
      listing: normalized,
      rawListingText: input.rawListingText,
      ingestionNotes: {
        missingImportantFields,
        completenessScore: Math.max(0, 100 - missingImportantFields.length * 15),
      },
      summary: `${normalized.title} in ${normalized.city} normalized for scoring and comparison.`,
    };
  },
});
