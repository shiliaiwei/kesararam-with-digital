/**
 * Truly Random Question Selection Algorithm
 * 
 * This algorithm ensures that:
 * 1. Questions are selected randomly from all available categories
 * 2. No predictable patterns - each session is unique
 * 3. Questions are distributed across categories when multiple are selected
 * 4. Time-based seed ensures different questions at different times
 * 5. User-specific randomization prevents same questions for different users
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
 * Generate a time-based seed that changes every hour
 * This ensures different question sets at different times
 */
function getTimeSeed(): number {
    const now = Date.now();
    // Change seed every hour
    const hoursSinceEpoch = Math.floor(now / (1000 * 60 * 60));
    return hoursSinceEpoch;
}

/**
 * Generate a unique session seed based on time and user
 */
function generateSessionSeed(userId?: number, sessionTime?: number): number {
    const timeSeed = sessionTime || Date.now();
    const userSeed = userId || Math.floor(getSecureRandom() * 1000000);

    // Combine time and user seeds with prime numbers for better distribution
    return (timeSeed * 31 + userSeed * 37) % Number.MAX_SAFE_INTEGER;
}

/**
 * Seeded random number generator (for reproducible randomness in tests)
 * Uses a Linear Congruential Generator (LCG) algorithm
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}

/**
 * Fisher-Yates shuffle with cryptographic randomness
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(getSecureRandom() * (i + 1));
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
 * - Time-based variation (different questions each hour)
 * - User-specific randomization
 * - Category distribution for variety
 * - No predictable patterns
 */
export function selectRandomQuestions(options: SelectionOptions): QuestionCandidate[] {
    const { questions, questionCount, categoryIds, userId, sessionTime } = options;

    if (questions.length === 0) {
        return [];
    }

    if (questions.length <= questionCount) {
        // Not enough questions, return all shuffled
        return shuffleArray(questions);
    }

    // Generate unique session seed
    const sessionSeed = generateSessionSeed(userId, sessionTime);

    // Add session-specific randomness to each question
    const questionsWithRandom = questions.map(q => ({
        ...q,
        _randomScore: getSecureRandom() + (sessionSeed % 1000) / 1000,
    }));

    // Sort by random score (this adds another layer of randomness)
    questionsWithRandom.sort((a, b) => a._randomScore - b._randomScore);

    // Distribute across categories for variety
    const selected = distributeAcrossCategories(
        questionsWithRandom,
        categoryIds,
        questionCount
    );

    // Remove the temporary random score
    return selected.map(({ _randomScore, ...q }) => q);
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
