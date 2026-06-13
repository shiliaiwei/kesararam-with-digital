"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { signConnectFormat } from "@/lib/gamekit/formats/sign-connect";

export default function SignConnectPage() {
    return <GameKitShell format={signConnectFormat} />;
}
