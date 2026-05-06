import { tool } from "ai";
import { z } from "zod";
import { savedApartmentSchema } from "@/types/apartment";

export const removeSavedApartmentTool = tool({
  description:
    "Prepare a saved apartment shortlist entry for removal or archiving.",
  inputSchema: z.object({
    apartment: savedApartmentSchema,
    archiveInstead: z.boolean().default(true),
  }),
  execute: async ({ apartment, archiveInstead }) => {
    if (archiveInstead) {
      return {
        apartment: {
          ...apartment,
          status: "archived" as const,
          updatedAt: new Date().toISOString(),
        },
        remove: false,
        message: `${apartment.title} was archived from the active shortlist.`,
      };
    }

    return {
      apartment,
      remove: true,
      message: `${apartment.title} is ready to be removed from the shortlist.`,
    };
  },
});
