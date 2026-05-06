import {
  ApartmentListing,
  LeaseDocumentSummary,
  LeaseFlag,
  LeaseDocumentInput,
} from "@/types/apartment";

function parseDollarAmount(text: string, labelPatterns: string[]): number | undefined {
  for (const pattern of labelPatterns) {
    const regex = new RegExp(`${pattern}[^\\d$]*\\$?([\\d,]+(?:\\.\\d{1,2})?)`, "i");
    const match = text.match(regex);
    if (match?.[1]) {
      return Number(match[1].replace(/,/g, ""));
    }
  }
  return undefined;
}

function parseLeaseMonths(text: string): number | undefined {
  const monthMatch = text.match(/(\\d{1,2})\\s*month/i);
  if (monthMatch?.[1]) {
    return Number(monthMatch[1]);
  }
  return undefined;
}

function parseMoveInDate(text: string): string | undefined {
  const match = text.match(
    /(move[- ]?in date|lease start|term begins|commencement date)[^\\n:]*[:\\-]?\\s*([A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2})/i
  );
  return match?.[2]?.trim();
}

function extractClause(text: string, keywords: string[]): string | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const loweredKeywords = keywords.map((k) => k.toLowerCase());

  const matched = lines.find((line) =>
    loweredKeywords.some((keyword) => line.toLowerCase().includes(keyword))
  );

  return matched;
}

function addFlag(
  flags: LeaseFlag[],
  code: string,
  severity: "low" | "medium" | "high",
  message: string
) {
  flags.push({ code, severity, message });
}

function compareToListing(
  extractedTerms: LeaseDocumentSummary["extractedTerms"],
  listing?: ApartmentListing
): string[] {
  if (!listing) return [];

  const mismatches: string[] = [];

  if (
    extractedTerms.monthlyRent !== undefined &&
    extractedTerms.monthlyRent !== listing.monthlyRent
  ) {
    mismatches.push(
      `Lease rent ($${extractedTerms.monthlyRent}) does not match listing rent ($${listing.monthlyRent}).`
    );
  }

  if (
    extractedTerms.securityDeposit !== undefined &&
    listing.securityDeposit !== undefined &&
    extractedTerms.securityDeposit !== listing.securityDeposit
  ) {
    mismatches.push(
      `Lease security deposit ($${extractedTerms.securityDeposit}) does not match listing security deposit ($${listing.securityDeposit}).`
    );
  }

  if (
    extractedTerms.brokerFee !== undefined &&
    listing.brokerFee !== undefined &&
    extractedTerms.brokerFee !== listing.brokerFee
  ) {
    mismatches.push(
      `Lease broker fee ($${extractedTerms.brokerFee}) does not match listing broker fee ($${listing.brokerFee}).`
    );
  }

  if (
    extractedTerms.applicationFee !== undefined &&
    listing.applicationFee !== undefined &&
    extractedTerms.applicationFee !== listing.applicationFee
  ) {
    mismatches.push(
      `Lease/application fee ($${extractedTerms.applicationFee}) does not match listing application fee ($${listing.applicationFee}).`
    );
  }

  if (
    extractedTerms.moveInDate &&
    listing.availableDate &&
    extractedTerms.moveInDate !== listing.availableDate
  ) {
    mismatches.push(
      `Lease move-in/start date (${extractedTerms.moveInDate}) does not match listing availability date (${listing.availableDate}).`
    );
  }

  if (
    extractedTerms.leaseLengthMonths !== undefined &&
    listing.leaseLengthMonths !== undefined &&
    extractedTerms.leaseLengthMonths !== listing.leaseLengthMonths
  ) {
    mismatches.push(
      `Lease term (${extractedTerms.leaseLengthMonths} months) does not match listing term (${listing.leaseLengthMonths} months).`
    );
  }

  return mismatches;
}

