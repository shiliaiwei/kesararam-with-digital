"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { priorityFormat } from "@/lib/gamekit/formats/priority";

export default function PriorityPuzzlePage() {
    return <GameKitShell format={priorityFormat} />;
}
