import { ApartmentListing, RenterPreferences, AffordabilityAnalysis } from "@/types/apartment";

export type AffordabilityInputs = {
  grossMonthlyIncome?: number;
  savingsAvailable?: number;
  movingCostEstimate?: number;
  rentersInsuranceEstimateMonthly?: number;
  lastMonthRentRequired?: boolean;
};

function estimateMonthlyTotal(
  listing: ApartmentListing,
  rentersInsuranceEstimateMonthly: number
): number {
  return (
    listing.monthlyRent +
    (listing.utilityEstimateMonthly ?? 0) +
    (listing.parkingMonthly ?? 0) +
    (listing.petFeesMonthly ?? 0) +
    rentersInsuranceEstimateMonthly
  );
}

function estimateUpfrontTotal(
  listing: ApartmentListing,
  movingCostEstimate: number,
  lastMonthRentRequired: boolean
): number {
  return (
    listing.monthlyRent +
    (lastMonthRentRequired ? listing.monthlyRent : 0) +
    (listing.securityDeposit ?? 0) +
    (listing.applicationFee ?? 0) +
    (listing.brokerFee ?? 0) +
    movingCostEstimate
  );
}

export function calculateAffordability(
  preferences: RenterPreferences,
  listing: ApartmentListing,
  inputs: AffordabilityInputs
): AffordabilityAnalysis {
  const rentersInsuranceEstimateMonthly =
    inputs.rentersInsuranceEstimateMonthly ?? 20;
  const movingCostEstimate = inputs.movingCostEstimate ?? 400;
  const lastMonthRentRequired = inputs.lastMonthRentRequired ?? false;

  const estimatedMonthlyTotal = estimateMonthlyTotal(
    listing,
    rentersInsuranceEstimateMonthly
  );

  const estimatedUpfrontTotal = estimateUpfrontTotal(
    listing,
    movingCostEstimate,
    lastMonthRentRequired
  );

  const grossMonthlyIncome = inputs.grossMonthlyIncome;
  const savingsAvailable = inputs.savingsAvailable;

  const warnings: string[] = [];
  let riskPoints = 0;

  if (estimatedMonthlyTotal > preferences.maxMonthlyRent) {
    warnings.push("Estimated monthly housing cost is above the stated budget.");
    riskPoints += 30;
  }

  if (
    preferences.idealMonthlyRentMax !== undefined &&
    estimatedMonthlyTotal > preferences.idealMonthlyRentMax
  ) {
    warnings.push("Estimated monthly housing cost is above the ideal budget range.");
    riskPoints += 10;
  }

  let rentToIncomeRatio: number | undefined;
  let monthlyCostToIncomeRatio: number | undefined;

  if (grossMonthlyIncome && grossMonthlyIncome > 0) {
    rentToIncomeRatio = listing.monthlyRent / grossMonthlyIncome;
    monthlyCostToIncomeRatio = estimatedMonthlyTotal / grossMonthlyIncome;

    if (rentToIncomeRatio > 0.3) {
      warnings.push("Base rent is above 30% of gross monthly income.");
      riskPoints += 15;
    }

    if (monthlyCostToIncomeRatio > 0.35) {
      warnings.push("Estimated total monthly housing cost is above 35% of gross monthly income.");
      riskPoints += 20;
    }
  }

  if (savingsAvailable !== undefined && estimatedUpfrontTotal > savingsAvailable) {
    warnings.push("Estimated upfront move-in cost exceeds the stated savings available.");
    riskPoints += 25;
  }

  if ((listing.brokerFee ?? 0) > 0) {
    warnings.push("Broker fee materially increases upfront move-in cost.");
    riskPoints += 8;
  }

  if ((listing.utilityEstimateMonthly ?? 0) === 0) {
    warnings.push("Utilities may be understated or incomplete.");
    riskPoints += 5;
  }

  let affordabilityRisk: AffordabilityAnalysis["affordabilityRisk"] = "low";
  if (riskPoints >= 45) {
    affordabilityRisk = "high";
  } else if (riskPoints >= 20) {
    affordabilityRisk = "medium";
  }

  const explanationParts = [
    `Estimated monthly total is $${estimatedMonthlyTotal}.`,
    `Estimated upfront total is $${estimatedUpfrontTotal}.`,
    rentToIncomeRatio !== undefined
      ? `Base rent is ${Math.round(rentToIncomeRatio * 100)}% of gross monthly income.`
      : "",
    monthlyCostToIncomeRatio !== undefined
      ? `Estimated total monthly housing cost is ${Math.round(
          monthlyCostToIncomeRatio * 100
        )}% of gross monthly income.`
      : "",
    warnings.length > 0 ? `Main affordability concerns: ${warnings.join(" ")}` : "No major affordability warning was triggered from the current inputs.",
  ].filter(Boolean);

  return {
    monthlyRent: listing.monthlyRent,
    estimatedMonthlyTotal,
    estimatedUpfrontTotal,
    rentToIncomeRatio,
    monthlyCostToIncomeRatio,
    affordabilityRisk,
    warnings,
    explanation: explanationParts.join(" "),
  };
}
