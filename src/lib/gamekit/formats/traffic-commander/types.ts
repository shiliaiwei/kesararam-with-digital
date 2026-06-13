import type { KitCompletionResult } from "@/lib/gamekit/types";
import type { LaneDir, Intent, Pt } from "./geometry";

export type VehicleKind = "car" | "truck" | "moto" | "ambulance" | "bus";

export interface TVehicle {
    id: string;
    approach: LaneDir;
    intent: Intent;
    kind: VehicleKind;
    pos: number;
}

export interface TLayout {
    junction: "cross" | "t_junction" | "roundabout";
    hasTrafficLight: boolean;
    vehicles: TVehicle[];
}

/** Round mode — Phase 1 ships Mode A only. */
export type TrafficMode = "A";

/** A real road sign (from the DB) shown in the scene, chosen by scenario. */
export interface SceneSign {
    imageUrl: string;
    nameEn: string;
    nameKm: string;
}

/** Client-facing round — NO answer key. */
export interface TrafficRound {
    sceneId: number;
    titleEn: string;
    titleKm: string;
    mode: TrafficMode;
    layout: TLayout;
    difficulty: string | null;
    signs?: SceneSign[];
}

/** What the client submits for one Mode-A round. */
export interface TrafficRoundPayload extends Record<string, unknown> {
    mode: TrafficMode;
    paths: Record<string, Pt[]>; // vehicleId → sampled drawn points
    drawOrder: string[]; // order the player drew the vehicles (= claimed priority)
}

/** Per-scene result revealed only after scoring (for the animation + why-card). */
export interface TrafficSceneResult {
    sceneId: number;
    vehicles: TVehicle[];
    correctPaths: Record<string, Pt[]>;
    correctOrder: string[];
    submittedOrder: string[];
    isCorrect: boolean;
    explanationEn: string;
    explanationKm: string;
    hasTrafficLight?: boolean;
}

export interface TrafficCompletionResult extends KitCompletionResult {
    scenes: TrafficSceneResult[];
}
