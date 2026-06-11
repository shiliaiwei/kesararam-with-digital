"use client";

import { Car, Truck, Bike, Ambulance, Bus, ArrowUp, CornerUpLeft, CornerUpRight } from "lucide-react";
import type { JunctionLayout, VehiclePlacement, VehicleKind, LaneDir, VehicleIntent } from "./types";

const VEHICLE_ICON: Record<VehicleKind, typeof Car> = {
    car: Car,
    truck: Truck,
    moto: Bike,
    ambulance: Ambulance,
    bus: Bus,
};

const VEHICLE_COLOR: Record<string, string> = {
    car: "#3b82f6",
    truck: "#f97316",
    moto: "#22c55e",
    ambulance: "#ef4444",
    bus: "#a855f7",
};

// Direction of travel (heading) for a vehicle sitting on a given approach arm.
// A car on the SOUTH arm drives UP (north), etc.
const HEADING_ANGLE: Record<LaneDir, number> = {
    south: 0,   // travelling up
    west: 90,   // travelling right
    north: 180, // travelling down
    east: 270,  // travelling left
};

// Intent rotation relative to heading (right-hand traffic).
const INTENT_DELTA: Record<VehicleIntent, number> = {
    straight: 0,
    right: 90,
    left: -90,
};

/**
 * Renders a junction with inline SVG roads + absolutely-positioned DOM vehicle
 * tiles. Each tile shows the vehicle facing its heading plus a turn-intent
 * arrow so the player can reason about right-of-way. Tapping stamps an ordinal.
 */
export function JunctionView({
    layout,
    order,
    onTap,
    disabled,
}: {
    layout: JunctionLayout;
    order: string[];
    onTap: (id: string) => void;
    disabled?: boolean;
}) {
    // Position a vehicle tile on the correct (right-hand) lane of its approach arm.
    function tilePos(v: VehiclePlacement): { left: string; top: string } {
        const near = 28 + v.pos * 14; // distance from centre toward the edge
        const laneOffset = 7; // keep right of the dashed centre line
        switch (v.approach) {
            case "north": // travels down → right lane is to the west (left)
                return { left: `${50 - laneOffset}%`, top: `${50 - near}%` };
            case "south": // travels up → right lane is to the east (right)
                return { left: `${50 + laneOffset}%`, top: `${50 + near}%` };
            case "east": // travels left → right lane is to the north (top)
                return { left: `${50 + near}%`, top: `${50 - laneOffset}%` };
            case "west": // travels right → right lane is to the south (bottom)
                return { left: `${50 - near}%`, top: `${50 + laneOffset}%` };
        }
    }

    return (
        <div
            className="relative w-full mx-auto border-4 border-black bg-[#dcdfe4]"
            style={{ aspectRatio: "1 / 1", maxWidth: 440, boxShadow: "6px 6px 0 #000" }}
        >
            {/* Roads (SVG) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
                <rect x="36" y="0" width="28" height="100" fill="#3f3f46" />
                <rect x="0" y="36" width="100" height="28" fill="#3f3f46" />
                {/* dashed centre lines */}
                <line x1="50" y1="0" x2="50" y2="36" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50" y1="64" x2="50" y2="100" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="36" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="64" y1="50" x2="100" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                {/* crosswalk hints near the junction box */}
                <rect x="36" y="36" width="28" height="28" fill="#52525b" />
            </svg>

            {/* Vehicles */}
            {layout.vehicles.map((v) => {
                const Icon = VEHICLE_ICON[v.kind] ?? Car;
                const pos = tilePos(v);
                const ordinal = order.indexOf(v.id) + 1;
                const picked = ordinal > 0;
                const headingAngle = HEADING_ANGLE[v.approach] + INTENT_DELTA[v.intent];
                const IntentIcon = v.intent === "left" ? CornerUpLeft : v.intent === "right" ? CornerUpRight : ArrowUp;
                return (
                    <button
                        key={v.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onTap(v.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-black flex flex-col items-center justify-center transition-transform"
                        style={{
                            left: pos.left,
                            top: pos.top,
                            width: 54,
                            height: 54,
                            boxShadow: picked ? "2px 2px 0 #000" : "4px 4px 0 #000",
                            transform: `translate(-50%, -50%) scale(${picked ? 0.96 : 1})`,
                            background: picked ? VEHICLE_COLOR[v.kind] ?? "#3b82f6" : "#fff",
                        }}
                        aria-label={`Vehicle ${v.id}, ${v.kind}, turning ${v.intent}`}
                    >
                        <Icon size={26} className={picked ? "text-white" : "text-black"} strokeWidth={2.4} />
                        {/* turn-intent arrow showing where this vehicle is heading */}
                        <span
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center"
                            style={{ background: "#facc15" }}
                            aria-hidden
                        >
                            <IntentIcon
                                size={13}
                                strokeWidth={3}
                                className="text-black"
                                style={{ transform: `rotate(${headingAngle}deg)` }}
                            />
                        </span>
                        {picked && (
                            <span
                                className="absolute -top-3 -right-3 w-7 h-7 bg-black text-yellow-400 text-sm font-black flex items-center justify-center border-2 border-yellow-400 rounded-full"
                                aria-hidden
                            >
                                {ordinal}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
