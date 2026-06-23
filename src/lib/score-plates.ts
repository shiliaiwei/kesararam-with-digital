export const SCORE_PLATE_STYLE_IDS = ["road", "official", "ribbon", "heritage", "eco", "cyber", "vintage"] as const;

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
    nameEn: "Vintage 1990 Plate",
    nameKh: "ផ្លាកបុរាណឆ្នាំ ១៩៩០",
    descriptionEn: "Vintage 1990 series Cambodian vehicle plate",
    descriptionKh: "ផ្លាកលេខយានយន្តបុរាណ កម្ពុជាជំនាន់ឆ្នាំ ១៩៩០",
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
    id: "ribbon",
    nameEn: "Diplomatic Plate",
    nameKh: "ផ្លាកលេខការទូត",
    descriptionEn: "1990s vintage Cambodian diplomatic plate (CD)",
    descriptionKh: "ផ្លាកលេខយានយន្តការទូតបុរាណទសវត្សរ៍ឆ្នាំ ៩០ (CD)",
    premium: true,
  },
  {
    id: "heritage",
    nameEn: "Angkor Heritage (1972 Gov)",
    nameKh: "ផ្លាកបេតិកភណ្ឌអង្គរ (រដ្ឋាភិបាលឆ្នាំ ១៩៧២)",
    descriptionEn: "Vintage 1972 government Crimson & Gold stenciled plate",
    descriptionKh: "ផ្លាកលេខរដ្ឋាភិបាលកម្ពុជាបុរាណឆ្នាំ ១៩៧២ (ពណ៌ក្រហម និងមាស)",
    premium: true,
  },
  {
    id: "eco",
    nameEn: "Eco-Green (1990 Gov)",
    nameKh: "ផ្លាកបៃតងធម្មជាតិ (រដ្ឋការទសវត្សរ៍ឆ្នាំ ៩០)",
    descriptionEn: "1990s green state plate with leaf details",
    descriptionKh: "ផ្លាកលេខរដ្ឋការពណ៌បៃតង ជំនាន់ទសវត្សរ៍ឆ្នាំ ៩០",
    premium: true,
  },
  {
    id: "cyber",
    nameEn: "Cyberpunk UNTAC",
    nameKh: "ផ្លាកបច្ចេកវិទ្យា (UNTAC)",
    descriptionEn: "UN-blue UNTAC style plate with neon glowing accents",
    descriptionKh: "ផ្លាកលេខបែប UNTAC ស៊ុមពណ៌ផ្កាឈូក និងខៀវភ្លឺ",
    premium: true,
  },
  {
    id: "vintage",
    nameEn: "Vintage Police",
    nameKh: "ផ្លាកនគរបាលបុរាណ",
    descriptionEn: "Vintage police plate with red lettering & yellow screw caps",
    descriptionKh: "ផ្លាកលេខនគរបាលជាតិកម្ពុជាបុរាណ ពណ៌ស និងអក្សរក្រហម",
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
