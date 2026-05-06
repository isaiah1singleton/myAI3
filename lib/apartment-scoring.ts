import {
  ApartmentFitScore,
  ApartmentListing,
  RenterPreferences,
} from "@/types/apartment";

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getTargetCommuteMinutes(preferences: RenterPreferences): number | undefined {
  const destinationMaxes = preferences.commuteDestinations
    .map((destination) => destination.maxMinutes)
    .filter((value): value is number => typeof value === "number");

  if (destinationMaxes.length > 0) {
    return Math.min(...destinationMaxes);
  }

  if (preferences.transitImportance === "high") return 30;
  if (preferences.transitImportance === "medium") return 40;
  return undefined;
}

function includesLoose(targets: string[], candidate: string): boolean {
  const normalizedCandidate = normalizeText(candidate);
  return targets.some((item) => normalizeText(item).includes(normalizedCandidate));
}

function listingText(listing: ApartmentListing): string[] {
  return [
    listing.title,
    listing.address,
    listing.neighborhood ?? "",
    listing.city,
    listing.buildingType ?? "",
    listing.transitSummary ?? "",
    listing.description ?? "",
    ...listing.amenities,
  ]
    .map(normalizeText)
    .filter(Boolean);
}

function matchesFeature(listing: ApartmentListing, feature: string): boolean {
  const haystack = listingText(listing);
  const needle = normalizeText(feature);
  return haystack.some((item) => item.includes(needle));
}

function estimateMonthlyTotal(listing: ApartmentListing): number {
  return (
    listing.monthlyRent +
    (listing.utilityEstimateMonthly ?? 0) +
    (listing.parkingMonthly ?? 0) +
    (listing.petFeesMonthly ?? 0)
  );
}

function estimateUpfrontTotal(listing: ApartmentListing): number {
  return (
    listing.monthlyRent +
    (listing.securityDeposit ?? 0) +
    (listing.applicationFee ?? 0) +
    (listing.brokerFee ?? 0)
  );
}

