export const SCORE_PLATE_STYLE_IDS = ["road", "official", "kitty"] as const;

export type ScorePlateStyle = (typeof SCORE_PLATE_STYLE_IDS)[number];

export const DEFAULT_SCORE_PLATE_STYLE: ScorePlateStyle = "official";

export const SCORE_PLATE_STYLES: ReadonlyArray<{
  id: ScorePlateStyle;
  nameEn: string;
  nameKh: string;
  descriptionEn: string;
  descriptionKh: string;
  premium: boolean;
}> = [
  {
    id: "road",
    nameEn: "Road Plate",
    nameKh: "ផ្លាកផ្លូវ",
    descriptionEn: "Classic yellow vehicle plate",
    descriptionKh: "ផ្លាកយានយន្តពណ៌លឿង",
    premium: false,
  },
  {
    id: "official",
    nameEn: "Official Plate",
    nameKh: "ផ្លាកលេខផ្លូវការ",
    descriptionEn: "Government-style plate with navy border & QR",
    descriptionKh: "ផ្លាកបែបផ្លូវការ ស៊ុមខៀវ និង QR",
    premium: false,
  },
  {
    id: "kitty",
    nameEn: "Kitty Plate",
    nameKh: "ផ្លាកគីទី",
    descriptionEn: "Cute kitty plate with pink bow & whiskers",
    descriptionKh: "ផ្លាកលេខកូនឆ្មាគួរឱ្យស្រឡាញ់ជាមួយបូពណ៌ផ្កាឈូក",
    premium: true,
  },
];

export function isScorePlateStyle(value: unknown): value is ScorePlateStyle {
  return typeof value === "string" && SCORE_PLATE_STYLE_IDS.includes(value as ScorePlateStyle);
}

export function normalizeScorePlateStyle(value: unknown): ScorePlateStyle {
  return isScorePlateStyle(value) ? value : DEFAULT_SCORE_PLATE_STYLE;
}

export function isPremiumScorePlate(value: ScorePlateStyle): boolean {
  return SCORE_PLATE_STYLES.find((p) => p.id === value)?.premium ?? false;
}