export function reviewLeaseDocument(input: LeaseDocumentInput): LeaseDocumentSummary {
  const text = input.documentText;
  const flags: LeaseFlag[] = [];

  const extractedTerms: LeaseDocumentSummary["extractedTerms"] = {
    monthlyRent: parseDollarAmount(text, ["monthly rent", "rent"]),
    securityDeposit: parseDollarAmount(text, ["security deposit", "deposit"]),
    brokerFee: parseDollarAmount(text, ["broker fee"]),
    applicationFee: parseDollarAmount(text, ["application fee"]),
    moveInDate: parseMoveInDate(text),
    leaseLengthMonths: parseLeaseMonths(text),
    petPolicy: extractClause(text, ["pet", "pets"]),
    guestPolicy: extractClause(text, ["guest", "guests", "occupancy"]),
    sublettingPolicy: extractClause(text, ["sublet", "subletting", "assignment"]),
    renewalTerms: extractClause(text, ["renewal", "renew"]),
    noticePeriod: extractClause(text, ["notice", "60 days", "30 days"]),
    maintenanceResponsibility: extractClause(text, ["maintenance", "repair", "repairs"]),
    utilitiesResponsibility: extractClause(text, ["utilities", "electric", "gas", "water", "heat"]),
    lateFeeTerms: extractClause(text, ["late fee", "late charge"]),
    earlyTerminationTerms: extractClause(text, ["early termination", "termination", "break lease"]),
  };

  if (!extractedTerms.monthlyRent) {
    addFlag(flags, "missing_rent", "medium", "The document does not clearly state the monthly rent.");
  }

  if (!extractedTerms.leaseLengthMonths) {
    addFlag(flags, "missing_term", "medium", "The document does not clearly state the lease term length.");
  }

  if (!extractedTerms.moveInDate) {
    addFlag(flags, "missing_move_in_date", "low", "The document does not clearly state the move-in or lease start date.");
  }

  if (!extractedTerms.utilitiesResponsibility) {
    addFlag(flags, "missing_utilities_detail", "medium", "Utility responsibility is not clearly described.");
  }

  if (!extractedTerms.earlyTerminationTerms) {
    addFlag(flags, "missing_termination_terms", "medium", "Early termination terms are not clearly described.");
  }

  if (extractedTerms.applicationFee && extractedTerms.applicationFee > 150) {
    addFlag(flags, "high_application_fee", "medium", "The application fee appears unusually high.");
  }

  if (
    extractedTerms.securityDeposit !== undefined &&
    extractedTerms.monthlyRent !== undefined &&
    extractedTerms.securityDeposit > extractedTerms.monthlyRent * 1.5
  ) {
    addFlag(flags, "high_security_deposit", "medium", "The security deposit appears unusually high relative to monthly rent.");
  }

  if (extractedTerms.brokerFee && extractedTerms.monthlyRent) {
    if (extractedTerms.brokerFee >= extractedTerms.monthlyRent) {
      addFlag(flags, "high_broker_fee", "medium", "The broker fee is large relative to the monthly rent.");
    }
  }

  const listingMismatches = compareToListing(extractedTerms, input.listingContext);

  if (listingMismatches.length > 0) {
    addFlag(flags, "listing_mismatch", "high", "One or more lease terms do not match the listing details.");
  }

  const questionsToAsk = [
    !extractedTerms.utilitiesResponsibility
      ? "Which utilities am I responsible for, and what are typical monthly costs?"
      : null,
    !extractedTerms.earlyTerminationTerms
      ? "What happens if I need to end the lease early?"
      : null,
    !extractedTerms.renewalTerms
      ? "How are renewals handled, and how much notice is required?"
      : null,
    listingMismatches.length > 0
      ? "Can you explain why the lease terms differ from the listing details?"
      : null,
    !extractedTerms.petPolicy && input.documentType === "lease"
      ? "What are the exact pet rules, fees, and restrictions?"
      : null,
  ].filter((value): value is string => Boolean(value));

  const explanationParts = [
    `This ${input.documentType.replace(/_/g, " ")} was reviewed for key rent, fee, term, and policy details.`,
    extractedTerms.monthlyRent !== undefined
      ? `Extracted monthly rent: $${extractedTerms.monthlyRent}.`
      : "",
    extractedTerms.leaseLengthMonths !== undefined
      ? `Extracted lease term: ${extractedTerms.leaseLengthMonths} months.`
      : "",
    listingMismatches.length > 0
      ? `Potential mismatches with the listing were found: ${listingMismatches.join(" ")}`
      : "No direct mismatch with the provided listing context was detected from the extracted fields.",
    flags.length > 0
      ? `Main review flags: ${flags.map((flag) => flag.message).join(" ")}`
      : "No major document warning was triggered from the currently extracted fields.",
  ].filter(Boolean);

  return {
    documentType: input.documentType,
    extractedTerms,
    flags,
    listingMismatches,
    questionsToAsk,
    explanation: explanationParts.join(" "),
    legalCaution:
      "This is a plain-language review, not legal advice. For unclear, high-stakes, or jurisdiction-specific clauses, you should consult a qualified attorney or tenant-rights resource.",
  };
}
