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

import { useLang } from "@/context/lang-context";

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

function Student({ x, y, kh }: { x: number; y: number; kh: boolean }) {
    const khStyle = kh ? { fontFamily: "var(--font-learning)" } : { fontFamily: "var(--font-en)" };
    return (
        <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }} aria-hidden>
            <ellipse cx={0} cy={3.4} rx={2.4} ry={1} fill="rgba(0,0,0,0.25)" />
            <rect x={-2.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#2563eb" />
            <rect x={1.3} y={-0.6} width={1} height={3.4} rx={0.5} fill="#2563eb" />
            <rect x={-1.9} y={-1} width={3.8} height={4} rx={1.4} fill="#e91e8c" stroke="#000" strokeWidth={0.3} />
            <rect x={-1.3} y={0.8} width={2.6} height={1.6} rx={0.4} fill="#fbbf24" stroke="#000" strokeWidth={0.3} />
            <circle cx={0} cy={-2.4} r={1.7} fill="#f1c27d" stroke="#000" strokeWidth={0.4} />
            <path d="M-1.5 -3.4 Q0 -4.8 1.5 -3.4" fill="none" stroke="#3b2a1a" strokeWidth={1} />
            <path d="M 0 -1.5 L 0 -4.5" stroke="#000" strokeWidth="0.4" strokeDasharray="1 1" />
            <g transform="translate(0, -7)">
                <rect x={-8} y={-2.2} width={16} height={4.4} fill="#fff" stroke="#000" strokeWidth="0.4" rx={0.8} />
                <text x={0} y={0.8} textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#000" style={khStyle}>
                    {kh ? "សិស្ស" : "STUDENT"}
                </text>
            </g>
        </g>
    );
}

function TrafficLightSprite({ x, y, rotation, active = "red" }: { x: number; y: number; rotation: number; active?: "red" | "yellow" | "green" }) {
    return (
        <g transform={`translate(${x} ${y}) rotate(${rotation})`} style={{ pointerEvents: "none" }} aria-hidden>
            <line x1={0} y1={0} x2={0} y2={6} stroke="#374151" strokeWidth="1" />
            <rect x={-1.5} y={-5} width={3} height={5} fill="#1f2937" stroke="#000" strokeWidth="0.4" rx={0.5} />
            <circle cx={0} cy={-4.1} r={0.7} fill={active === "red" ? "#ef4444" : "#374151"} />
            <circle cx={0} cy={-2.5} r={0.7} fill={active === "yellow" ? "#facc15" : "#374151"} />
            <circle cx={0} cy={-0.9} r={0.7} fill={active === "green" ? "#22c55e" : "#374151"} />
        </g>
    );
}

