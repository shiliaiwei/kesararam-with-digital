"use client";

import { useMemo, useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    closestCenter,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { WalletCards, GripVertical, Check, X } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface WBItem {
    id: number;
    nameEn: string;
    nameKm: string;
    imageUrl: string;
}
interface WordBankRound {
    kind: "word-bank";
    id: number;
    items: WBItem[];
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function qaFont() {
    return { fontFamily: "var(--font-qa)" };
}

// ── A draggable word chip (also tappable for the tap-to-place fallback) ──
function Chip({
    item, kh, selected, onTap,
}: { item: WBItem; kh: boolean; selected: boolean; onTap: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `chip-${item.id}` });
    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={onTap}
            className="flex items-center gap-1 border-2 border-black px-2 py-1.5 text-left touch-none"
            style={{
                background: selected ? "#fde047" : "#eab308",
                boxShadow: selected ? "3px 3px 0 #000" : "2px 2px 0 #000",
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                opacity: isDragging ? 0.4 : 1,
                cursor: "grab",
                ...qaFont(),
            }}
            aria-label="word chip"
        >
            <GripVertical size={12} className="text-black/60 shrink-0" />
            <span className="font-black text-black text-xs leading-tight">{kh ? item.nameKm || item.nameEn : item.nameEn}</span>
        </button>
    );
}

// ── A sign picture with a drop slot underneath ──
function PictureSlot({
    item, kh, placed, label, onTapPlace,
}: {
    item: WBItem; kh: boolean;
    placed: { chipId: number; correct: boolean } | undefined;
    label: string | null;
    onTapPlace: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `pic-${item.id}` });
    const border = placed ? (placed.correct ? "#16a34a" : "#dc2626") : "#000";
    const bg = placed ? (placed.correct ? "#bbf7d0" : "#fecaca") : isOver ? "#fef9c3" : "#fff";
    return (
        <div ref={setNodeRef} onClick={onTapPlace} className="flex flex-col border-2 bg-white" style={{ borderColor: border, boxShadow: `3px 3px 0 ${border}` }}>
            <div className="relative aspect-square flex items-center justify-center p-2 border-b-2" style={{ borderColor: border, background: bg }}>
                <img src={cloudinaryOptimize(item.imageUrl, 200)} alt="" className="max-h-full max-w-full object-contain pointer-events-none" />
                {placed && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 border-2 border-black flex items-center justify-center" style={{ background: placed.correct ? "#16a34a" : "#dc2626" }}>
                        {placed.correct ? <Check size={11} className="text-white" strokeWidth={3} /> : <X size={11} className="text-white" strokeWidth={3} />}
                    </span>
                )}
            </div>
            <div className="px-1.5 py-1 text-center min-h-[26px] flex items-center justify-center" style={{ background: bg }}>
                <span className="font-black text-[11px] leading-tight" style={{ color: placed ? (placed.correct ? "#166534" : "#991b1b") : "#a1a1aa", ...qaFont() }}>
                    {label ?? (kh ? "ទម្លាក់ពាក្យ" : "drop word")}
                </span>
            </div>
        </div>
    );
}

