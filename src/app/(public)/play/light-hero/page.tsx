"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { lightHeroFormat } from "@/lib/gamekit/formats/light-hero";

export default function LightHeroPage() {
    return <GameKitShell format={lightHeroFormat} />;
}
