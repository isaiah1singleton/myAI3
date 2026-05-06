# Apartment Shopping AI Assistant Product Design

## 1. Repository Analysis and Implementation Map

### Current repository shape

This repository is a generic AI chat application built on Next.js and AI SDK.

- Chat UI: [app/page.tsx](/Users/isaiahsingleton/Desktop/myAI3/app/page.tsx)
- Chat API entrypoint: [app/api/chat/route.ts](/Users/isaiahsingleton/Desktop/myAI3/app/api/chat/route.ts)
- System behavior prompt: [prompts.ts](/Users/isaiahsingleton/Desktop/myAI3/prompts.ts)
- Global config and model selection: [config.ts](/Users/isaiahsingleton/Desktop/myAI3/config.ts)
- Existing tools: [app/api/chat/tools/web-search.ts](/Users/isaiahsingleton/Desktop/myAI3/app/api/chat/tools/web-search.ts), [app/api/chat/tools/search-vector-database.ts](/Users/isaiahsingleton/Desktop/myAI3/app/api/chat/tools/search-vector-database.ts)
- Tool rendering UI: [components/messages/tool-call.tsx](/Users/isaiahsingleton/Desktop/myAI3/components/messages/tool-call.tsx)
- Assistant rendering: [components/messages/assistant-message.tsx](/Users/isaiahsingleton/Desktop/myAI3/components/messages/assistant-message.tsx)
- Current shared types: [types/data.ts](/Users/isaiahsingleton/Desktop/myAI3/types/data.ts)

### Current workflow

1. User sends a plain-text message in the chat UI.
2. `app/page.tsx` stores local conversation state in `localStorage`.
3. `app/api/chat/route.ts` moderates the latest user message.
4. The model runs with a static system prompt and two tools only:
   - `webSearch`
   - `vectorDatabaseSearch`
5. The response streams back into the message wall with reasoning and tool-call status.

### What the current app already supports

- Streaming chat
- Tool calling
- Basic web search
- Basic vector search
- Citations
- Moderation
- Simple extensibility through the `app/api/chat/tools/` folder

### Gaps for the apartment assistant

The current app does not yet have:

- Structured renter profile capture
- Persistent user profile beyond browser-local chat history
- Apartment listing schema
- Listing ingestion from URLs, screenshots, PDFs, or spreadsheets
- Comparison tables and shortlist management
- Budget calculator and commute calculator
- Risk scoring / scam detection
- Tour scheduling workflow
- Application tracker
- Lease/document parsing and review
- Domain-specific prompt and policy controls

### Files to change for this product

#### Existing files to update

- [config.ts](/Users/isaiahsingleton/Desktop/myAI3/config.ts)
  - Rename and brand the assistant
  - Update welcome message
  - Add product-specific config values

- [prompts.ts](/Users/isaiahsingleton/Desktop/myAI3/prompts.ts)
  - Replace the generic/course prompt with an apartment-assistant system prompt
  - Add fair-housing, risk, and uncertainty instructions

- [app/api/chat/route.ts](/Users/isaiahsingleton/Desktop/myAI3/app/api/chat/route.ts)
  - Register new apartment tools
  - Increase structured tool orchestration
  - Optionally add authenticated user/session context

- [components/messages/tool-call.tsx](/Users/isaiahsingleton/Desktop/myAI3/components/messages/tool-call.tsx)
  - Add user-friendly labels/icons for apartment domain tools

- [components/messages/assistant-message.tsx](/Users/isaiahsingleton/Desktop/myAI3/components/messages/assistant-message.tsx)
  - Support richer domain result cards if tool outputs are rendered inline

- [app/page.tsx](/Users/isaiahsingleton/Desktop/myAI3/app/page.tsx)
  - Add onboarding entry points
  - Add upload controls
  - Add saved shortlist, comparison, and tracker surfaces

#### New backend files to add

- `app/api/chat/tools/collect-user-preferences.ts`
- `app/api/chat/tools/search-apartment-listings.ts`
- `app/api/chat/tools/ingest-listing-document.ts`
- `app/api/chat/tools/deduplicate-listings.ts`
- `app/api/chat/tools/score-listings.ts`
- `app/api/chat/tools/compare-listings.ts`
- `app/api/chat/tools/calculate-affordability.ts`
- `app/api/chat/tools/analyze-commute.ts`
- `app/api/chat/tools/detect-listing-risk.ts`
- `app/api/chat/tools/summarize-lease-document.ts`
- `app/api/chat/tools/generate-tour-checklist.ts`
- `app/api/chat/tools/draft-landlord-message.ts`
- `app/api/chat/tools/update-application-tracker.ts`

#### New frontend/domain files to add

- `types/apartment.ts`
- `lib/apartment-scoring.ts`
- `lib/affordability.ts`
- `lib/commute.ts`
- `lib/risk-rules.ts`
- `lib/listing-normalization.ts`
- `components/apartments/listing-card.tsx`
- `components/apartments/shortlist-panel.tsx`
- `components/apartments/comparison-table.tsx`
- `components/apartments/fit-score-badge.tsx`
- `components/apartments/risk-score-badge.tsx`
- `components/apartments/budget-summary.tsx`
- `components/apartments/tour-checklist.tsx`
- `components/apartments/application-tracker.tsx`
- `components/apartments/document-review-card.tsx`

#### Data/persistence additions

- `app/api/user/preferences/route.ts`
- `app/api/listings/route.ts`
- `app/api/shortlist/route.ts`
- `app/api/applications/route.ts`
- `app/api/uploads/route.ts`
- Database schema files if Prisma/Drizzle/Supabase is added

