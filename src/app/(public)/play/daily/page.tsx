"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { dailyFormat } from "@/lib/gamekit/formats/daily";

export default function DailyPage() {
    return <GameKitShell format={dailyFormat} />;
}
