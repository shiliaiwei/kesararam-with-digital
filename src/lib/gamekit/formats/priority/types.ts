import type { KitCompletionResult } from "@/lib/gamekit/types";

export type LaneDir = "north" | "south" | "east" | "west";
export type JunctionKind = "cross" | "t_junction" | "roundabout";
export type VehicleIntent = "straight" | "left" | "right";
export type VehicleKind = "car" | "truck" | "moto" | "ambulance" | "bus";

export interface VehiclePlacement {
    id: string; // unique within scene, e.g. "v1"
    approach: LaneDir; // which arm the vehicle sits on
    intent: VehicleIntent;
    kind: VehicleKind;
    /** 0..1 normalized position along the approach for rendering. */
    pos: number;
}

export interface JunctionLayout {
    junction: JunctionKind;
    hasTrafficLight: boolean;
    vehicles: VehiclePlacement[]; // length 2..4
}

/** Client-facing scene — NO correctOrder. */
export interface PriorityRound {
    sceneId: number;
    titleEn: string;
    titleKm: string;
    layout: JunctionLayout;
    difficulty: string | null;
}

/** Per-round payload the client submits (the tapped order). */
export interface PriorityRoundPayload extends Record<string, unknown> {
    submittedOrder: string[]; // vehicleIds in tapped order
}

export interface PriorityCompletionResult extends KitCompletionResult {
    perScene: {
        sceneId: number;
        submittedOrder: string[];
        correctOrder: string[]; // revealed only after completion
        isCorrect: boolean;
        explanationEn: string;
        explanationKm: string;
    }[];
}
