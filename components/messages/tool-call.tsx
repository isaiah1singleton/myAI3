import { ToolCallPart, ToolResultPart } from "ai";
import {
  Home,
  Search,
  SlidersHorizontal,
  Scale,
  FileText,
  ShieldAlert,
  Calculator,
  ScrollText,
  Bookmark,
  Pencil,
  Archive,
  List,
  ClipboardCheck,
  FileCheck2,
  Mail,
  Wrench,
} from "lucide-react";
import { Shimmer } from "../ai-elements/shimmer";

export interface ToolDisplay {
  call_label: string;
  call_icon: React.ReactNode;
  result_label: string;
  result_icon: React.ReactNode;
  formatArgs?: (toolName: string, input: unknown) => string;
}

function formatWebSearchArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    return args.query ? String(args.query) : "";
  } catch {
    return "";
  }
}

function formatPreferencesArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const city = args.city ? String(args.city) : "unknown city";
    const budget = args.maxMonthlyRent ? `$${String(args.maxMonthlyRent)}` : "unknown budget";
    return `${city} • max ${budget}`;
  } catch {
    return "";
  }
}

function formatApartmentScoreArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listing = args.listing as Record<string, unknown> | undefined;
    if (!listing) return "";
    const title = listing.title ? String(listing.title) : "Apartment";
    const rent =
      listing.monthlyRent !== undefined ? ` • $${String(listing.monthlyRent)}` : "";
    return `${title}${rent}`;
  } catch {
    return "";
  }
}

function formatIngestListingArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const title = args.title ? String(args.title) : "Listing";
    const city = args.city ? ` • ${String(args.city)}` : "";
    return `${title}${city}`;
  } catch {
    return "";
  }
}

function formatCompareApartmentsArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listings = Array.isArray(args.listings) ? args.listings : [];
    return `${listings.length} apartment${listings.length === 1 ? "" : "s"}`;
  } catch {
    return "";
  }
}

function formatAffordabilityArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listing = args.listing as Record<string, unknown> | undefined;
    if (!listing) return "";
    const title = listing.title ? String(listing.title) : "Apartment";
    return `${title} affordability`;
  } catch {
    return "";
  }
}

function formatRiskArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listing = args.listing as Record<string, unknown> | undefined;
    if (!listing) return "";
    const title = listing.title ? String(listing.title) : "Apartment";
    return `${title} risk check`;
  } catch {
    return "";
  }
}

function formatLeaseArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const documentType = args.documentType ? String(args.documentType) : "document";
    return documentType.replace(/_/g, " ");
  } catch {
    return "";
  }
}

function formatSaveArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listing = args.listing as Record<string, unknown> | undefined;
    return listing?.title ? String(listing.title) : "Apartment";
  } catch {
    return "";
  }
}

function formatUpdateArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const apartment = args.apartment as Record<string, unknown> | undefined;
    return apartment?.title ? String(apartment.title) : "Saved apartment";
  } catch {
    return "";
  }
}

function formatListSavedArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    if (args.status) return `status: ${String(args.status)}`;
    return "all saved apartments";
  } catch {
    return "";
  }
}

function formatListingOnlyArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const listing = args.listing as Record<string, unknown> | undefined;
    return listing?.title ? String(listing.title) : "Apartment";
  } catch {
    return "";
  }
}

function formatDraftMessageArgs(_: string, input: unknown): string {
  try {
    if (typeof input !== "object" || input === null) return "";
    const args = input as Record<string, unknown>;
    const kind = args.kind ? String(args.kind) : "message";
    return kind.replace(/_/g, " ");
  } catch {
    return "";
  }
}

