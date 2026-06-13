"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { safeStreetSmartFormat } from "@/lib/gamekit/formats/safe-street-smart";

export default function SafeStreetSmartPage() {
    return <GameKitShell format={safeStreetSmartFormat} />;
}