function Landmarks({ kh }: { kh: boolean }) {
    const khStyle = kh ? { fontFamily: "var(--font-learning)" } : { fontFamily: "var(--font-en)" };
    return (
        <g style={{ pointerEvents: "none" }} aria-hidden>
            {/* HOSPITAL (Top-Left) */}
            <rect x={5} y={5} width={26} height={24} fill="#000" rx={2} />
            <rect x={3} y={3} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={8} y={11} width={16} height={10} fill="#f1f5f9" stroke="#000" strokeWidth="0.5" />
            <rect x={12} y={7} width={8} height={4} fill="#f1f5f9" stroke="#000" strokeWidth="0.5" />
            <rect x={15.2} y={8} width={1.6} height={4} fill="#ef4444" />
            <rect x={14} y={9.2} width={4} height={1.6} fill="#ef4444" />
            <rect x={10} y={13} width={2.5} height={2} fill="#93c5fd" stroke="#000" strokeWidth="0.4" />
            <rect x={19.5} y={13} width={2.5} height={2} fill="#93c5fd" stroke="#000" strokeWidth="0.4" />
            <rect x={14.5} y={17} width={3} height={4} fill="#64748b" stroke="#000" strokeWidth="0.4" />
            <text x={16} y={24.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "មន្ទីរពេទ្យ" : "HOSPITAL"}
            </text>

            {/* SCHOOL (Top-Right) */}
            <rect x={71} y={5} width={26} height={24} fill="#000" rx={2} />
            <rect x={69} y={3} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={74} y={11} width={16} height={10} fill="#fef3c7" stroke="#000" strokeWidth="0.5" />
            <polygon points="72,11 82,6 92,11" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />
            <circle cx={82} cy={14} r={2} fill="#fff" stroke="#000" strokeWidth="0.4" />
            <line x1={82} y1={14} x2={82} y2={13} stroke="#000" strokeWidth="0.3" />
            <line x1={82} y1={14} x2={83} y2={14} stroke="#000" strokeWidth="0.3" />
            <rect x={80.5} y={17} width={3} height={4} fill="#b45309" stroke="#000" strokeWidth="0.4" />
            <text x={82} y={24.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "សាលារៀន" : "SCHOOL"}
            </text>

            {/* MARKET (Bottom-Left) */}
            <rect x={5} y={74} width={26} height={24} fill="#000" rx={2} />
            <rect x={3} y={72} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <rect x={6} y={79} width={20} height={11} fill="#e0f2fe" stroke="#000" strokeWidth="0.5" />
            <path d="M 5,79 L 27,79 L 25,76 L 7,76 Z" fill="#ef4444" stroke="#000" strokeWidth="0.5" />
            <polygon points="9,79 12,79 11,76 8,76" fill="#fff" />
            <polygon points="15,79 18,79 17,76 14,76" fill="#fff" />
            <polygon points="21,79 24,79 23,76 20,76" fill="#fff" />
            <rect x={12} y={84} width={8} height={6} fill="#fff" stroke="#000" strokeWidth="0.4" />
            <text x={16} y={93.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "ផ្សារ" : "MARKET"}
            </text>

            {/* HOUSE (Bottom-Right) */}
            <rect x={71} y={74} width={26} height={24} fill="#000" rx={2} />
            <rect x={69} y={72} width={26} height={24} fill="#fff" stroke="#000" strokeWidth="0.8" rx={2} />
            <polygon points="72,80 82,74 92,80" fill="#f87171" stroke="#000" strokeWidth="0.5" />
            <rect x={75} y={80} width={14} height={10} fill="#fef08a" stroke="#000" strokeWidth="0.5" />
            <rect x={78} y={82} width={3} height={3} fill="#cbd5e1" stroke="#000" strokeWidth="0.4" />
            <rect x={84} y={84} width={3} height={6} fill="#b45309" stroke="#000" strokeWidth="0.4" />
            <text x={82} y={93.5} textAnchor="middle" fontSize="2.8" fontWeight="900" fill="#000" style={khStyle}>
                {kh ? "ផ្ទះ" : "HOUSE"}
            </text>
        </g>
    );
}

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
    const { lang } = useLang();
    const kh = lang === "kh";

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

                {/* Landmarks backdrop */}
                <Landmarks kh={kh} />

                {/* Student figure at bottom right */}
                <Student x={67} y={67} kh={kh} />

                {/* Traffic Lights backdrop (replacing road signs as requested) */}
                {layout.hasTrafficLight ? (
                    <>
                        {/* Controlled intersection: vertical red, horizontal green */}
                        <TrafficLightSprite x={31} y={35} rotation={0} active="red" />
                        <TrafficLightSprite x={65} y={31} rotation={90} active="green" />
                        <TrafficLightSprite x={69} y={65} rotation={180} active="red" />
                        <TrafficLightSprite x={35} y={69} rotation={270} active="green" />
                    </>
                ) : (
                    <>
                        {/* Uncontrolled intersection: yellow warning lights */}
                        <TrafficLightSprite x={31} y={35} rotation={0} active="yellow" />
                        <TrafficLightSprite x={65} y={31} rotation={90} active="yellow" />
                        <TrafficLightSprite x={69} y={65} rotation={180} active="yellow" />
                        <TrafficLightSprite x={35} y={69} rotation={270} active="yellow" />
                    </>
                )}
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
