export const SCORE_PLATE_STYLE_IDS = ["road", "garden", "sky", "rose", "car", "official"] as const;

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
    id: "garden",
    nameEn: "Garden Sign",
    nameKh: "ផ្លាកសួនបៃតង",
    descriptionEn: "Green heritage sign frame",
    descriptionKh: "ស៊ុមបៃតងបែបបុរាណ",
    premium: true,
  },
  {
    id: "sky",
    nameEn: "Sky Bloom",
    nameKh: "ផ្កាមេឃខៀវ",
    descriptionEn: "Blue flower corner plate",
    descriptionKh: "ផ្លាកជ្រុងផ្កាពណ៌ខៀវ",
    premium: true,
  },
  {
    id: "rose",
    nameEn: "Rose Frame",
    nameKh: "ស៊ុមផ្កាឈូក",
    descriptionEn: "Rose ornamental score card",
    descriptionKh: "កាតពិន្ទុលម្អពណ៌ផ្កាឈូក",
    premium: true,
  },
  {
    id: "car",
    nameEn: "Car Plate",
    nameKh: "ផ្លាកលេខឡាន",
    descriptionEn: "Premium vehicle license plate with capsule holes",
    descriptionKh: "ផ្លាកលេខរថយន្តបែបទំនើបជាមួយរន្ធវីសវែង",
    premium: true,
  },
  {
    id: "official",
    nameEn: "Official Plate",
    nameKh: "ផ្លាកលេខផ្លូវការ",
    descriptionEn: "Government-style plate with navy border & QR",
    descriptionKh: "ផ្លាកបែបផ្លូវការ ស៊ុមខៀវ និង QR",
    premium: false,
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
