import {
  ApartmentFitScore,
  ApartmentListing,
  RenterPreferences,
} from "@/types/apartment";
import { scoreApartmentFit } from "@/lib/apartment-scoring";

export type ComparedApartment = {
  listing: ApartmentListing;
  fit: ApartmentFitScore;
  pros: string[];
  cons: string[];
  labels: string[];
};

export type ApartmentComparisonResult = {
  ranked: ComparedApartment[];
  summary: string;
  categoryWinners: {
    bestOverall?: string;
    bestValue?: string;
    lowestRisk?: string;
    bestCommute?: string;
    bestAmenities?: string;
  };
};

function buildPros(listing: ApartmentListing, fit: ApartmentFitScore): string[] {
  const pros: string[] = [];

  if (fit.matchedMustHaves.length > 0) {
    pros.push(`Matches must-haves: ${fit.matchedMustHaves.join(", ")}`);
  }

  if (fit.costBreakdown.estimatedMonthlyTotal === listing.monthlyRent) {
    pros.push("Few extra monthly costs are currently listed");
  }

  if (listing.estimatedCommuteMinutes !== undefined) {
    pros.push(`Estimated commute: ${listing.estimatedCommuteMinutes} minutes`);
  }

  if (listing.amenities.length > 0) {
    pros.push(`Amenities: ${listing.amenities.join(", ")}`);
  }

  if (listing.brokerFee === 0) {
    pros.push("No broker fee listed");
  }

  return pros.slice(0, 4);
}

function buildCons(listing: ApartmentListing, fit: ApartmentFitScore): string[] {
  const cons: string[] = [];

  if (fit.missingMustHaves.length > 0) {
    cons.push(`Missing must-haves: ${fit.missingMustHaves.join(", ")}`);
  }

  if (fit.triggeredDealbreakers.length > 0) {
    cons.push(`Triggers dealbreakers: ${fit.triggeredDealbreakers.join(", ")}`);
  }

  if (listing.brokerFee && listing.brokerFee > 0) {
    cons.push(`Broker fee: $${listing.brokerFee}`);
  }

  if (!listing.availableDate) {
    cons.push("Available date is missing");
  }

  if (!listing.utilityEstimateMonthly) {
    cons.push("Utility estimate is missing");
  }

  if (listing.noiseRisk === "high") {
    cons.push("High stated or inferred noise risk");
  }

  return cons.slice(0, 4);
}

function buildLabels(
  listing: ApartmentListing,
  fit: ApartmentFitScore,
  preferences: RenterPreferences
): string[] {
  const labels: string[] = [];

  if (fit.score >= 80) {
    labels.push("strong overall fit");
  }

  if (fit.costBreakdown.estimatedMonthlyTotal <= preferences.maxMonthlyRent) {
    labels.push("within budget");
  }

  if (listing.estimatedCommuteMinutes !== undefined && listing.estimatedCommuteMinutes <= 30) {
    labels.push("strong commute");
  }

  if ((listing.brokerFee ?? 0) === 0) {
    labels.push("lower upfront friction");
  }

  if (listing.amenities.length >= 4) {
    labels.push("amenity-rich");
  }

  return labels;
}

export function compareApartments(
  preferences: RenterPreferences,
  listings: ApartmentListing[]
): ApartmentComparisonResult {
  const ranked = listings
    .map((listing) => {
      const fit = scoreApartmentFit(preferences, listing);
      return {
        listing,
        fit,
        pros: buildPros(listing, fit),
        cons: buildCons(listing, fit),
        labels: buildLabels(listing, fit, preferences),
      };
    })
    .sort((a, b) => b.fit.score - a.fit.score);

  const bestOverall = ranked[0];

  const bestValue = [...ranked].sort((a, b) => {
    const aValue = a.fit.score / Math.max(a.fit.costBreakdown.estimatedMonthlyTotal, 1);
    const bValue = b.fit.score / Math.max(b.fit.costBreakdown.estimatedMonthlyTotal, 1);
    return bValue - aValue;
  })[0];

  const lowestRisk = [...ranked].sort((a, b) => {
    const aPenalty = a.fit.penalties
      .filter((p) => p.reason.toLowerCase().includes("dealbreaker") || p.reason.toLowerCase().includes("missing"))
      .reduce((sum, p) => sum + p.points, 0);
    const bPenalty = b.fit.penalties
      .filter((p) => p.reason.toLowerCase().includes("dealbreaker") || p.reason.toLowerCase().includes("missing"))
      .reduce((sum, p) => sum + p.points, 0);
    return aPenalty - bPenalty;
  })[0];

  const bestCommute = [...ranked]
    .filter((item) => item.listing.estimatedCommuteMinutes !== undefined)
    .sort(
      (a, b) =>
        (a.listing.estimatedCommuteMinutes ?? 999) -
        (b.listing.estimatedCommuteMinutes ?? 999)
    )[0];

  const bestAmenities = [...ranked].sort(
    (a, b) => b.listing.amenities.length - a.listing.amenities.length
  )[0];

  const summaryParts = [
    bestOverall
      ? `${bestOverall.listing.title} ranks highest overall at ${bestOverall.fit.score}/100.`
      : "",
    bestValue
      ? `${bestValue.listing.title} offers the strongest score-for-cost value.`
      : "",
    bestCommute
      ? `${bestCommute.listing.title} has the shortest commute among these options.`
      : "",
    lowestRisk
      ? `${lowestRisk.listing.title} appears to have the fewest major fit and information risks.`
      : "",
  ].filter(Boolean);

  return {
    ranked,
    summary: summaryParts.join(" "),
    categoryWinners: {
      bestOverall: bestOverall?.listing.title,
      bestValue: bestValue?.listing.title,
      lowestRisk: lowestRisk?.listing.title,
      bestCommute: bestCommute?.listing.title,
      bestAmenities: bestAmenities?.listing.title,
    },
  };
}
