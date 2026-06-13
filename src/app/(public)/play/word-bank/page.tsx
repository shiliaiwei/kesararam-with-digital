"use client";

import { GameKitShell } from "@/lib/gamekit/GameKitShell";
import { wordBankFormat } from "@/lib/gamekit/formats/word-bank";

export default function WordBankPage() {
    return <GameKitShell format={wordBankFormat} />;
}