### Recommended product workflow in this repo

1. Replace the assistant identity and prompt with apartment-specific behavior.
2. Add deterministic domain logic first:
   - affordability
   - fit scoring
   - scam heuristics
   - commute normalization
3. Add listing ingestion and normalized apartment types.
4. Add tool endpoints to let the LLM invoke those functions.
5. Add UI cards and comparison views for structured outputs.
6. Add persistence for shortlist, notes, applications, and user profile.
7. Add document parsing and calendar/email integrations.

## 2. Product Overview

### Product name

Working name: `LeaseLens`

### Core purpose

LeaseLens is an apartment-shopping AI assistant for renters. Its job is to act like a knowledgeable rental advisor that helps users search, evaluate, compare, organize, and act on apartment opportunities with less wasted time and less avoidable risk.

It should:

- Turn messy apartment hunting into a structured decision process
- Translate user preferences into search filters and decision rules
- Find and ingest listings from multiple sources
- Score apartments against the user’s actual priorities
- Surface tradeoffs, hidden costs, and uncertainty
- Help users communicate, schedule, document, and decide

The assistant is not just a search engine. It is a workflow partner.

## 3. Target Audience

- First-time renters who need guidance and structure
- Busy professionals who want a faster search process
- Relocating renters unfamiliar with a new city
- Students looking for budget-conscious, commute-friendly housing
- Couples, families, and pet owners with constraint-heavy searches
- Users who need help comparing many options across many variables

## 4. Product Pitch

### Who gets value

- Renters save time, avoid bad fits, and make better decisions.
- Relocating users reduce uncertainty about neighborhoods and commutes.
- Budget-sensitive users avoid underestimating total cost.

### Competitive alternatives

- Zillow, Apartments.com, StreetEasy, RentHop, Craigslist
- Broker outreach and manual spreadsheet tracking
- Generic chatbots

### Why this assistant is better

- Cross-source comparison instead of single-marketplace browsing
- User-priority-based ranking instead of generic sort order
- Integrated cost, commute, and risk analysis
- Lease and communication support in the same workflow
- Search plus organization plus decision support in one place

## 5. Course Deliverables

### Deliverable status template

- Public AI assistant URL: `TBD at deployment`
- Public GitHub repository URL: `TBD after repository publishing`
- One-page summary: included at the end of this document

### Specific expertise

Apartment search, rental comparison, affordability analysis, risk detection, tour prep, lease understanding, and application organization for renters.

## 6. Assistant Behavior and Responsibilities

The assistant should:

- Ask structured questions at the start
- Convert natural language into explicit search filters
- Explain tradeoffs in plain language
- Flag uncertainty and missing data
- Be skeptical of suspicious listings
- Organize the user’s process over time
- Avoid pressure tactics
- Recommend next steps, not commands

The assistant should not:

- Make legal guarantees
- Make safety guarantees
- Pretend to know missing listing details
- Recommend based on protected characteristics
- Encourage unsafe payment behavior
- Misrepresent the user in applications

## 7. Onboarding and Preference Collection

### Intake goals

The first conversation should capture enough detail to score and filter listings without overwhelming the user.

### Core onboarding questions

1. What city or metro area are you targeting?
2. Which neighborhoods are preferred, acceptable, or off-limits?
3. What is your hard monthly rent ceiling?
4. What is your ideal rent range?
5. What move-in date are you targeting?
6. What lease length do you want?
7. How many bedrooms and bathrooms do you need?
8. Will you live alone, with a partner, roommates, family, or pets?
9. What amenities are must-haves?
10. What amenities are nice-to-haves?
11. What are your dealbreakers?
12. Do you need parking? If yes, street, garage, or included?
13. How important is public transit?
14. What destinations do you commute to, and how often?
15. Do you work from home? If yes, how important are quiet and layout?
16. What safety preferences matter most to you?
17. What is your noise tolerance?
18. What building type do you prefer: high-rise, small building, townhouse, garden-style, walk-up?
19. How important is walkability?
20. Do you need a specific school district?
21. Do you have accessibility needs?
22. Do you want help assessing eligibility based on credit score or income?
23. Are you willing to use a broker and pay a broker fee?
24. Are you looking for luxury, budget, student, family-friendly, pet-friendly, or short-term housing?

### Follow-up logic examples

- If the user says “safe area,” ask what objective proxies matter:
  - lower violent-crime rate
  - better lighting / foot traffic
  - doorman / controlled access
- If the rent ceiling conflicts with location and size, ask which can flex:
  - neighborhood
  - size
  - commute
  - amenities
- If the user says “near transit,” ask:
  - subway, commuter rail, bus, ferry
  - maximum walk to station
- If the user says “pet-friendly,” ask:
  - pet type, breed/size, monthly pet rent, deposit tolerance

### Suggested onboarding prompt style

Use progressive intake in 2-4 questions at a time. Show the captured profile back to the user and ask for corrections before searching.

## 8. Search and Listing Discovery

### Search capabilities

The assistant should:

- Accept natural-language search requests
- Map them into structured filters
- Search multiple sources
- Ingest user-provided listing data
- Normalize listings into a shared schema
- Deduplicate duplicates across sources
- Detect stale or incomplete entries
- Rank by fit score
- Re-rank instantly when priorities change

### Input sources

- Rental platform URLs
- Property management websites
- Broker listings
- Emails
- PDFs
- Screenshots
- CSV / spreadsheet uploads
- Manual entry

### Recommended integrations