function WordBankView({ round, lang, onRoundComplete }: RoundViewProps<WordBankRound>) {
    const kh = lang === "kh";
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);
    const placementsRef = useRef<{ pictureId: number; chipId: number }[]>([]);

    const bankOrder = useMemo(() => shuffle(round.items), [round]); // chips, shuffled
    const labelOf = (id: number) => {
        const it = round.items.find((x) => x.id === id);
        return it ? (kh ? it.nameKm || it.nameEn : it.nameEn) : "";
    };

    const [placed, setPlaced] = useState<Record<number, { chipId: number; correct: boolean }>>({});
    const [usedChips, setUsedChips] = useState<Set<number>>(new Set());
    const [selectedChip, setSelectedChip] = useState<number | null>(null);
    const [activeChip, setActiveChip] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
    );

    function place(pictureId: number, chipId: number) {
        if (doneRef.current) return;
        if (placed[pictureId] || usedChips.has(chipId)) return;
        const correct = pictureId === chipId;
        setPlaced((p) => ({ ...p, [pictureId]: { chipId, correct } }));
        setUsedChips((s) => new Set(s).add(chipId));
        setSelectedChip(null);
        placementsRef.current.push({ pictureId, chipId });

        if (placementsRef.current.length === round.items.length && !doneRef.current) {
            doneRef.current = true;
            const allCorrect = placementsRef.current.every((x) => x.pictureId === x.chipId);
            const correctUnits = placementsRef.current.filter((x) => x.pictureId === x.chipId).length;
            setTimeout(() => {
                onRoundComplete({
                    refId: round.id,
                    isCorrectGuess: allCorrect,
                    correctUnits,
                    unitCount: placementsRef.current.length,
                    payload: { placements: placementsRef.current },
                    timeTakenMs: Date.now() - startRef.current,
                    difficulty: "easy",
                });
            }, 600);
        }
    }

    function onDragStart(e: DragStartEvent) {
        const id = Number(String(e.active.id).replace("chip-", ""));
        setActiveChip(Number.isFinite(id) ? id : null);
    }
    function onDragEnd(e: DragEndEvent) {
        setActiveChip(null);
        if (!e.over) return;
        const chipId = Number(String(e.active.id).replace("chip-", ""));
        const pictureId = Number(String(e.over.id).replace("pic-", ""));
        if (Number.isFinite(chipId) && Number.isFinite(pictureId)) place(pictureId, chipId);
    }

    const remainingChips = bankOrder.filter((c) => !usedChips.has(c.id));
    const filled = Object.keys(placed).length;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex flex-col gap-3 w-full">
                <div className="text-center">
                    <div className="text-sm font-black text-zinc-300" style={qaFont()}>
                        {kh ? `ផ្គូផ្គងសញ្ញា · ${filled}/${round.items.length}` : `Matching Sign · ${filled}/${round.items.length}`}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 mt-0.5" style={qaFont()}>
                        {kh ? "អូស ឬប៉ះពាក្យ រួចដាក់លើរូបសញ្ញាត្រឹមត្រូវ" : "Drag or tap a word onto the matching sign"}
                    </div>
                </div>

                {/* Word bank */}
                <div className="border-2 border-black bg-zinc-900 p-2 flex flex-wrap gap-2 justify-center min-h-[52px]" style={{ boxShadow: "3px 3px 0 #000" }}>
                    {remainingChips.length === 0 ? (
                        <span className="text-xs font-black text-zinc-500 self-center" style={qaFont()}>
                            {kh ? "អស់ពាក្យ" : "bank empty"}
                        </span>
                    ) : (
                        remainingChips.map((item) => (
                            <Chip key={item.id} item={item} kh={kh} selected={selectedChip === item.id} onTap={() => setSelectedChip((s) => (s === item.id ? null : item.id))} />
                        ))
                    )}
                </div>

                {/* Picture grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {round.items.map((item) => (
                        <PictureSlot
                            key={item.id}
                            item={item}
                            kh={kh}
                            placed={placed[item.id]}
                            label={placed[item.id] ? labelOf(placed[item.id].chipId) : null}
                            onTapPlace={() => { if (selectedChip !== null) place(item.id, selectedChip); }}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeChip !== null ? (
                    <div className="flex items-center gap-1 border-2 border-black px-2 py-1.5" style={{ background: "#fde047", boxShadow: "3px 3px 0 #000", ...qaFont() }}>
                        <GripVertical size={12} className="text-black/60" />
                        <span className="font-black text-black text-xs">{labelOf(activeChip)}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export const wordBankFormat: GameFormat<WordBankRound, KitCompletionResult> = {
    meta: {
        id: "word-bank",
        route: "/play/word-bank",
        title: { en: "Matching Sign", kh: "Matching Sign" },
        description: {
            en: "Drag each word onto its matching road sign.",
            kh: "អូសពាក្យនីមួយៗ ទៅដាក់លើសញ្ញាចរាចរណ៍ដែលត្រូវគ្នា។",
        },
        brandColor: "#ec4899",
        Icon: WalletCards,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "equal", showStreakHud: false },
    fetchRounds: async () => {
        const r = await fetch("/api/game/word-bank?count=2");
        if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            return { rounds: [], locked: d.locked, lockMessage: d.lockMessage };
        }
        return r.json();
    },
    completePath: "/api/game/word-bank/complete",
    RoundView: WordBankView,
};
