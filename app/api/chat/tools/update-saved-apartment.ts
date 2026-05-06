import { tool } from "ai";
import { z } from "zod";
import { savedApartmentSchema, savedApartmentStatusSchema } from "@/types/apartment";

export const updateSavedApartmentTool = tool({
  description:
    "Update the status, notes, or rejection reason for a previously saved apartment shortlist entry.",
  inputSchema: z.object({
    apartment: savedApartmentSchema,
    status: savedApartmentStatusSchema.optional(),
    notes: z.string().optional(),
    rejectedReason: z.string().optional(),
  }),
  execute: async ({ apartment, status, notes, rejectedReason }) => {
    const updatedApartment = savedApartmentSchema.parse({
      ...apartment,
      status: status ?? apartment.status,
      notes: notes ?? apartment.notes,
      rejectedReason: rejectedReason ?? apartment.rejectedReason,
      updatedAt: new Date().toISOString(),
    });

    return {
      apartment: updatedApartment,
      message: `${updatedApartment.title} was updated to status "${updatedApartment.status}".`,
    };
  },
});