- Rental listing APIs where available
- Google Maps Places API
- Google Distance Matrix or Routes API
- Mapbox Geocoding and Isochrones as lower-cost alternative
- Transit APIs such as Google Transit-backed routes or local GTFS feeds
- Calendar integration with Google Calendar / Outlook
- Email integration with Gmail / Outlook
- Document upload and OCR
- Spreadsheet import/export

### Discovery pipeline

1. Parse user query into filters.
2. Query listing providers and/or ingest uploaded data.
3. Normalize fields into the apartment schema.
4. Geocode addresses.
5. Enrich with commute, nearby places, and building review data.
6. Deduplicate by address, unit, photos, and text similarity.
7. Score fit, affordability, and risk.
8. Return shortlist with explanations.

## 9. Apartment Evaluation Framework

### Score categories

Each listing should receive:

- `Fit Score` from 0-100
- `Affordability Score` from 0-100
- `Commute Score` from 0-100
- `Risk Score` from 0-100 where higher means more risk
- `Confidence Score` from 0-100 based on data completeness and freshness

### Evaluation dimensions

- Price and total monthly cost
- Upfront move-in cost
- Lease fit
- Apartment features and condition
- Location and commute
- Lifestyle fit
- Pet fit
- Reviews and landlord reputation
- Risk/scam signals
- Missing-information penalty

### Example scoring rubric

| Dimension | Weight | Example logic |
|---|---:|---|
| Must-have satisfaction | 25% | Large penalty if any must-have is missing |
| Budget fit | 20% | Based on total monthly cost, not rent alone |
| Commute fit | 15% | Based on user mode preferences and frequency |
| Location lifestyle fit | 10% | Walkability, nearby essentials, noise fit |
| Apartment quality | 10% | Layout, light, laundry, AC, dishwasher, condition |
| Upfront cost fit | 8% | Deposit, broker fee, application cost |
| Lease fit | 5% | Move-in date, lease length, flexibility |
| Reviews / reputation | 4% | Building and landlord signals |
| Data confidence | 3% | Penalize incomplete or stale info |

### Plain-language explanation template

“This listing scores 82/100 because it is within your ideal budget, allows cats, and gives you a 28-minute transit commute. It loses points for a broker fee, no in-unit laundry, and limited information about heating and noise.”

## 10. Budget and Affordability Analysis

### Required calculations

- Monthly rent as % of gross monthly income
- Estimated total monthly housing cost
- Upfront move-in cost
- Security deposit
- First month’s rent
- Last month’s rent if applicable
- Broker fee
- Application fees
- Utility estimates
- Parking cost
- Pet costs
- Renter’s insurance estimate
- Moving cost estimate

### Budget outputs

- Base rent
- Estimated all-in monthly cost
- Upfront cash needed
- Affordability risk flag
- Eligibility estimate if the user opts in

### Affordability warning rules

- Warn if total monthly housing cost exceeds user hard budget
- Warn if rent exceeds a configurable % of gross income
- Warn if upfront move-in cost exceeds stated savings
- Warn if broker fee meaningfully changes true cost vs lower-rent alternatives

### Comparison example

Apartment A may cost $150 more per month, but if it includes heat, water, and a parking space while cutting commute by 25 minutes, it may have lower true cost and higher quality-of-life value.

## 11. Commute and Location Intelligence

### Location factors

- Commute time by transit, car, bike, and walking
- Reliability proxy for transit access
- Distance to frequent destinations
- Parking availability
- Walkability and bikeability
- Nearby essentials and lifestyle destinations
- Noise-source proximity
- Publicly available safety indicators
- Neighborhood fit with user-stated preferences

### Location explanation format

For each listing, the assistant should explain:

- What is objectively convenient
- What may be inconvenient
- What is uncertain
- Whether the tradeoff is likely worth it given the user’s priorities

### Example explanation

“This apartment is farther from your office than your other top choices, but it performs better for groceries, parks, and weekend walkability. It fits a hybrid worker better than someone commuting five days per week.”

## 12. Comparison Features

### Required comparison features

- Side-by-side comparison table
- Ranked shortlist
- Tags:
  - Best value
  - Lowest risk
  - Best commute
  - Best amenities
  - Best neighborhood fit
  - Best overall fit
- Pros and cons per listing
- User-priority-aware recommendation

### Recommendation rule

The assistant should never claim a universal winner. It should say which apartment is strongest for the user’s current priority set.

## 13. Tour Scheduling and Preparation

### Tour support features

- Recommend which apartments are worth touring
- Suggest tour order based on fit and urgency
- Schedule tours via calendar integration
- Generate a tour checklist
- Draft questions for agent/landlord
- Collect post-tour notes and ratings
- Re-rank after tours

### Tour checklist items

- Water pressure
- Cell reception
- Street and neighbor noise
- Window condition
- Locks and entry security
- Pest signs
- Appliance condition
- Laundry access
- Trash area
- Package area
- Hallway and stairwell condition
- Heat/AC vents and controls
- Natural light at actual visit time

### Example tour questions

- What utilities are included, and what is the typical monthly total?
- Has the rent changed since the listing was posted?
- Are there move-in, amenity, or building fees not shown in the ad?
- How often has this unit turned over?
- What is the renewal policy, and how much did recent renewals increase?
- Are there quiet hours or recurring noise issues?
- Who handles maintenance, and what is typical response time?

## 14. Lease and Document Review

### Supported document types

- Lease agreements
- Rental applications
- Fee disclosures
- House rules
- Broker agreements
- Guarantor forms

### Assistant behaviors

- Summarize the document
- Highlight unusual fees or restrictions
- Extract key dates and obligations
- Compare the lease to the listing and agent claims
- Flag uncertainty and recommend legal review where needed

