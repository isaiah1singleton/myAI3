import { z } from "zod";

export const commuteDestinationSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(1),
  frequencyPerWeek: z.number().int().min(0).max(7).default(5),
  maxMinutes: z.number().int().min(1).max(240).optional(),
  preferredModes: z
    .array(z.enum(["transit", "car", "bike", "walk"]))
    .default(["transit"]),
});

export const renterPreferencesSchema = z.object({
  city: z.string().min(1),
  neighborhoodsPreferred: z.array(z.string()).default([]),
  neighborhoodsAvoid: z.array(z.string()).default([]),
  maxMonthlyRent: z.number().min(0),
  idealMonthlyRentMin: z.number().min(0).optional(),
  idealMonthlyRentMax: z.number().min(0).optional(),
  moveInDate: z.string().optional(),
  leaseLengthMonths: z.number().int().min(1).max(36).optional(),
  bedroomsMin: z.number().min(0).optional(),
  bathroomsMin: z.number().min(0).optional(),
  householdNotes: z.string().optional(),
  pets: z.array(z.string()).default([]),
  mustHaves: z.array(z.string()).default([]),
  niceToHaves: z.array(z.string()).default([]),
  dealbreakers: z.array(z.string()).default([]),
  parkingNeed: z.enum(["none", "street", "garage", "included"]).optional(),
  transitImportance: z.enum(["low", "medium", "high"]).optional(),
  workFromHome: z.boolean().optional(),
  noiseTolerance: z.enum(["low", "medium", "high"]).optional(),
  buildingTypePreference: z.array(z.string()).default([]),
  walkabilityPreference: z.enum(["low", "medium", "high"]).optional(),
  accessibilityNeeds: z.array(z.string()).default([]),
  willingToUseBroker: z.boolean().optional(),
  housingStyle: z
    .array(
      z.enum([
        "luxury",
        "budget",
        "student",
        "family-friendly",
        "pet-friendly",
        "short-term",
      ])
    )
    .default([]),
  commuteDestinations: z.array(commuteDestinationSchema).default([]),
});

export type RenterPreferences = z.infer<typeof renterPreferencesSchema>;

export const apartmentListingSchema = z.object({
  title: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  address: z.string().min(1),
  neighborhood: z.string().optional(),
  city: z.string().min(1),
  monthlyRent: z.number().min(0),
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
  amenities: z.array(z.string()).default([]),
  petsAllowed: z.boolean().optional(),
  parkingAvailable: z.boolean().optional(),
  transitSummary: z.string().optional(),
  estimatedCommuteMinutes: z.number().int().min(0).max(240).optional(),
  buildingType: z.string().optional(),
  noiseRisk: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().optional(),
});

export type ApartmentListing = z.infer<typeof apartmentListingSchema>;

export const apartmentFitScoreSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(["strong-fit", "possible-fit", "weak-fit"]),
  matchedMustHaves: z.array(z.string()),
  missingMustHaves: z.array(z.string()),
  matchedNiceToHaves: z.array(z.string()),
  triggeredDealbreakers: z.array(z.string()),
  costBreakdown: z.object({
    baseRent: z.number().min(0),
    estimatedMonthlyTotal: z.number().min(0),
    estimatedUpfrontTotal: z.number().min(0),
  }),
  penalties: z.array(
    z.object({
      reason: z.string(),
      points: z.number().min(0),
    })
  ),
  bonuses: z.array(
    z.object({
      reason: z.string(),
      points: z.number().min(0),
    })
  ),
  explanation: z.string(),
});

export const affordabilityAnalysisSchema = z.object({
  monthlyRent: z.number().min(0),
  estimatedMonthlyTotal: z.number().min(0),
  estimatedUpfrontTotal: z.number().min(0),
  rentToIncomeRatio: z.number().min(0).optional(),
  monthlyCostToIncomeRatio: z.number().min(0).optional(),
  affordabilityRisk: z.enum(["low", "medium", "high"]),
  warnings: z.array(z.string()),
  explanation: z.string(),
});

export type AffordabilityAnalysis = z.infer<typeof affordabilityAnalysisSchema>;

export const listingRiskSignalSchema = z.object({
  code: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
});

export type ListingRiskSignal = z.infer<typeof listingRiskSignalSchema>;

export const listingRiskAnalysisSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  riskScore: z.number().min(0).max(100),
  signals: z.array(listingRiskSignalSchema),
  saferNextSteps: z.array(z.string()),
  explanation: z.string(),
});

export type ListingRiskAnalysis = z.infer<typeof listingRiskAnalysisSchema>;


export type ApartmentFitScore = z.infer<typeof apartmentFitScoreSchema>;