const TOOL_DISPLAY_MAP: Record<string, ToolDisplay> = {
  webSearch: {
    call_label: "Searching the web",
    call_icon: <Search className="w-4 h-4" />,
    result_label: "Searched the web",
    result_icon: <Search className="w-4 h-4" />,
    formatArgs: formatWebSearchArgs,
  },
  collectUserPreferences: {
    call_label: "Structuring renter preferences",
    call_icon: <SlidersHorizontal className="w-4 h-4" />,
    result_label: "Structured renter preferences",
    result_icon: <SlidersHorizontal className="w-4 h-4" />,
    formatArgs: formatPreferencesArgs,
  },
  scoreApartmentFitTool: {
    call_label: "Scoring apartment fit",
    call_icon: <Home className="w-4 h-4" />,
    result_label: "Scored apartment fit",
    result_icon: <Home className="w-4 h-4" />,
    formatArgs: formatApartmentScoreArgs,
  },
  ingestApartmentListing: {
    call_label: "Normalizing apartment listing",
    call_icon: <FileText className="w-4 h-4" />,
    result_label: "Normalized apartment listing",
    result_icon: <FileText className="w-4 h-4" />,
    formatArgs: formatIngestListingArgs,
  },
  compareApartmentsTool: {
    call_label: "Comparing apartments",
    call_icon: <Scale className="w-4 h-4" />,
    result_label: "Compared apartments",
    result_icon: <Scale className="w-4 h-4" />,
    formatArgs: formatCompareApartmentsArgs,
  },
  calculateAffordabilityTool: {
    call_label: "Calculating affordability",
    call_icon: <Calculator className="w-4 h-4" />,
    result_label: "Calculated affordability",
    result_icon: <Calculator className="w-4 h-4" />,
    formatArgs: formatAffordabilityArgs,
  },
  detectListingRiskTool: {
    call_label: "Checking listing risk",
    call_icon: <ShieldAlert className="w-4 h-4" />,
    result_label: "Checked listing risk",
    result_icon: <ShieldAlert className="w-4 h-4" />,
    formatArgs: formatRiskArgs,
  },
  summarizeLeaseDocumentTool: {
    call_label: "Reviewing lease document",
    call_icon: <ScrollText className="w-4 h-4" />,
    result_label: "Reviewed lease document",
    result_icon: <ScrollText className="w-4 h-4" />,
    formatArgs: formatLeaseArgs,
  },
  saveApartmentTool: {
    call_label: "Saving apartment",
    call_icon: <Bookmark className="w-4 h-4" />,
    result_label: "Saved apartment",
    result_icon: <Bookmark className="w-4 h-4" />,
    formatArgs: formatSaveArgs,
  },
  updateSavedApartmentTool: {
    call_label: "Updating saved apartment",
    call_icon: <Pencil className="w-4 h-4" />,
    result_label: "Updated saved apartment",
    result_icon: <Pencil className="w-4 h-4" />,
    formatArgs: formatUpdateArgs,
  },
  removeSavedApartmentTool: {
    call_label: "Archiving apartment",
    call_icon: <Archive className="w-4 h-4" />,
    result_label: "Archived apartment",
    result_icon: <Archive className="w-4 h-4" />,
    formatArgs: formatUpdateArgs,
  },
  listSavedApartmentsTool: {
    call_label: "Loading shortlist",
    call_icon: <List className="w-4 h-4" />,
    result_label: "Loaded shortlist",
    result_icon: <List className="w-4 h-4" />,
    formatArgs: formatListSavedArgs,
  },
  generateTourChecklistTool: {
    call_label: "Preparing tour checklist",
    call_icon: <ClipboardCheck className="w-4 h-4" />,
    result_label: "Prepared tour checklist",
    result_icon: <ClipboardCheck className="w-4 h-4" />,
    formatArgs: formatListingOnlyArgs,
  },
  prepareApplicationPlanTool: {
    call_label: "Preparing application plan",
    call_icon: <FileCheck2 className="w-4 h-4" />,
    result_label: "Prepared application plan",
    result_icon: <FileCheck2 className="w-4 h-4" />,
    formatArgs: formatListingOnlyArgs,
  },
  draftLandlordMessageTool: {
    call_label: "Drafting landlord message",
    call_icon: <Mail className="w-4 h-4" />,
    result_label: "Drafted landlord message",
    result_icon: <Mail className="w-4 h-4" />,
    formatArgs: formatDraftMessageArgs,
  },
};

const DEFAULT_TOOL_DISPLAY: ToolDisplay = {
  call_label: "Using tool",
  call_icon: <Wrench className="w-4 h-4" />,
  result_label: "Used tool",
  result_icon: <Wrench className="w-4 h-4" />,
};

function extractToolName(part: ToolCallPart | ToolResultPart): string | undefined {
  const partWithType = part as unknown as { type?: string; toolName?: string };
  if (partWithType.type && partWithType.type.startsWith("tool-")) {
    return partWithType.type.slice(5);
  }
  if (partWithType.toolName) {
    return partWithType.toolName;
  }
  if ("toolName" in part && part.toolName) {
    return part.toolName;
  }
  return undefined;
}

function formatToolArguments(
  toolName: string,
  input: unknown,
  toolDisplay?: ToolDisplay
): string {
  if (toolDisplay?.formatArgs) {
    return toolDisplay.formatArgs(toolName, input);
  }

  try {
    if (typeof input !== "object" || input === null) {
      return String(input);
    }

    const args = input as Record<string, unknown>;
    if (args.query) {
      return String(args.query);
    }
    return "Arguments not available";
  } catch {
    return "Arguments not available";
  }
}

export function ToolCall({ part }: { part: ToolCallPart }) {
  const { input } = part;
  const toolName = extractToolName(part);
  const toolDisplay = toolName
    ? TOOL_DISPLAY_MAP[toolName] || DEFAULT_TOOL_DISPLAY
    : DEFAULT_TOOL_DISPLAY;
  const formattedArgs = formatToolArguments(toolName || "", input, toolDisplay);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {toolDisplay.call_icon}
        <Shimmer duration={1}>{toolDisplay.call_label}</Shimmer>
      </div>
      {toolDisplay.formatArgs && formattedArgs && (
        <span className="text-muted-foreground/75 flex-1 min-w-0 truncate">
          {formattedArgs}
        </span>
      )}
    </div>
  );
}

export function ToolResult({ part }: { part: ToolResultPart }) {
  const toolName = extractToolName(part);
  const toolDisplay = toolName
    ? TOOL_DISPLAY_MAP[toolName] || DEFAULT_TOOL_DISPLAY
    : DEFAULT_TOOL_DISPLAY;

  const input = "input" in part ? part.input : undefined;
  const formattedArgs =
    input !== undefined ? formatToolArguments(toolName || "", input, toolDisplay) : "";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {toolDisplay.result_icon}
        <span>{toolDisplay.result_label}</span>
      </div>
      {toolDisplay.formatArgs && formattedArgs && (
        <span className="text-muted-foreground/75 flex-1 min-w-0 truncate">
          {formattedArgs}
        </span>
      )}
    </div>
  );
}