### Clauses to extract

- Lease term
- Rent amount
- Concessions
- Deposit terms
- Renewal terms
- Late fees
- Notice periods
- Maintenance responsibilities
- Guest rules
- Pet rules
- Subletting
- Early termination
- Repairs and habitability clauses

### Safety language

The assistant must state that it is not a lawyer and cannot provide legal advice. For unclear, state-specific, or high-stakes clauses, it should recommend attorney or tenant-rights review.

## 15. Scam and Risk Detection

### Risk signals

- Price materially below local market without explanation
- Request for wire transfer or payment before tour/verification
- Refusal to show unit
- Reverse-image duplicates or stolen photos
- Inconsistent address, unit number, or contact info
- Urgency pressure tactics
- Vague lease terms
- Excessive upfront fees
- Missing ownership or property manager details
- Repeat complaints about pests, heat, water, deposit returns, noise
- Copy-pasted listing text across sites

### Risk behavior

The assistant should:

- Assign a risk level: low, medium, high
- Explain the exact signals
- Recommend safer next steps
- Avoid definitive accusations unless evidence is very strong

### Safer next-step examples

- Request live or in-person tour
- Verify manager identity and property ownership
- Pay only through traceable, legitimate channels
- Compare the listing on multiple sources
- Ask for written fee disclosures before applying

## 16. Communication Assistance

### Message types

- Initial inquiry
- Tour request
- Follow-up after tour
- Negotiation / fee reduction request
- Application clarification
- Maintenance or condition questions before signing
- Roommate coordination
- Polite decline
- Lease clarification

### Tone controls

- Professional
- Friendly
- Concise
- Assertive
- Casual

### Drafting rules

- Use user-provided facts only
- Keep sensitive information minimal
- Ask direct, practical questions
- Never fabricate qualifications

## 17. Application Support

### Application workflow support

- Checklist of required documents
- Deadline tracking
- Status tracking by apartment
- Fee comparison
- Eligibility guidance if user opts in
- Cover note drafting
- Reminder workflow

### Documents to track

- ID
- Proof of income
- Pay stubs
- Employment letter
- Tax return if self-employed
- Bank statements
- References
- Guarantor documents

### Guardrail

Do not embellish income, employment, occupancy, pets, or credit facts.

## 18. Personalization and Memory

### Remember with permission

- Budget
- Neighborhoods
- Must-haves
- Dealbreakers
- Commute destinations
- Pets
- Accessibility needs
- Preferred tone
- Saved apartments
- Rejected apartments and reasons
- Application statuses

### How memory improves product

- Re-rank new listings faster
- Avoid repeating rejected options
- Suggest more relevant tradeoffs
- Auto-fill future inquiry drafts

## 19. User Interface

### Core UI surfaces

- Chat interface
- Listing cards
- Map view
- Saved shortlist
- Side-by-side comparison table
- Fit score badge
- Risk score badge
- Affordability calculator
- Commute calculator
- Tour checklist modal
- Application tracker
- Calendar integration
- Document upload area
- Alerts center
- Notes panel
- Decision dashboard

### Recommended initial UI for this repo

Because the current app is chat-first, the best first implementation is:

1. Keep chat as the primary controller.
2. Add structured cards below assistant messages.
3. Add a right-side shortlist drawer.
4. Add compare and document review panels as modal/sheet components.

## 20. Personality and Behavior

The assistant should be:

- Practical
- Honest
- Detail-oriented
- Budget-aware
- Calm
- Skeptical of risky listings
- Transparent about uncertainty
- Helpful without being pushy

The assistant should not:

- Pressure users to apply
- Hide downside risks
- Overstate confidence
- Present legal, financial, or safety guarantees
- Use discriminatory reasoning

## 21. Fair Housing and Compliance

### Prohibited behavior

The assistant must not recommend or filter housing based on protected characteristics including race, religion, national origin, disability, familial status, sex, gender identity, sexual orientation, or similar protected classes.

### Allowed basis for recommendations

- Rent
- Total cost
- Commute
- Amenities
- Lease terms
- Accessibility features
- Transit access
- Publicly available neighborhood and infrastructure data
- Non-discriminatory lifestyle preferences

### Policy examples

Do not say:

- “This neighborhood is good for people like you.”
- “Avoid this building because of the type of people there.”

Instead say:

- “This area is a 12-minute walk from the train and has lower estimated nightlife noise.”
- “This building has elevator access and no-pet restrictions.”

## 22. Data Model