export const leaseDocumentInputSchema = z.object({
    documentType: z.enum([
        "lease",
        "application",
        "fee_disclosure",
        "broker_agreement",
        "house_rules",
        "guarantor_form",
        "other",
    ]),
    documentText: z.string().min(1),
    listingContext: apartmentListingSchema.optional(),
})

export type LeaseDocumentInput = z.infer<typeof leaseDocumentInputSchema>;

export const leaseFlagSchema = z.object({
  code: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
});

export type LeaseFlag = z.infer<typeof leaseFlagSchema>;

export const leaseDocumentSummarySchema = z.object({
  documentType: z.string(),
  extractedTerms: z.object({
    monthlyRent: z.number().min(0).optional(),
    securityDeposit: z.number().min(0).optional(),
    brokerFee: z.number().min(0).optional(),
    applicationFee: z.number().min(0).optional(),
    moveInDate: z.string().optional(),
    leaseLengthMonths: z.number().int().min(1).max(36).optional(),
    petPolicy: z.string().optional(),
    guestPolicy: z.string().optional(),
    sublettingPolicy: z.string().optional(),
    renewalTerms: z.string().optional(),
    noticePeriod: z.string().optional(),
    maintenanceResponsibility: z.string().optional(),
    utilitiesResponsibility: z.string().optional(),
    lateFeeTerms: z.string().optional(),
    earlyTerminationTerms: z.string().optional(),
  }),
  flags: z.array(leaseFlagSchema),
  listingMismatches: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
  explanation: z.string(),
  legalCaution: z.string(),
});

export type LeaseDocumentSummary = z.infer<typeof leaseDocumentSummarySchema>;

export const savedApartmentStatusSchema = z.enum([
  "saved",
  "touring",
  "applied",
  "rejected",
  "signed",
  "archived",
]);

export type SavedApartmentStatus = z.infer<typeof savedApartmentStatusSchema>;

export const savedApartmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  monthlyRent: z.number().min(0),
  neighborhood: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  status: savedApartmentStatusSchema,
  fitScore: z.number().min(0).max(100).optional(),
  affordabilityRisk: z.enum(["low", "medium", "high"]).optional(),
  listingRiskLevel: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().default(""),
  rejectedReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SavedApartment = z.infer<typeof savedApartmentSchema>;

export const shortlistActionResultSchema = z.object({
  apartment: savedApartmentSchema,
  message: z.string(),
});

export type ShortlistActionResult = z.infer<typeof shortlistActionResultSchema>;

export const tourStatusSchema = z.enum([
  "scheduled",
  "completed",
  "canceled",
]);

export type TourStatus = z.infer<typeof tourStatusSchema>;

export const tourChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum([
    "unit",
    "building",
    "neighborhood",
    "landlord",
    "move_in",
  ]),
  checked: z.boolean().default(false),
  note: z.string().default(""),
});

export type TourChecklistItem = z.infer<typeof tourChecklistItemSchema>;

export const tourRecordSchema = z.object({
  id: z.string(),
  apartmentId: z.string(),
  apartmentTitle: z.string(),
  apartmentAddress: z.string(),
  scheduledAt: z.string(),
  status: tourStatusSchema,
  checklist: z.array(tourChecklistItemSchema).default([]),
  questionsToAsk: z.array(z.string()).default([]),
  notes: z.string().default(""),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TourRecord = z.infer<typeof tourRecordSchema>;

export const applicationStageSchema = z.enum([
  "researching",
  "docs_needed",
  "ready_to_apply",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
]);

export type ApplicationStage = z.infer<typeof applicationStageSchema>;

export const applicationDocumentSchema = z.object({
  name: z.string(),
  provided: z.boolean().default(false),
});

export type ApplicationDocument = z.infer<typeof applicationDocumentSchema>;

export const applicationRecordSchema = z.object({
  id: z.string(),
  apartmentId: z.string(),
  apartmentTitle: z.string(),
  apartmentAddress: z.string(),
  stage: applicationStageSchema,
  dueDate: z.string().optional(),
  submittedAt: z.string().optional(),
  feesPaid: z.number().min(0).default(0),
  requiredDocuments: z.array(applicationDocumentSchema).default([]),
  coverNote: z.string().default(""),
  notes: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicationRecord = z.infer<typeof applicationRecordSchema>;

export const outreachDraftSchema = z.object({
  id: z.string(),
  apartmentId: z.string().optional(),
  apartmentTitle: z.string().optional(),
  kind: z.enum([
    "inquiry",
    "tour_request",
    "follow_up",
    "negotiation",
    "fee_clarification",
    "lease_question",
    "decline",
    "roommate_coordination",
  ]),
  tone: z.enum([
    "professional",
    "friendly",
    "concise",
    "assertive",
    "casual",
  ]),
  subject: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

export type OutreachDraft = z.infer<typeof outreachDraftSchema>;
