"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { tickSignFormat } from "@/lib/gamekit/formats/tick-sign";

export default function TickSignPage() {
    return <GameKitShell format={tickSignFormat} />;
}
