import { tool } from "ai";
import { z } from "zod";

export const draftLandlordMessageTool = tool({
  description:
    "Draft a landlord, broker, or property manager message in a selected tone for inquiries, tours, follow-ups, or clarification requests.",
  inputSchema: z.object({
    kind: z.enum([
      "inquiry",
      "tour_request",
      "follow_up",
      "negotiation",
      "fee_clarification",
      "lease_question",
      "decline",
    ]),
    tone: z.enum([
      "professional",
      "friendly",
      "concise",
      "assertive",
      "casual",
    ]),
    apartmentTitle: z.string().optional(),
    address: z.string().optional(),
    moveInDate: z.string().optional(),
    questions: z.array(z.string()).default([]),
    userContext: z.string().optional(),
  }),
  execute: async ({
    kind,
    tone,
    apartmentTitle,
    address,
    moveInDate,
    questions,
    userContext,
  }) => {
    const subjectMap: Record<string, string> = {
      inquiry: `Inquiry about ${apartmentTitle ?? "the apartment"}`,
      tour_request: `Tour request for ${apartmentTitle ?? address ?? "the apartment"}`,
      follow_up: `Follow-up on ${apartmentTitle ?? "the apartment"}`,
      negotiation: `Question about pricing and fees`,
      fee_clarification: `Clarification on listed fees`,
      lease_question: `Lease question`,
      decline: `Update on apartment interest`,
    };

    const toneIntroMap: Record<string, string> = {
      professional: "Hello,",
      friendly: "Hi there,",
      concise: "Hi,",
      assertive: "Hello,",
      casual: "Hi,",
    };

    const bodyLines = [toneIntroMap[tone]];

    if (kind === "tour_request") {
      bodyLines.push(
        `I'm interested in ${apartmentTitle ?? "the apartment"}${address ? ` at ${address}` : ""}.`
      );
      if (moveInDate) {
        bodyLines.push(`I'm targeting a move-in around ${moveInDate}.`);
      }
      bodyLines.push("I'd like to schedule a tour if the unit is still available.");
    } else if (kind === "fee_clarification") {
      bodyLines.push(
        `I'm interested in ${apartmentTitle ?? "the apartment"} and wanted to confirm the full cost before moving forward.`
      );
      bodyLines.push("Could you clarify the complete list of upfront and recurring fees?");
    } else if (kind === "lease_question") {
      bodyLines.push("I reviewed the lease information and had a few questions before moving forward.");
    } else if (kind === "decline") {
      bodyLines.push("Thank you for your time and the information you shared.");
      bodyLines.push("I've decided to move forward with a different option, but I appreciate your help.");
    } else {
      bodyLines.push(`I'm reaching out about ${apartmentTitle ?? "the apartment"}.`);
    }

    if (userContext) {
      bodyLines.push(userContext);
    }

    if (questions.length > 0) {
      bodyLines.push("A few questions I wanted to confirm:");
      questions.forEach((question, index) => {
        bodyLines.push(`${index + 1}. ${question}`);
      });
    }

    bodyLines.push("Thank you.");

    return {
      subject: subjectMap[kind],
      body: bodyLines.join("\n"),
      tone,
      kind,
    };
  },
});