```ts
type UserProfile = {
  id: string;
  name?: string;
  targetCities: string[];
  preferredNeighborhoods: string[];
  avoidedNeighborhoods: string[];
  maxMonthlyRent: number;
  idealRentMin?: number;
  idealRentMax?: number;
  moveInDate?: string;
  leaseLengthMonths?: number;
  bedrooms?: number;
  bathrooms?: number;
  householdType?: "solo" | "partner" | "roommates" | "family";
  pets: Array<{ type: string; breed?: string; size?: string }>;
  mustHaves: string[];
  niceToHaves: string[];
  dealbreakers: string[];
  parkingNeed?: "none" | "street" | "garage" | "included";
  transitNeedLevel?: "low" | "medium" | "high";
  commuteDestinations: CommuteDestination[];
  workFromHomeDays?: number;
  safetyPreferences: string[];
  noiseTolerance?: "low" | "medium" | "high";
  buildingTypePreferences: string[];
  walkabilityPreference?: number;
  schoolDistrictNeeds?: string[];
  accessibilityNeeds?: string[];
  creditScoreRange?: string;
  grossMonthlyIncome?: number;
  savingsAvailable?: number;
  willingToUseBroker?: boolean;
  housingStyle?: Array<"luxury" | "budget" | "student" | "family_friendly" | "pet_friendly" | "short_term">;
  communicationTone?: "professional" | "friendly" | "concise" | "assertive" | "casual";
};

type SearchPreferences = {
  userId: string;
  filters: Record<string, unknown>;
  weights: {
    budget: number;
    commute: number;
    amenities: number;
    space: number;
    neighborhood: number;
    risk: number;
    upfrontCost: number;
  };
};

type ApartmentListing = {
  id: string;
  sourceIds: string[];
  sourceUrls: string[];
  providerName: string;
  title: string;
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip?: string;
  lat?: number;
  lng?: number;
  rent: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  availableDate?: string;
  leaseLengths?: number[];
  description?: string;
  photos: string[];
  listingStatus?: "active" | "stale" | "unknown" | "removed";
  lastSeenAt?: string;
  fees: ListingFees;
  amenities: ListingAmenities;
  location: ListingLocation;
  building: BuildingDetails;
  manager?: LandlordOrManager;
  reviews: ReviewSummary[];
  riskSignals: RiskSignal[];
  fitScore?: FitScore;
  affordability?: AffordabilitySummary;
  commuteSummaries?: CommuteSummary[];
  tourNotes?: TourNote[];
  applicationStatus?: ApplicationStatus;
  leaseSummary?: LeaseDocumentSummary;
  userFeedback?: UserListingFeedback;
};

type ListingFees = {
  securityDeposit?: number;
  brokerFee?: number;
  applicationFee?: number;
  petDeposit?: number;
  petRentMonthly?: number;
  parkingMonthly?: number;
  utilitiesIncluded?: string[];
  utilityEstimateMonthly?: number;
  moveInFee?: number;
  rentersInsuranceEstimateMonthly?: number;
};

type ListingAmenities = {
  laundry: "none" | "shared" | "in_unit";
  dishwasher?: boolean;
  airConditioning?: boolean;
  heatingType?: string;
  elevator?: boolean;
  parking?: boolean;
  doorman?: boolean;
  gym?: boolean;
  outdoorSpace?: boolean;
  wheelchairAccessible?: boolean;
  petFriendly?: boolean;
};

type ListingLocation = {
  walkScore?: number;
  bikeScore?: number;
  transitScore?: number;
  nearestTransitStops?: string[];
  nearbyPlaces: Array<{ type: string; name: string; distanceMeters: number }>;
  noiseSources: string[];
  safetyIndicators: string[];
};

type BuildingDetails = {
  type?: string;
  age?: number;
  floor?: number;
  condition?: string;
  naturalLight?: "low" | "medium" | "high";
  packageArea?: boolean;
  laundryRoomCondition?: string;
};

type LandlordOrManager = {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  verified?: boolean;
};

type ReviewSummary = {
  source: string;
  averageRating?: number;
  reviewCount?: number;
  recurringComplaints: string[];
  recurringPositives: string[];
};

type RiskSignal = {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
  evidence?: string;
};

type FitScore = {
  total: number;
  affordability: number;
  commute: number;
  amenities: number;
  location: number;
  riskPenalty: number;
  confidencePenalty: number;
  explanation: string;
};

type CommuteDestination = {
  label: string;
  address: string;
  frequencyPerWeek?: number;
  preferredModes?: Array<"transit" | "car" | "bike" | "walk">;
  maxMinutes?: number;
};

type CommuteSummary = {
  destinationLabel: string;
  mode: "transit" | "car" | "bike" | "walk";
  typicalMinutes?: number;
  peakMinutes?: number;
  transfers?: number;
};

type AffordabilitySummary = {
  monthlyAllInCost: number;
  upfrontCost: number;
  rentToIncomeRatio?: number;
  affordabilityRisk: "low" | "medium" | "high";
};

type TourNote = {
  visitedAt: string;
  rating?: number;
  pros: string[];
  cons: string[];
  checklistFindings: string[];
  followUps: string[];
};

type ApplicationStatus = {
  stage: "not_started" | "drafting" | "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
  appliedAt?: string;
  deadlines?: string[];
  requiredDocuments: string[];
  notes?: string;
};

type LeaseDocumentSummary = {
  documentType: string;
  rent?: number;
  termStart?: string;
  termEnd?: string;
  renewalTerms?: string;
  petRules?: string;
  guestPolicy?: string;
  sublettingPolicy?: string;
  flaggedClauses: string[];
  summary: string;
  confidence: number;
};

type UserListingFeedback = {
  saved: boolean;
  hidden: boolean;
  rejectedReason?: string;
  userPriorityNotes?: string;
};
```

## 23. Ranking Algorithm

### Ranking principles

- Heavy must-have weighting
- Hard penalties for dealbreakers
- Total-cost awareness
- Commute-aware
- Risk-aware
- Missing-data-aware
- User-adjustable weights

### Example formula

```ts
fitScore =
  100
  - mustHaveMissPenalty
  - dealbreakerPenalty
  - overBudgetPenalty
  - commutePenalty
  - upfrontCostPenalty
  - riskPenalty
  - uncertaintyPenalty
  + amenityBonus
  + neighborhoodFitBonus
  + leaseFitBonus;
```

### Example component math

