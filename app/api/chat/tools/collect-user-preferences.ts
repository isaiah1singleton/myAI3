import { tool } from "ai";
import { renterPreferencesSchema } from "@/types/apartment";

export const collectUserPreferences = tool({
  description:
    "Structure a renter's apartment search preferences into a normalized profile for later search, comparison, and scoring.",
  inputSchema: renterPreferencesSchema,
  execute: async (input) => {
    const summaryParts = [
      `Searching in ${input.city}`,
      `max monthly rent $${input.maxMonthlyRent}`,
      input.idealMonthlyRentMin !== undefined || input.idealMonthlyRentMax !== undefined
        ? `ideal range $${input.idealMonthlyRentMin ?? 0}-$${input.idealMonthlyRentMax ?? input.maxMonthlyRent}`
        : "",
      input.moveInDate ? `move-in ${input.moveInDate}` : "",
      input.bedroomsMin !== undefined ? `${input.bedroomsMin}+ bedroom` : "",
      input.mustHaves.length > 0 ? `must-haves: ${input.mustHaves.join(", ")}` : "",
      input.dealbreakers.length > 0 ? `dealbreakers: ${input.dealbreakers.join(", ")}` : "",
    ].filter(Boolean);

    return {
      preferences: input,
      summary: summaryParts.join(" | "),
      completeness: {
        hasCity: Boolean(input.city),
        hasBudget: input.maxMonthlyRent > 0,
        hasMoveInDate: Boolean(input.moveInDate),
        hasMustHaves: input.mustHaves.length > 0,
        hasCommuteInfo: input.commuteDestinations.length > 0,
      },
      nextQuestions: [
        !input.moveInDate ? "What is your target move-in date?" : null,
        input.mustHaves.length === 0 ? "What are your must-have amenities or constraints?" : null,
        input.commuteDestinations.length === 0
          ? "Do you have a work, school, or other commute destination that should affect ranking?"
          : null,
      ].filter(Boolean),
    };
  },
});