export function scoreApartmentFit(
  preferences: RenterPreferences,
  listing: ApartmentListing
): ApartmentFitScore {
  let score = 100;

  const matchedMustHaves: string[] = [];
  const missingMustHaves: string[] = [];
  const matchedNiceToHaves: string[] = [];
  const triggeredDealbreakers: string[] = [];

  const penalties: Array<{ reason: string; points: number }> = [];
  const bonuses: Array<{ reason: string; points: number }> = [];

  const estimatedMonthlyTotal = estimateMonthlyTotal(listing);
  const estimatedUpfrontTotal = estimateUpfrontTotal(listing);

  for (const mustHave of preferences.mustHaves) {
    if (matchesFeature(listing, mustHave)) {
      matchedMustHaves.push(mustHave);
      bonuses.push({ reason: `Matches must-have: ${mustHave}`, points: 2 });
      score += 2;
    } else {
      missingMustHaves.push(mustHave);
      penalties.push({ reason: `Missing must-have: ${mustHave}`, points: 12 });
      score -= 12;
    }
  }

  for (const niceToHave of preferences.niceToHaves) {
    if (matchesFeature(listing, niceToHave)) {
      matchedNiceToHaves.push(niceToHave);
      bonuses.push({ reason: `Matches nice-to-have: ${niceToHave}`, points: 1 });
      score += 1;
    }
  }

  for (const dealbreaker of preferences.dealbreakers) {
    if (matchesFeature(listing, dealbreaker)) {
      triggeredDealbreakers.push(dealbreaker);
      penalties.push({
        reason: `Triggers dealbreaker: ${dealbreaker}`,
        points: 20,
      });
      score -= 20;
    }
  }

  if (estimatedMonthlyTotal > preferences.maxMonthlyRent) {
    const overage = estimatedMonthlyTotal - preferences.maxMonthlyRent;
    const points = Math.min(25, Math.ceil(overage / 100) * 4);
    penalties.push({
      reason: `Estimated monthly cost exceeds budget by $${overage}`,
      points,
    });
    score -= points;
  } else {
    bonuses.push({
      reason: "Estimated monthly cost fits stated budget",
      points: 6,
    });
    score += 6;
  }

  if (
    preferences.idealMonthlyRentMax !== undefined &&
    estimatedMonthlyTotal <= preferences.idealMonthlyRentMax
  ) {
    bonuses.push({
      reason: "Fits ideal monthly budget range",
      points: 4,
    });
    score += 4;
  }

  if (
    preferences.bedroomsMin !== undefined &&
    listing.bedrooms !== undefined &&
    listing.bedrooms < preferences.bedroomsMin
  ) {
    penalties.push({
      reason: `Has fewer bedrooms than requested`,
      points: 10,
    });
    score -= 10;
  }

  if (
    preferences.bathroomsMin !== undefined &&
    listing.bathrooms !== undefined &&
    listing.bathrooms < preferences.bathroomsMin
  ) {
    penalties.push({
      reason: `Has fewer bathrooms than requested`,
      points: 8,
    });
    score -= 8;
  }

  if (preferences.willingToUseBroker === false && (listing.brokerFee ?? 0) > 0) {
    penalties.push({
      reason: "Broker fee present even though user prefers no broker",
      points: 10,
    });
    score -= 10;
  }

  if (preferences.pets.length > 0 && listing.petsAllowed === false) {
    penalties.push({
      reason: "Pets are not allowed",
      points: 18,
    });
    score -= 18;
  }

  if (
    preferences.parkingNeed &&
    preferences.parkingNeed !== "none" &&
    listing.parkingAvailable === false
  ) {
    penalties.push({
      reason: "Parking need may not be met",
      points: 8,
    });
    score -= 8;
  }

   const targetCommuteMinutes = getTargetCommuteMinutes(preferences);

  if (
    targetCommuteMinutes !== undefined &&
    listing.estimatedCommuteMinutes !== undefined
  ) {
    const overBy = listing.estimatedCommuteMinutes - targetCommuteMinutes;

    if (overBy <= 0) {
      const bonus =
        preferences.transitImportance === "high" ? 8 : 5;

      bonuses.push({
        reason: `Commute is within the target of ${targetCommuteMinutes} minutes`,
        points: bonus,
      });
      score += bonus;
    } else {
      let points = 0;

      if (overBy <= 5) {
        points = preferences.transitImportance === "high" ? 8 : 5;
      } else if (overBy <= 10) {
        points = preferences.transitImportance === "high" ? 15 : 10;
      } else if (overBy <= 20) {
        points = preferences.transitImportance === "high" ? 22 : 15;
      } else {
        points = preferences.transitImportance === "high" ? 30 : 20;
      }

      penalties.push({
        reason: `Commute exceeds target by ${overBy} minutes`,
        points,
      });
      score -= points;
    }
  }

  if (
    preferences.noiseTolerance === "low" &&
    listing.noiseRisk === "high"
  ) {
    penalties.push({
      reason: "High noise risk conflicts with low noise tolerance",
      points: 10,
    });
    score -= 10;
  }

  if (
    preferences.buildingTypePreference.length > 0 &&
    listing.buildingType &&
    includesLoose(preferences.buildingTypePreference, listing.buildingType)
  ) {
    bonuses.push({
      reason: "Matches preferred building type",
      points: 3,
    });
    score += 3;
  }

  if (!listing.utilityEstimateMonthly) {
    penalties.push({
      reason: "Utility estimate is missing",
      points: 3,
    });
    score -= 3;
  }

  if (!listing.availableDate) {
    penalties.push({
      reason: "Available date is missing",
      points: 2,
    });
    score -= 2;
  }

  score = Math.max(0, Math.min(100, score));

  let verdict: ApartmentFitScore["verdict"] = "weak-fit";
  if (score >= 80) {
    verdict = "strong-fit";
  } else if (score >= 60) {
    verdict = "possible-fit";
  }

  const positives: string[] = [];
  const concerns: string[] = [];

  if (matchedMustHaves.length > 0) {
    positives.push(`matches ${matchedMustHaves.length} must-have(s)`);
  }
  if (estimatedMonthlyTotal <= preferences.maxMonthlyRent) {
    positives.push("fits your stated monthly budget");
  }
  if (listing.estimatedCommuteMinutes !== undefined) {
    positives.push(`estimated commute is ${listing.estimatedCommuteMinutes} minutes`);
  }

  if (missingMustHaves.length > 0) {
    concerns.push(`missing must-haves: ${missingMustHaves.join(", ")}`);
  }
  if (triggeredDealbreakers.length > 0) {
    concerns.push(`dealbreakers present: ${triggeredDealbreakers.join(", ")}`);
  }
  if (estimatedMonthlyTotal > preferences.maxMonthlyRent) {
    concerns.push("estimated total monthly cost is above budget");
  }

  const explanation = [
    `This listing is a ${verdict.replace("-", " ")} with a score of ${score}/100.`,
    positives.length > 0 ? `Strengths: ${positives.join("; ")}.` : "",
    concerns.length > 0 ? `Concerns: ${concerns.join("; ")}.` : "",
    `Estimated monthly total is $${estimatedMonthlyTotal} and estimated upfront cost is $${estimatedUpfrontTotal}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    score,
    verdict,
    matchedMustHaves,
    missingMustHaves,
    matchedNiceToHaves,
    triggeredDealbreakers,
    costBreakdown: {
      baseRent: listing.monthlyRent,
      estimatedMonthlyTotal,
      estimatedUpfrontTotal,
    },
    penalties,
    bonuses,
    explanation,
  };
}