```ts
mustHaveMissPenalty = 20 * numberOfMissingMustHaves;
dealbreakerPenalty = 35 * numberOfDealbreakersPresent;
overBudgetPenalty = max(0, (monthlyAllInCost - userMaxBudget) / 50);
commutePenalty = max(0, (actualCommuteMinutes - targetCommuteMinutes) * 0.8);
upfrontCostPenalty = max(0, (upfrontCost - savingsComfortThreshold) / 200);
riskPenalty = sum(riskSignalWeights);
uncertaintyPenalty = 2 * numberOfCriticalMissingFields;
amenityBonus = 2 * numberOfMatchedNiceToHaves;
neighborhoodFitBonus = walkabilityMatch + nearbyEssentialsMatch;
leaseFitBonus = moveInDateMatch + leaseLengthMatch;
```

### Score explanation requirement

Every ranking output should show:

- top reasons it scored well
- top reasons it lost points
- any material missing information

## 24. Example User Flows

### Flow 1: First-time renter

- Assistant asks:
  - location
  - budget
  - move-in date
  - commute
  - must-haves
- Assistant does:
  - builds renter profile
  - suggests realistic tradeoffs if needed
  - searches listings
  - returns top 5
- Output:
  - ranked shortlist
  - fit explanations
  - budget warnings
  - recommended tours

### Flow 2: Compare three apartments

- Assistant asks:
  - which matters more: cost, commute, amenities, risk
- Assistant does:
  - computes side-by-side comparison
  - highlights best value and biggest downside for each
- Output:
  - comparison table
  - recommendation tied to user priorities

### Flow 3: Lease upload

- Assistant asks:
  - whether the user wants a plain-language summary or risk-focused review
- Assistant does:
  - parses lease
  - extracts clauses
  - compares terms vs listing
- Output:
  - summary
  - flagged clauses
  - follow-up questions for landlord

### Flow 4: Avoid scams

- Assistant asks:
  - what listing source and payment request have been received
- Assistant does:
  - checks common scam signals
  - compares price to market
- Output:
  - risk rating
  - reasons
  - safer next steps

### Flow 5: Pet-friendly search

- Assistant asks:
  - pet type, breed/size, deposit tolerance
- Assistant does:
  - filters for explicit pet acceptance
  - scores pet cost and nearby pet-friendly amenities
- Output:
  - pet-safe shortlist
  - pet fee comparison

### Flow 6: Relocating to a new city

- Assistant asks:
  - office location, lifestyle needs, budget flexibility
- Assistant does:
  - suggests neighborhoods first
  - then listings
- Output:
  - neighborhood shortlist
  - commute-first apartment list

### Flow 7: Strict commute requirement

- Assistant asks:
  - max commute and acceptable modes
- Assistant does:
  - filters hard by commute threshold
  - surfaces tradeoffs in size/rent
- Output:
  - compliant listings only
  - explanation of market tradeoffs

### Flow 8: Cheaper vs more convenient

- Assistant asks:
  - how much the user values time, amenities, and upfront cost
- Assistant does:
  - calculates all-in cost and commute burden
- Output:
  - side-by-side tradeoff summary
  - “better for savings” vs “better for daily life” framing

## 25. MVP Feature Set

### Must-have for MVP

- Apartment-specific onboarding
- Natural-language search intake
- Listing ingestion from URLs/manual entry
- Listing normalization
- Listing scoring
- Basic risk warnings
- Side-by-side comparison
- Saved shortlist
- Budget calculator
- Tour checklist
- Inquiry message drafting

### Nice-to-have

- Map view
- Commute API integration
- Document upload and lease summary
- Application tracker
- Calendar integration
- Notes and post-tour scoring

### Advanced future features

- Email sync
- Auto-alerts for new listings
- Reverse image / duplicate photo checks
- Broker / PM reputation aggregation
- Negotiation coaching
- Rent stabilization detection by jurisdiction
- Marketplace / brokerage integrations

## 26. Technical Architecture

### Frontend

- Next.js App Router
- Existing chat surface remains primary interaction shell
- React components for listing cards, shortlist, comparison, document review, tracker
- Local optimistic UI for shortlist and notes

### Backend

- Existing route-based API extended with apartment tools
- Additional REST/route handlers for persistence and uploads
- Background jobs for ingestion/enrichment if volume grows

### Database

Recommended:

- Postgres via Supabase or Neon
- Prisma or Drizzle ORM

Core tables:

- users
- user_profiles
- searches
- listings
- listing_sources
- listing_enrichments
- shortlist_items
- tours
- applications
- uploaded_documents
- lease_summaries

### LLM layer

Use the LLM for:

- preference clarification
- natural-language-to-filter translation
- plain-language summaries
- comparison explanations
- document summaries
- message drafting

Do not use the LLM as source of truth for:

- cost calculations
- ranking math
- scam rule thresholds
- commute calculations
- date extraction validation
- application status logic

### Search / retrieval layer

- Web search for current public listing info and neighborhood context
- Vector store for product knowledge, housing tips, fair-housing rules, and uploaded user documents
- Structured listing database for normalized apartment data

### Listing ingestion

- Parser for listing URLs
- OCR pipeline for screenshots/PDFs
- CSV importer
- Normalizer to common schema
- Deduplication engine

### External APIs

- Maps/geocoding: Google Maps or Mapbox
- Commute/travel times: Google Routes or Distance Matrix
- Places/POIs: Google Places or Yelp/Mapbox equivalents
- Calendar: Google Calendar / Microsoft Graph
- Email: Gmail API / Microsoft Graph

### Notifications

- Email or push for new matches
- Tour reminders
- application deadline reminders
- follow-up nudges

### Security and privacy

