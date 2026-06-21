/**
 * Truly Random Question Selection Algorithm
 * 
 * This algorithm ensures that:
 * 1. Questions are selected randomly from all available categories
 * 2. No predictable patterns - each session is unique
 * 3. Questions are distributed across categories when multiple are selected
 * 4. Crypto randomness avoids predictable time/user seed patterns
 * 5. The answer order can reuse the same secure shuffle helper
 */

interface QuestionCandidate {
    id: number;
    categoryId: number;
    difficulty: string | null;
    [key: string]: any;
}

interface SelectionOptions {
    questions: QuestionCandidate[];
    questionCount: number;
    categoryIds: number[];
    userId?: number;
    sessionTime?: number;
    gameMode?: string;
}

/**
 * Cryptographically secure random number generator
 */
function getSecureRandom(): number {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
}

/**
 * Fisher-Yates shuffle with cryptographic randomness
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(getSecureRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Deterministic 32-bit seed from a string (FNV-1a).
 */
function hashSeed(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/**
 * Seeded PRNG (mulberry32) — deterministic stream from a numeric seed.
 */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Deterministic Fisher-Yates shuffle from a string seed.
 *
 * Same seed → same order every time (stable), different seed → different order.
 * Use this for LIVE play so a question's answer order is fixed for its whole
 * duration and identical for every player (fair), yet still unpredictable:
 * the seed mixes the random session code with the question id, and the order
 * never encodes which answer is correct.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
    const rand = mulberry32(hashSeed(seed));
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Distribute questions evenly across categories
 * This ensures variety when multiple categories are selected
 */
function distributeAcrossCategories(
    questions: QuestionCandidate[],
    categoryIds: number[],
    count: number
): QuestionCandidate[] {
    if (categoryIds.length === 1) {
        // Single category: just shuffle and take
        return shuffleArray(questions).slice(0, count);
    }

    // Group questions by category
    const byCategory = new Map<number, QuestionCandidate[]>();
    for (const q of questions) {
        if (!byCategory.has(q.categoryId)) {
            byCategory.set(q.categoryId, []);
        }
        byCategory.get(q.categoryId)!.push(q);
    }

    // Shuffle questions within each category
    for (const [catId, catQuestions] of byCategory.entries()) {
        byCategory.set(catId, shuffleArray(catQuestions));
    }

    // Calculate how many questions per category
    const perCategory = Math.floor(count / categoryIds.length);
    const remainder = count % categoryIds.length;

    const selected: QuestionCandidate[] = [];
    const shuffledCategoryIds = shuffleArray(categoryIds);

    // Take questions from each category in round-robin fashion
    for (let i = 0; i < shuffledCategoryIds.length; i++) {
        const catId = shuffledCategoryIds[i];
        const catQuestions = byCategory.get(catId) || [];

        // Take base amount plus one extra for first 'remainder' categories
        const takeCount = perCategory + (i < remainder ? 1 : 0);
        const taken = catQuestions.slice(0, takeCount);
        selected.push(...taken);
    }

    // If we still don't have enough (some categories had fewer questions),
    // fill from remaining questions
    if (selected.length < count) {
        const usedIds = new Set(selected.map(q => q.id));
        const remaining = questions.filter(q => !usedIds.has(q.id));
        const shuffledRemaining = shuffleArray(remaining);
        selected.push(...shuffledRemaining.slice(0, count - selected.length));
    }

    // Final shuffle to mix categories
    return shuffleArray(selected).slice(0, count);
}

/**
 * Main question selection function
 * 
 * Features:
 * - Cryptographically secure randomness
 * - Fresh server-side randomness on every request
 * - Category distribution for variety
 * - No predictable patterns
 */
export function selectRandomQuestions(options: SelectionOptions): QuestionCandidate[] {
    const { questions, questionCount, categoryIds, gameMode } = options;

    if (questions.length === 0) {
        return [];
    }

    if (questions.length <= questionCount) {
        // Not enough questions, return all shuffled
        return shuffleArray(questions);
    }

    // Special logic for Mixed Practice
    if (gameMode === "mixed-practice") {
        const signQuestions = questions.filter(
            (q) => q.categorySlug === "road-sign" || q.categorySlug === "road-signs"
        );
        const priorityQuestions = questions.filter(
            (q) => q.categorySlug === "priority"
        );
        const otherQuestions = questions.filter(
            (q) => q.categorySlug !== "road-sign" && q.categorySlug !== "road-signs" && q.categorySlug !== "priority"
        );

        let roadSignTarget = Math.round(questionCount * 0.40);
        let priorityTarget = Math.round(questionCount * 0.05);
        if (priorityTarget === 0 && questionCount >= 10) {
            priorityTarget = 1;
        }
        let otherTarget = questionCount - roadSignTarget - priorityTarget;
        if (otherTarget < 0) {
            otherTarget = 0;
            roadSignTarget = questionCount - priorityTarget;
        }

        const selectedSigns = shuffleArray(signQuestions).slice(0, roadSignTarget);
        const selectedPriority = shuffleArray(priorityQuestions).slice(0, priorityTarget);
        const selectedOthers = shuffleArray(otherQuestions).slice(0, otherTarget);

        const combined = [...selectedSigns, ...selectedPriority, ...selectedOthers];

        // Backfill if needed
        if (combined.length < questionCount) {
            const usedIds = new Set(combined.map((q) => q.id));
            const remaining = questions.filter((q) => !usedIds.has(q.id));
            const extra = shuffleArray(remaining).slice(0, questionCount - combined.length);
            combined.push(...extra);
        }

        return shuffleArray(combined);
    }

    // Distribute across categories for variety
    const selected = distributeAcrossCategories(
        questions,
        categoryIds,
        questionCount
    );

    return selected;
}

/**
 * Select questions with difficulty balancing
 * Ensures a good mix of easy, medium, and hard questions
 */
export function selectBalancedQuestions(
    questions: QuestionCandidate[],
    questionCount: number,
    categoryIds: number[],
    userId?: number
): QuestionCandidate[] {
    // Group by difficulty
    const byDifficulty = {
        easy: questions.filter(q => q.difficulty === 'easy'),
        medium: questions.filter(q => q.difficulty === 'medium'),
        hard: questions.filter(q => q.difficulty === 'hard'),
        other: questions.filter(q => !q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty)),
    };

    // Target distribution: 40% easy, 40% medium, 20% hard
    const easyCount = Math.floor(questionCount * 0.4);
    const mediumCount = Math.floor(questionCount * 0.4);
    const hardCount = Math.floor(questionCount * 0.2);
    const otherCount = questionCount - easyCount - mediumCount - hardCount;

    const selected: QuestionCandidate[] = [];

    // Select from each difficulty level
    const easySelected = selectRandomQuestions({
        questions: byDifficulty.easy,
        questionCount: easyCount,
        categoryIds,
        userId,
    });
    selected.push(...easySelected);

    const mediumSelected = selectRandomQuestions({
        questions: byDifficulty.medium,
        questionCount: mediumCount,
        categoryIds,
        userId,
    });
    selected.push(...mediumSelected);

    const hardSelected = selectRandomQuestions({
        questions: byDifficulty.hard,
        questionCount: hardCount,
        categoryIds,
        userId,
    });
    selected.push(...hardSelected);

    // Fill remaining with other difficulties
    if (otherCount > 0) {
        const otherSelected = selectRandomQuestions({
            questions: byDifficulty.other,
            questionCount: otherCount,
            categoryIds,
            userId,
        });
        selected.push(...otherSelected);
    }

    // If we don't have enough from the target distribution, fill from all questions
    if (selected.length < questionCount) {
        const usedIds = new Set(selected.map(q => q.id));
        const remaining = questions.filter(q => !usedIds.has(q.id));
        const additionalSelected = selectRandomQuestions({
            questions: remaining,
            questionCount: questionCount - selected.length,
            categoryIds,
            userId,
        });
        selected.push(...additionalSelected);
    }

    // Final shuffle
    return shuffleArray(selected).slice(0, questionCount);
}

