"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { catchSignFormat } from "@/lib/gamekit/formats/catch-sign";

export default function CatchSignPage() {
    return <GameKitShell format={catchSignFormat} />;
}
