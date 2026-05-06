import { tool } from "ai";
import { z } from "zod";
import { apartmentListingSchema } from "@/types/apartment";

const tourChecklistInputSchema = z.object({
  listing: apartmentListingSchema,
  workFromHome: z.boolean().optional(),
  pets: z.array(z.string()).default([]),
});

export const generateTourChecklistTool = tool({
  description:
    "Generate a practical apartment tour checklist and targeted questions based on a specific listing and renter needs.",
  inputSchema: tourChecklistInputSchema,
  execute: async ({ listing, workFromHome, pets }) => {
    const checklist = [
      { category: "unit", label: "Test water pressure in kitchen and bathroom" },
      { category: "unit", label: "Open and close windows, locks, and blinds" },
      { category: "unit", label: "Run appliances and inspect outlets" },
      { category: "building", label: "Inspect laundry, trash, and package areas" },
      { category: "neighborhood", label: "Listen for hallway and street noise" },
      { category: "landlord", label: "Ask for full fee sheet and utility expectations" },
    ];

    if (workFromHome) {
      checklist.push(
        { category: "unit", label: "Check internet options and cell signal in work area" },
        { category: "neighborhood", label: "Assess daytime noise for remote work" }
      );
    }

    if (pets.length > 0) {
      checklist.push(
        { category: "building", label: "Confirm pet rules, pet relief areas, and elevator access" },
        { category: "move_in", label: "Ask about pet fees, deposits, and breed/size restrictions" }
      );
    }

    if ((listing.amenities || []).length === 0) {
      checklist.push({
        category: "unit",
        label: "Verify all advertised amenities in person because the listing details are sparse",
      });
    }

    const questions = [
      "What utilities are included, and what are typical monthly totals?",
      "How are maintenance requests handled, and what is typical response time?",
      "How much notice is required for renewal, and how have renewals changed recently?",
      "Are there any move-in, amenity, building, or service fees not shown in the listing?",
    ];

    if (listing.noiseRisk === "high") {
      questions.push("Are there recurring noise issues from street traffic, neighbors, or nearby businesses?");
    }

    if ((listing.brokerFee ?? 0) > 0) {
      questions.push("Can you break down exactly what the broker fee covers and when it is due?");
    }

    return {
      listing: {
        title: listing.title,
        address: listing.address,
      },
      checklist,
      questions,
      summary: `Generated a tour checklist for ${listing.title}.`,
    };
  },
});
