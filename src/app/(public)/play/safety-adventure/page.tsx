"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { safetyAdventureFormat } from "@/lib/gamekit/formats/safety-adventure";

export default function SafetyAdventurePage() {
    return <GameKitShell format={safetyAdventureFormat} />;
}