/**
 * Utility: Check if two question sets are different
 * Useful for testing randomness
 */
export function areQuestionSetsDifferent(
    set1: QuestionCandidate[],
    set2: QuestionCandidate[]
): boolean {
    if (set1.length !== set2.length) return true;

    const ids1 = set1.map(q => q.id).sort();
    const ids2 = set2.map(q => q.id).sort();

    for (let i = 0; i < ids1.length; i++) {
        if (ids1[i] !== ids2[i]) return true;
    }

    return false;
}

/**
 * Utility: Calculate uniqueness score between two sessions
 * Returns a percentage (0-100) of how different the questions are
 */
export function calculateUniquenessScore(
    set1: QuestionCandidate[],
    set2: QuestionCandidate[]
): number {
    const ids1 = new Set(set1.map(q => q.id));
    const ids2 = new Set(set2.map(q => q.id));

    let different = 0;
    for (const id of ids1) {
        if (!ids2.has(id)) different++;
    }
    for (const id of ids2) {
        if (!ids1.has(id)) different++;
    }

    const total = ids1.size + ids2.size;
    return total > 0 ? (different / total) * 100 : 0;
}

export const MIXED_PRACTICE_GAMES = [
    {
        id: "word-bank",
        titleEn: "Matching Sign",
        titleKm: "Matching Sign",
        descEn: "Drag each word onto its matching road sign.",
        descKm: "អូសពាក្យនីមួយៗ ទៅដាក់លើសញ្ញាចរាចរណ៍ដែលត្រូវគ្នា។",
    },
    {
        id: "sign-connect",
        titleEn: "KIDS Connect the Signs",
        titleKm: "កុមារ Connect the Signs",
        descEn: "Tap a sign, then tap its meaning to connect them.",
        descKm: "ប៉ះសញ្ញា រួចប៉ះអត្ថន័យរបស់វា ដើម្បីភ្ជាប់គ្នា។",
    },
    {
        id: "catch-sign",
        titleEn: "Catch the Sign",
        titleKm: "Catch the Sign",
        descEn: "Tap the correct road sign as fast as you can.",
        descKm: "ប៉ះសញ្ញាចរាចរណ៍ឱ្យបានត្រឹមត្រូវ និងលឿន។",
    },
    {
        id: "tick-sign",
        titleEn: "OFFICIAL Click the Sign",
        titleKm: "ផ្លូវការ Click the Sign",
        descEn: "Click the correct road sign for each name.",
        descKm: "ចុចសញ្ញាចរាចរណ៍ឱ្យត្រូវនឹងឈ្មោះនីមួយៗ។",
    },
    {
        id: "safety-adventure",
        titleEn: "Road Safety",
        titleKm: "Road Safety",
        descEn: "Make the safe choices on your journey to school.",
        descKm: "ធ្វើការសម្រេចចិត្តប្រកបដោយសុវត្ថិភាពក្នុងដំណើរទៅសាលា។",
    },
    {
        id: "safe-street-smart",
        titleEn: "Safe Street Smart",
        titleKm: "Safe Street Smart",
        descEn: "Choose the correct answer about road safety rules.",
        descKm: "ជ្រើសរើសចម្លើយត្រឹមត្រូវអំពីច្បាប់សុវត្ថិភាពចរាចរណ៍។",
    },
];

