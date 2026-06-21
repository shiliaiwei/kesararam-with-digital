import { describe, it, expect } from "vitest";
import {
    selectRandomQuestions,
    selectBalancedQuestions,
    areQuestionSetsDifferent,
    calculateUniquenessScore,
    adaptQuestionsForMixedPractice,
} from "@/lib/question-selector";

// Mock question data
const createMockQuestions = (count: number, categoryId: number = 1) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1 + (categoryId * 1000),
        categoryId,
        difficulty: ["easy", "medium", "hard"][i % 3] as string,
        questionEn: `Question ${i + 1}`,
        questionKm: `សំណួរ ${i + 1}`,
    }));
};

describe("Question Selector", () => {
    describe("selectRandomQuestions", () => {
        it("should return requested number of questions", () => {
            const questions = createMockQuestions(50);
            const selected = selectRandomQuestions({
                questions,
                questionCount: 10,
                categoryIds: [1],
            });

            expect(selected).toHaveLength(10);
        });

        it("should return all questions if count exceeds available", () => {
            const questions = createMockQuestions(5);
            const selected = selectRandomQuestions({
                questions,
                questionCount: 10,
                categoryIds: [1],
            });

            expect(selected).toHaveLength(5);
        });

        it("should return different questions on multiple calls", () => {
            const questions = createMockQuestions(100);

            const set1 = selectRandomQuestions({
                questions,
                questionCount: 20,
                categoryIds: [1],
                sessionTime: Date.now(),
            });

            // Wait a bit to ensure different timestamp
            const set2 = selectRandomQuestions({
                questions,
                questionCount: 20,
                categoryIds: [1],
                sessionTime: Date.now() + 1000,
            });

            expect(areQuestionSetsDifferent(set1, set2)).toBe(true);
        });

        it("should distribute questions across multiple categories", () => {
            const cat1Questions = createMockQuestions(30, 1);
            const cat2Questions = createMockQuestions(30, 2);
            const cat3Questions = createMockQuestions(30, 3);
            const allQuestions = [...cat1Questions, ...cat2Questions, ...cat3Questions];

            const selected = selectRandomQuestions({
                questions: allQuestions,
                questionCount: 30,
                categoryIds: [1, 2, 3],
            });

            // Count questions from each category
            const cat1Count = selected.filter(q => q.categoryId === 1).length;
            const cat2Count = selected.filter(q => q.categoryId === 2).length;
            const cat3Count = selected.filter(q => q.categoryId === 3).length;

            // Each category should have roughly equal representation (±3)
            expect(cat1Count).toBeGreaterThan(7);
            expect(cat1Count).toBeLessThan(13);
            expect(cat2Count).toBeGreaterThan(7);
            expect(cat2Count).toBeLessThan(13);
            expect(cat3Count).toBeGreaterThan(7);
            expect(cat3Count).toBeLessThan(13);
        });

        it("should generate different questions for different users", () => {
            const questions = createMockQuestions(100);

            const user1Set = selectRandomQuestions({
                questions,
                questionCount: 20,
                categoryIds: [1],
                userId: 1,
                sessionTime: Date.now(),
            });

            const user2Set = selectRandomQuestions({
                questions,
                questionCount: 20,
                categoryIds: [1],
                userId: 2,
                sessionTime: Date.now(),
            });

            expect(areQuestionSetsDifferent(user1Set, user2Set)).toBe(true);
        });

        it("should handle empty question array", () => {
            const selected = selectRandomQuestions({
                questions: [],
                questionCount: 10,
                categoryIds: [1],
            });

            expect(selected).toHaveLength(0);
        });

        it("should not contain duplicate questions", () => {
            const questions = createMockQuestions(50);
            const selected = selectRandomQuestions({
                questions,
                questionCount: 20,
                categoryIds: [1],
            });

            const ids = selected.map(q => q.id);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        });

        it("should select 40% sign, 5% priority, and 55% other questions in mixed-practice mode", () => {
            const signQuestions = Array.from({ length: 30 }, (_, i) => ({
                id: i + 1,
                categoryId: 1,
                categorySlug: "road-signs",
                gameType: "image_pick",
                difficulty: "medium",
                questionEn: `Sign Question ${i + 1}`,
                questionKm: `សំណួរសញ្ញា ${i + 1}`,
            }));
            const cat2Questions = Array.from({ length: 15 }, (_, i) => ({
                id: i + 100,
                categoryId: 2,
                categorySlug: "road-traffic",
                gameType: "mcq",
                difficulty: "medium",
                questionEn: `Traffic Question ${i + 1}`,
                questionKm: `សំណួរចរាចរណ៍ ${i + 1}`,
            }));
            const cat3Questions = Array.from({ length: 15 }, (_, i) => ({
                id: i + 200,
                categoryId: 3,
                categorySlug: "priority",
                gameType: "mcq",
                difficulty: "medium",
                questionEn: `Priority Question ${i + 1}`,
                questionKm: `សំណួរអាទិភាព ${i + 1}`,
            }));
            const cat4Questions = Array.from({ length: 15 }, (_, i) => ({
                id: i + 300,
                categoryId: 4,
                categorySlug: "general-knowledge",
                gameType: "mcq",
                difficulty: "medium",
                questionEn: `General Question ${i + 1}`,
                questionKm: `សំណួរទូទៅ ${i + 1}`,
            }));

            const allQuestions = [...signQuestions, ...cat2Questions, ...cat3Questions, ...cat4Questions];

            const selected = selectRandomQuestions({
                questions: allQuestions,
                questionCount: 10,
                categoryIds: [1, 2, 3, 4],
                gameMode: "mixed-practice",
            });

            expect(selected).toHaveLength(10);

            // 40% of 10 should be sign questions (4)
            const signCount = selected.filter(
                q => q.categorySlug === "road-signs" || q.categorySlug === "road-sign"
            ).length;
            expect(signCount).toBe(4);

            // 5% of 10 should be priority questions (1, rounded/forced to at least 1)
            const priorityCount = selected.filter(
                q => q.categorySlug === "priority"
            ).length;
            expect(priorityCount).toBe(1);

            // 55% should be other categories (5)
            const otherCount = selected.filter(
                q => q.categorySlug !== "road-signs" && q.categorySlug !== "road-sign" && q.categorySlug !== "priority"
            ).length;
            expect(otherCount).toBe(5);
        });

        it("should adapt questions for mixed practice with game names and descriptions", () => {
            const sampleQs = Array.from({ length: 12 }, (_, i) => ({
                id: i + 1,
                questionEn: `Question ${i + 1}`,
                questionKm: `សំណួរ ${i + 1}`,
            }));

            const adapted = adaptQuestionsForMixedPractice(sampleQs, "TEST_SESSION");

            expect(adapted).toHaveLength(12);

            // Since length is 12 (> 10), it should adapt exactly 2 questions.
            const adaptedCount = adapted.filter(
                q => q.questionEn.includes("\n")
            ).length;
            expect(adaptedCount).toBe(2);

            // Check that game titles and descriptions are prepended
            const adaptedQs = adapted.filter(q => q.questionEn.includes("\n"));
            for (const q of adaptedQs) {
                // Must have prefix format: titleEn\ndescEn\n\noriginal
                const partsEn = q.questionEn.split("\n");
                expect(partsEn.length).toBeGreaterThanOrEqual(4);
                expect(partsEn[2]).toBe(""); // Double newline separates prefix
                
                const partsKm = q.questionKm.split("\n");
                expect(partsKm.length).toBeGreaterThanOrEqual(4);
                expect(partsKm[2]).toBe("");
            }
        });
    });

    describe("selectBalancedQuestions", () => {
        it("should balance questions across difficulty levels", () => {
            // Create 100 questions with even distribution
            const questions = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                categoryId: 1,
                difficulty: ["easy", "medium", "hard"][i % 3] as string,
                questionEn: `Question ${i + 1}`,
                questionKm: `សំណួរ ${i + 1}`,
            }));

            const selected = selectBalancedQuestions(questions, 20, [1]);

            const easyCount = selected.filter(q => q.difficulty === "easy").length;
            const mediumCount = selected.filter(q => q.difficulty === "medium").length;
            const hardCount = selected.filter(q => q.difficulty === "hard").length;

            // Expected distribution: 40% easy (8), 40% medium (8), 20% hard (4)
            // Allow ±2 variance
            expect(easyCount).toBeGreaterThanOrEqual(6);
            expect(easyCount).toBeLessThanOrEqual(10);
            expect(mediumCount).toBeGreaterThanOrEqual(6);
            expect(mediumCount).toBeLessThanOrEqual(10);
            expect(hardCount).toBeGreaterThanOrEqual(2);
            expect(hardCount).toBeLessThanOrEqual(6);
        });

        it("should handle insufficient questions in some difficulty levels", () => {
            const questions = [
                ...createMockQuestions(5).map(q => ({ ...q, difficulty: "easy" })),
                ...createMockQuestions(5).map(q => ({ ...q, difficulty: "medium" })),
                // No hard questions
            ];

            const selected = selectBalancedQuestions(questions, 10, [1]);

            expect(selected.length).toBeLessThanOrEqual(10);
        });
    });

    describe("areQuestionSetsDifferent", () => {
        it("should return true for different sets", () => {
            const set1 = createMockQuestions(10, 1);
            const set2 = createMockQuestions(10, 2);

            expect(areQuestionSetsDifferent(set1, set2)).toBe(true);
        });

        it("should return false for identical sets", () => {
            const set1 = createMockQuestions(10);
            const set2 = [...set1];

            expect(areQuestionSetsDifferent(set1, set2)).toBe(false);
        });

        it("should return true for different lengths", () => {
            const set1 = createMockQuestions(10);
            const set2 = createMockQuestions(5);

            expect(areQuestionSetsDifferent(set1, set2)).toBe(true);
        });
    });

    describe("calculateUniquenessScore", () => {
        it("should return 100% for completely different sets", () => {
            const set1 = createMockQuestions(10, 1);
            const set2 = createMockQuestions(10, 2);

            const score = calculateUniquenessScore(set1, set2);

            expect(score).toBe(100);
        });

        it("should return 0% for identical sets", () => {
            const set1 = createMockQuestions(10);
            const set2 = [...set1];

            const score = calculateUniquenessScore(set1, set2);

            expect(score).toBe(0);
        });

        it("should return 50% for half-overlapping sets", () => {
            const questions = createMockQuestions(20);
            const set1 = questions.slice(0, 10);
            const set2 = [...questions.slice(5, 10), ...questions.slice(10, 15)];

            const score = calculateUniquenessScore(set1, set2);

            // 5 questions overlap, 10 are different (5 unique to set1, 5 unique to set2)
            // Score = (10 / 20) * 100 = 50%
            expect(score).toBe(50);
        });

        it("should handle empty sets", () => {
            const set1 = createMockQuestions(10);
            const set2: any[] = [];

            const score = calculateUniquenessScore(set1, set2);

            expect(score).toBe(100);
        });
    });

    describe("Randomness Quality", () => {
        it("should have high uniqueness across multiple sessions", () => {
            const questions = createMockQuestions(200);
            const sessions = [];

            // Generate 10 different sessions
            for (let i = 0; i < 10; i++) {
                const selected = selectRandomQuestions({
                    questions,
                    questionCount: 20,
                    categoryIds: [1],
                    sessionTime: Date.now() + i * 1000,
                });
                sessions.push(selected);
            }

            // Calculate average uniqueness between all pairs
            let totalUniqueness = 0;
            let comparisons = 0;

            for (let i = 0; i < sessions.length; i++) {
                for (let j = i + 1; j < sessions.length; j++) {
                    totalUniqueness += calculateUniquenessScore(sessions[i], sessions[j]);
                    comparisons++;
                }
            }

            const avgUniqueness = totalUniqueness / comparisons;

            // Average uniqueness should be > 70% (high randomness)
            expect(avgUniqueness).toBeGreaterThan(70);
        });

        it("should not show predictable patterns", () => {
            const questions = createMockQuestions(100);
            const firstIds: number[] = [];

            // Generate 20 sessions and collect first question ID
            for (let i = 0; i < 20; i++) {
                const selected = selectRandomQuestions({
                    questions,
                    questionCount: 10,
                    categoryIds: [1],
                    sessionTime: Date.now() + i * 100,
                });
                firstIds.push(selected[0].id);
            }

            // Check that first IDs are well distributed (no pattern)
            const uniqueFirstIds = new Set(firstIds);

            // Should have at least 15 different first questions out of 20 sessions
            expect(uniqueFirstIds.size).toBeGreaterThan(15);
        });
    });

    describe("Performance", () => {
        it("should handle large question pools efficiently", () => {
            const questions = createMockQuestions(10000);

            const startTime = Date.now();
            const selected = selectRandomQuestions({
                questions,
                questionCount: 50,
                categoryIds: [1],
            });
            const endTime = Date.now();

            expect(selected).toHaveLength(50);
            expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
        });

        it("should handle multiple categories efficiently", () => {
            const questions = [
                ...createMockQuestions(1000, 1),
                ...createMockQuestions(1000, 2),
                ...createMockQuestions(1000, 3),
                ...createMockQuestions(1000, 4),
                ...createMockQuestions(1000, 5),
            ];

            const startTime = Date.now();
            const selected = selectRandomQuestions({
                questions,
                questionCount: 100,
                categoryIds: [1, 2, 3, 4, 5],
            });
            const endTime = Date.now();

            expect(selected).toHaveLength(100);
            expect(endTime - startTime).toBeLessThan(150); // Should complete in < 150ms
        });
    });
});
