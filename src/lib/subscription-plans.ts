/**
 * Pure plan definitions — NO database imports.
 * Safe to import in both client and server components.
 */

export type PlanTier = "free" | "teacher_pro" | "school" | "family" | "driving_school" | "individual";

export interface PlanLimits {
  maxPlayersPerSession: number;
  maxSessionsPerMonth: number | null;
  allCategories: boolean;
  maxCategories: number;
  analytics: boolean;
  exportResults: boolean;
  advancedGameModes: boolean;
  removeBranding: boolean;
  maxTeacherAccounts: number;
  maxStudentsPerSession: number;
  classManagement: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxPlayersPerSession: 10,
    maxSessionsPerMonth: 1,
    allCategories: false,
    maxCategories: 1,
    analytics: false,
    exportResults: false,
    advancedGameModes: false,
    removeBranding: false,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 10,
    classManagement: false,
    prioritySupport: false,
  },
  teacher_pro: {
    maxPlayersPerSession: 50,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 50,
    classManagement: false,
    prioritySupport: false,
  },
  school: {
    maxPlayersPerSession: 200,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 10,
    maxStudentsPerSession: 200,
    classManagement: true,
    prioritySupport: true,
  },
  family: {
    maxPlayersPerSession: 10,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 10,
    classManagement: false,
    prioritySupport: false,
  },
  driving_school: {
    maxPlayersPerSession: 200,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 10,
    maxStudentsPerSession: 200,
    classManagement: true,
    prioritySupport: true,
  },
  individual: {
    maxPlayersPerSession: 50,
    maxSessionsPerMonth: null,
    allCategories: true,
    maxCategories: 999,
    analytics: true,
    exportResults: true,
    advancedGameModes: true,
    removeBranding: true,
    maxTeacherAccounts: 1,
    maxStudentsPerSession: 50,
    classManagement: false,
    prioritySupport: false,
  },
};

export const PLAN_DISPLAY = {
  free: {
    name: "Free",
    nameKh: "ឥតគិតថ្លៃ",
    price: 0,
    priceLabel: "$0",
    color: "#6b7280",
    badge: null,
  },
  teacher_pro: {
    name: "Teacher Pro",
    nameKh: "គ្រូ Pro",
    price: 10,
    priceLabel: "$10",
    color: "#f59e0b",
    badge: "Most Popular",
  },
  school: {
    name: "School",
    nameKh: "សាលា",
    price: 20,
    priceLabel: "$20",
    color: "#8b5cf6",
    badge: "Best Value",
  },
  family: {
    name: "Family",
    nameKh: "គ្រួសារ",
    price: 5,
    priceLabel: "$5",
    color: "#3b82f6",
    badge: null,
  },
  driving_school: {
    name: "Driving School",
    nameKh: "សាលាបង្រៀនបើកបរ",
    price: 35,
    priceLabel: "$35",
    color: "#10b981",
    badge: null,
  },
  individual: {
    name: "Individual",
    nameKh: "ឯកជន",
    price: 10,
    priceLabel: "$10",
    color: "#ec4899",
    badge: null,
  },
} as const;