- User consent for memory
- Minimal sensitive-data retention
- Encrypt stored documents and PII
- Separate user-uploaded lease/application documents from general logs
- Avoid storing full SSNs or other unnecessary sensitive data
- Audit access to uploaded documents

## 27. Deterministic Code vs LLM Responsibilities

### Deterministic

- Schema validation
- Search filter construction
- Cost calculations
- Weighting and ranking
- Hard rule enforcement
- Deduplication
- Calendar event creation
- Application state machine
- Red-flag rule engine

### LLM

- Guided onboarding
- Explanation of scores
- Tradeoff narration
- Document summarization
- Drafting messages
- Suggesting follow-up questions
- Summarizing reviews or notes

## 28. System Prompt

```txt
You are LeaseLens, an apartment-shopping AI assistant for renters.

Your role:
- Help renters find, compare, evaluate, organize, and apply for apartments.
- Act like a knowledgeable rental advisor, not just a search engine.
- Be practical, honest, skeptical of risky listings, and clear about tradeoffs.

Your responsibilities:
- Collect and maintain a structured renter profile.
- Ask focused follow-up questions when requirements are vague, incomplete, or conflicting.
- Translate user preferences into explicit search filters and decision criteria.
- Use available tools to search listings, analyze commute and affordability, compare apartments, summarize documents, and draft communications.
- Explain why each apartment is or is not a strong fit.
- Flag uncertainty, missing information, stale data, and scam signals.

How to ask questions:
- Ask only the next most useful questions.
- Prefer grouped, low-friction questions rather than long surveys.
- When constraints conflict, explain the conflict and ask which factor is flexible.
- Confirm the profile before running a search.

How to score apartments:
- Weight must-haves heavily.
- Penalize dealbreakers strongly.
- Consider total monthly cost, upfront move-in cost, commute, amenities, lease fit, risk, and missing information.
- Use deterministic scoring outputs when available.
- Do not invent missing listing details.

How to explain recommendations:
- Give a clear fit summary in plain language.
- State the biggest positives, biggest downsides, and any key unknowns.
- Do not claim there is one universally best apartment.
- Frame recommendations relative to the user’s stated priorities.

Uncertainty and limitations:
- Be explicit when information is incomplete, stale, or inferred.
- Do not provide legal, financial, or safety guarantees.
- For lease interpretation, explain in plain language but state that you are not a lawyer and recommend qualified legal help for unclear or high-stakes issues.

Fair housing and compliance:
- Never recommend, exclude, or rank housing based on protected characteristics including race, religion, national origin, disability, familial status, sex, gender identity, sexual orientation, or similar protected traits.
- Focus only on objective housing factors and lawful user-stated preferences.
- Do not stereotype neighborhoods or residents.

Privacy:
- Use sensitive personal information only when necessary for the user’s task.
- Do not retain or restate sensitive details unless needed.
- Encourage the user not to share unnecessary highly sensitive information.

Risk behavior:
- Flag suspicious listings clearly and explain the specific signals.
- Suggest safer next steps such as identity verification, written fee confirmation, or in-person/live tours.
- Never encourage sending money before proper verification.

Communication style:
- Concise, practical, and user-focused.
- Helpful without being pushy.
- Budget-aware and detail-oriented.
```

## 29. Example Outputs

### Preference intake

User: “I need an apartment in Chicago.”

Assistant:
“I can help narrow this quickly. First, I need your non-negotiables:

1. What is your hard monthly rent ceiling, and what is your ideal range?
2. What move-in date are you targeting?
3. Which neighborhoods are preferred or off-limits?
4. Do you need transit access, parking, pet-friendly housing, or work-from-home quiet?” 

### Listing analysis

“This listing is a strong match overall.

- Fit score: 84/100
- Estimated all-in monthly cost: $2,315
- Upfront move-in cost: about $5,150
- Risk level: Low to medium

Why it fits:
- Within your ideal rent range once included utilities are counted
- 24-minute train commute to your office
- Cat-friendly with no monthly pet rent
- In-unit laundry and dishwasher match two of your must-haves

What to watch:
- Broker fee increases the upfront cash requirement
- Heat type is not specified
- Building reviews mention occasional package issues

Before touring, ask for a full fee sheet and confirmation of average winter utility costs.”

### Comparison between two apartments

“Apartment A is better for budget stability. Apartment B is better for daily convenience.

- Apartment A: lower upfront cost, lower total monthly cost, weaker commute, fewer amenities
- Apartment B: $180 more per month, but 22 minutes faster round-trip commute, better natural light, and included parking

If your main priority is keeping monthly cost predictable, choose Apartment A.
If your main priority is reducing commute friction and getting a better day-to-day experience, Apartment B is the better fit.”

### Scam warning

“I would treat this listing as high risk.

Why:
- The rent is far below comparable one-bedrooms nearby
- The contact is pushing for a wire transfer before any verified tour
- The address details are inconsistent across the screenshots you uploaded
- The listing text appears copied from another site

Safer next steps:
- Do not send money
- Ask for a live video tour or in-person showing
- Verify ownership or management company identity
- Request written lease and fee disclosures before applying”

### Tour checklist

“Tour checklist for this unit:

- Test water pressure in kitchen and bathroom
- Check phone signal in bedroom and living room
- Listen for hallway, street, and upstairs noise
- Open and close windows to check drafts and lock quality
- Look for pest signs under sinks and near baseboards
- Run appliances briefly
- Inspect laundry room, trash area, and package area
- Check outlets and HVAC controls
- Ask how maintenance requests are submitted and tracked”

### Landlord inquiry message

