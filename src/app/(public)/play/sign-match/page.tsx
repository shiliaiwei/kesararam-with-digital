"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { signMatchFormat } from "@/lib/gamekit/formats/sign-match";

export default function SignMatchPage() {
    return <GameKitShell format={signMatchFormat} />;
}
