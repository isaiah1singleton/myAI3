import { tool } from "ai";
import { leaseDocumentInputSchema } from "@/types/apartment";
import { reviewLeaseDocument } from "@/lib/lease-review";

export const summarizeLeaseDocumentTool = tool({
  description:
    "Summarize a lease or rental-related document, extract important terms, flag unusual clauses or fees, and compare it against listing details when available.",
  inputSchema: leaseDocumentInputSchema,
  execute: async (input) => {
    const review = reviewLeaseDocument(input);

    return {
      review,
    };
  },
});