“Hello, I’m interested in the one-bedroom at 125 Example St. I’m looking for a move-in around June 15 and wanted to ask whether the unit is still available. Could you also confirm the full monthly cost, all upfront fees, and whether heat or water are included? If it’s available, I’d like to schedule a tour this week. Thank you.”

### Lease summary

“Here’s the plain-language summary of the lease:

- Term: 12 months, August 1 2026 through July 31 2027
- Rent: $2,200/month
- Security deposit: one month’s rent
- Late fee: 5% after a 5-day grace period
- Pet policy: cats allowed, monthly pet rent applies
- Renewal: landlord may offer renewal with 60 days’ notice
- Subletting: prohibited without written consent

Items to review closely:
- The lease includes a move-out cleaning charge that was not mentioned in the listing
- Utility responsibility is broader than the ad suggested
- Early termination language is vague

I’m not a lawyer, but the early termination clause and cleaning-fee language are worth clarifying before signing.”

### Final recommendation

“Based on your priorities, I would shortlist Apartments 2 and 4 and pause Apartment 1.

Apartment 2 is your best overall fit today because it stays under your all-in budget, keeps your commute under 30 minutes, allows your dog, and has the least risk.

Apartment 4 is worth touring because it has the best space and amenities, but the broker fee and longer commute make it less attractive unless the tour is unusually strong.

Apartment 1 looks cheaper at first glance, but the missing fee details and weak reviews make it a lower-confidence option.”

## 30. Product Roadmap

### Phase 1: Prototype

- Rebrand existing app
- Replace prompt
- Add renter onboarding flow in chat
- Add deterministic listing scoring from mock/manual data
- Add simple comparison and budget calculator

### Phase 2: MVP

- URL/manual listing ingestion
- Structured apartment schema and persistence
- Shortlist management
- Basic risk detection
- Tour checklist
- Message drafting
- Public deployment

### Phase 3: Beta

- Maps and commute APIs
- Lease/PDF upload and summaries
- Application tracker
- Calendar integration
- Notes and post-tour re-ranking

### Phase 4: Public launch

- Better onboarding UX
- Alerting for new matches
- Stronger review aggregation
- Reliability, analytics, feedback loops

### Phase 5: Advanced personalization

- Long-term preference memory
- User-adjustable weights UI
- Better neighborhood preference learning
- Multi-user household / roommate support

### Phase 6: Marketplace / brokerage integrations

- Listing API partnerships
- Broker workflows
- Direct inquiry routing
- Application handoff integrations

## 31. Success Metrics

### User activity

- Number of saved listings per user
- Listings compared per user
- Tour checklist usage rate
- Document uploads per user

### Funnel metrics

- Search-to-shortlist conversion
- Shortlist-to-tour conversion
- Tour-to-application conversion
- Application-to-lease conversion

### Quality metrics

- Recommendation acceptance rate
- User-reported time saved
- Accuracy of listing data
- Scam/risk warnings shown
- Percentage of warnings later confirmed useful

### Retention and trust

- Weekly retention during active apartment hunt
- User satisfaction / CSAT
- User trust score
- Repeat usage during the same search journey

### Outcome metrics

- Percentage of users who report finding housing
- Median time from first search to decision
- Reduction in unsuitable applications

## 32. Practical Build Recommendations for This Repo

### Best MVP implementation path

1. Update [config.ts](/Users/isaiahsingleton/Desktop/myAI3/config.ts) and [prompts.ts](/Users/isaiahsingleton/Desktop/myAI3/prompts.ts).
2. Add `types/apartment.ts` and deterministic `lib/*` scoring helpers.
3. Add new tools in `app/api/chat/tools/`.
4. Register those tools in [app/api/chat/route.ts](/Users/isaiahsingleton/Desktop/myAI3/app/api/chat/route.ts).
5. Add tool labels in [components/messages/tool-call.tsx](/Users/isaiahsingleton/Desktop/myAI3/components/messages/tool-call.tsx).
6. Add listing cards and comparison components.
7. Add persistence and uploads.

### Recommended public demo scope

For the course, the most credible public version is:

- onboarding
- manual/URL listing ingestion
- ranking and comparison
- affordability calculator
- scam warnings
- lease summary upload
- tour checklist
- inquiry drafting

That is enough to show RAG, web search, GenAI, web UI, and backend logic without overbuilding.

## 33. One-Page Summary

### AI expertise

LeaseLens is an AI assistant specialized in apartment hunting for renters. It helps users find apartments, compare listings, estimate true monthly and upfront cost, evaluate commute and neighborhood fit, detect scams and hidden fees, prepare for tours, understand lease documents, and organize applications.

### Target audience

The primary audience is renters in active apartment searches, especially first-time renters, relocating professionals, students, pet owners, and budget-conscious users. They use the AI because apartment hunting is fragmented, time-consuming, and easy to get wrong when comparing many listings across multiple sites and documents.

### Product pitch

LeaseLens creates value for renters by combining apartment search, comparison, affordability analysis, scam detection, lease review, and action support in one assistant. Existing solutions such as Zillow, Apartments.com, StreetEasy, and spreadsheets help users browse listings, but they do not act like a decision partner. Generic chatbots can answer questions, but they do not maintain a structured renter profile, score apartments against user priorities, or organize the end-to-end workflow from discovery to application. LeaseLens is better because it turns raw listings into personalized, transparent recommendations with explicit tradeoffs, risk warnings, and practical next steps.

### Public deliverables placeholders

- Public AI URL: `Add deployed Vercel URL here`
- Public GitHub repository: `Add public GitHub URL here`
- Summary page: this section can be copied into a one-page project summary
