import {
  ApartmentListing,
  ListingRiskAnalysis,
  ListingRiskSignal,
  RenterPreferences,
} from "@/types/apartment";

function addSignal(
  signals: ListingRiskSignal[],
  code: string,
  severity: "low" | "medium" | "high",
  message: string
) {
  signals.push({ code, severity, message });
}

function severityToPoints(severity: "low" | "medium" | "high"): number {
  if (severity === "high") return 25;
  if (severity === "medium") return 12;
  return 5;
}

export function detectListingRisk(
  preferences: RenterPreferences,
  listing: ApartmentListing
): ListingRiskAnalysis {
  const signals: ListingRiskSignal[] = [];

  if (listing.monthlyRent < preferences.maxMonthlyRent * 0.55) {
    addSignal(
      signals,
      "underpriced_listing",
      "medium",
      "The listing appears materially below the user's stated budget ceiling, which can be a scam signal if unsupported by other details."
    );
  }

  if (!listing.address || listing.address === "Address not provided") {
    addSignal(
      signals,
      "missing_address",
      "high",
      "The listing is missing a usable address."
    );
  }

  if (!listing.availableDate) {
    addSignal(
      signals,
      "missing_availability",
      "low",
      "The listing does not clearly state an available date."
    );
  }

  if ((listing.applicationFee ?? 0) > 150) {
    addSignal(
      signals,
      "high_application_fee",
      "medium",
      "The application fee looks unusually high and should be verified."
    );
  }

  if ((listing.brokerFee ?? 0) >= listing.monthlyRent) {
    addSignal(
      signals,
      "high_broker_fee",
      "medium",
      "The broker fee is large relative to the monthly rent."
    );
  }

  if ((listing.securityDeposit ?? 0) > listing.monthlyRent * 1.5) {
    addSignal(
      signals,
      "high_security_deposit",
      "medium",
      "The security deposit looks unusually high relative to the rent."
    );
  }

  if (!listing.sourceUrl) {
    addSignal(
      signals,
      "missing_source_url",
      "low",
      "The listing has no source URL, which makes verification harder."
    );
  }

  if (!listing.description || listing.description.trim().length < 40) {
    addSignal(
      signals,
      "thin_description",
      "low",
      "The listing description is unusually thin or vague."
    );
  }

  if (listing.noiseRisk === "high") {
    addSignal(
      signals,
      "high_noise_risk",
      "low",
      "The listing has a high stated or inferred noise risk."
    );
  }

  if ((listing.utilityEstimateMonthly ?? 0) === 0) {
    addSignal(
      signals,
      "missing_utility_estimate",
      "low",
      "Utility costs are missing or may be incomplete."
    );
  }

  const riskScore = Math.min(
    100,
    signals.reduce((sum, signal) => sum + severityToPoints(signal.severity), 0)
  );

  let riskLevel: ListingRiskAnalysis["riskLevel"] = "low";
  if (riskScore >= 50) {
    riskLevel = "high";
  } else if (riskScore >= 20) {
    riskLevel = "medium";
  }

  const saferNextSteps = [
    "Verify the listing address and management contact information.",
    "Ask for a full written fee breakdown before applying.",
    "Request confirmation of move-in date, utilities, and total upfront cost.",
    "Do not send money before proper verification and a legitimate viewing process.",
  ];

  const explanation =
    signals.length > 0
      ? `This listing has a ${riskLevel} risk profile based on these signals: ${signals
          .map((signal) => signal.message)
          .join(" ")}`
      : "No major scam or listing-quality warning was triggered from the currently available fields.";

  return {
    riskLevel,
    riskScore,
    signals,
    saferNextSteps,
    explanation,
  };
}
