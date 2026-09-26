export type CulturalSystemKind =
  | "runic-writing"
  | "calendar"
  | "calendar-mathematics"
  | "symbolic-writing"
  | "historical-divination"
  | "mythology"
  | "folklore"
  | "modern-reconstruction";

export type CulturalSourceType =
  | "museum"
  | "heritage-authority"
  | "community-institution"
  | "primary-source-edition"
  | "academic-secondary"
  | "modern-practitioner"
  | "editorial";

export type HistoricalClaimStatus =
  | "attested"
  | "scholarly-reconstruction"
  | "disputed"
  | "modern"
  | "living-tradition";

export interface CulturalSource {
  readonly id: string;
  readonly title: string;
  readonly institution?: string;
  readonly author?: string;
  readonly url: string;
  readonly sourceType: CulturalSourceType;
  readonly languages: readonly string[];
  readonly note?: string;
}

export interface CulturalClaim {
  readonly id: string;
  readonly status: HistoricalClaimStatus;
  readonly statement: string;
  readonly sourceIds: readonly string[];
}

export interface CulturalModule {
  readonly id: string;
  readonly title: string;
  readonly kinds: readonly CulturalSystemKind[];
  readonly geography: readonly string[];
  readonly periods: readonly string[];
  readonly communities?: readonly string[];
  readonly originalLanguages?: readonly string[];
  readonly sourceIds: readonly string[];
  readonly claims: readonly CulturalClaim[];
  readonly cautions: readonly string[];
}

export interface CulturalAtlasCatalog {
  readonly schemaVersion: 1;
  readonly sources: readonly CulturalSource[];
  readonly modules: readonly CulturalModule[];
}
