"use client";

import { useState } from "react";
import { Car, Truck, Bike, Ambulance, Bus } from "lucide-react";
import type { JunctionLayout, VehiclePlacement, VehicleKind } from "./types";

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

/**
 * Renders a junction with inline SVG roads + absolutely-positioned DOM vehicle
 * tiles. Tapping a vehicle stamps its ordinal (1..n). No canvas/WebGL.
 */
export function JunctionView({
    layout,
    onOrderChange,
    disabled,
}: {
    layout: JunctionLayout;
    onOrderChange: (order: string[]) => void;
    disabled?: boolean;
}) {
    const [order, setOrder] = useState<string[]>([]);

    function tap(id: string) {
        if (disabled) return;
        setOrder((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            onOrderChange(next);
            return next;
        });
    }

    // Position a vehicle tile along its approach arm (normalized 0..1 -> %).
    function tilePos(v: VehiclePlacement): { left: string; top: string } {
        const near = 30 + v.pos * 18; // distance from center toward the edge
        switch (v.approach) {
            case "north":
                return { left: "50%", top: `${50 - near}%` };
            case "south":
                return { left: "50%", top: `${50 + near}%` };
            case "east":
                return { left: `${50 + near}%`, top: "50%" };
            case "west":
                return { left: `${50 - near}%`, top: "50%" };
        }
    }

    return (
        <div
            className="relative w-full mx-auto border-4 border-black bg-[#e5e7eb]"
            style={{ aspectRatio: "1 / 1", maxWidth: 420, boxShadow: "6px 6px 0 #000" }}
        >
            {/* Roads (SVG) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
                <rect x="38" y="0" width="24" height="100" fill="#3f3f46" />
                <rect x="0" y="38" width="100" height="24" fill="#3f3f46" />
                {/* dashed centre lines */}
                <line x1="50" y1="0" x2="50" y2="38" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50" y1="62" x2="50" y2="100" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="38" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="62" y1="50" x2="100" y2="50" stroke="#facc15" strokeWidth="1" strokeDasharray="3 3" />
            </svg>

            {/* Vehicles */}
            {layout.vehicles.map((v) => {
                const Icon = VEHICLE_ICON[v.kind] ?? Car;
                const pos = tilePos(v);
                const ordinal = order.indexOf(v.id) + 1;
                const picked = ordinal > 0;
                return (
                    <button
                        key={v.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => tap(v.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white flex items-center justify-center transition-transform"
                        style={{
                            left: pos.left,
                            top: pos.top,
                            width: 48,
                            height: 48,
                            minWidth: 44,
                            minHeight: 44,
                            boxShadow: picked ? "2px 2px 0 #000" : "4px 4px 0 #000",
                            transform: `translate(-50%, -50%) scale(${picked ? 0.94 : 1})`,
                            background: picked ? VEHICLE_COLOR[v.kind] ?? "#3b82f6" : "#fff",
                        }}
                        aria-label={`vehicle ${v.id}`}
                    >
                        <Icon size={24} className={picked ? "text-white" : "text-black"} strokeWidth={2.4} />
                        {picked && (
                            <span
                                className="absolute -top-2 -right-2 w-5 h-5 bg-black text-yellow-400 text-[11px] font-black flex items-center justify-center border border-yellow-400"
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