export function adaptQuestionsForMixedPractice<
    T extends { id: number; questionEn: string; questionKm: string }
>(questionsList: T[], seedSource: string): T[] {
    if (questionsList.length === 0) return questionsList;

    const seed = hashSeed(seedSource);
    const rand = mulberry32(seed);

    const numToModify = questionsList.length <= 10 ? 1 : 2;

    // Generate a list of indices and shuffle them deterministically
    const indices = Array.from({ length: questionsList.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const targetIndices = new Set(indices.slice(0, numToModify));

    return questionsList.map((q, idx) => {
        if (targetIndices.has(idx)) {
            // Pick a game mode deterministically
            const gameIdx = Math.floor(rand() * MIXED_PRACTICE_GAMES.length);
            const game = MIXED_PRACTICE_GAMES[gameIdx];

            const prefixEn = `${game.titleEn}\n${game.descEn}\n\n`;
            const prefixKm = `${game.titleKm}\n${game.descKm}\n\n`;

            return {
                ...q,
                questionEn: q.questionEn.startsWith(game.titleEn)
                    ? q.questionEn
                    : prefixEn + q.questionEn,
                questionKm: q.questionKm.startsWith(game.titleKm)
                    ? q.questionKm
                    : prefixKm + q.questionKm,
            };
        }
        return q;
    });
}
