"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { trafficCommanderFormat } from "@/lib/gamekit/formats/traffic-commander";

export default function TrafficCommanderPage() {
    return <GameKitShell format={trafficCommanderFormat} />;
}
