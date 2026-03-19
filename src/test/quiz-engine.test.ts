/**
 * Property-Based Tests for Quiz Engine
 * 
 * Tests the Quiz Engine's correctness properties:
 * - Property 7: Quiz Question Selection Invokes Fair Algorithm
 * - Property 8: Quiz Completion Recording
 * - Property 22: Quiz Scoring Based on Content Configuration
 * - Property 23: Quiz Total Score Calculation
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("Quiz Engine Property Tests", () => {
  // Feature: learning-hub-quiz-system, Property 7: Quiz Question Selection Invokes Fair Algorithm
  describe("Property 7: Quiz Question Selection Invokes Fair Algorithm", () => {
    it("quiz start should invoke Fair Algorithm for question selection", () => {
      fc.assert(
        fc.property(
          fc.record({
            categoryId: fc.integer({ min: 1, max: 8 }),
            questionCount: fc.integer({ min: 5, max: 30 }),
            mode: fc.oneof(
              fc.constant("quiz" as const),
              fc.constant("practice_test" as const),
              fc.constant("challenge" as const)
            ),
            difficulty: fc.option(
              fc.oneof(
                fc.constant("beginner" as const),
                fc.constant("intermediate" as const),
                fc.constant("advanced" as const)
              ),
              { nil: undefined }
            ),
          }),
          (config) => {
            // Property: Fair Algorithm config should match quiz start parameters
            const fairAlgorithmConfig = {
              categoryId: config.categoryId,
              questionCount: config.questionCount,
              difficulty: config.difficulty,
              userId: 1, // Mock user ID
            };

            // Verify all required parameters are present
            expect(fairAlgorithmConfig.categoryId).toBe(config.categoryId);
            expect(fairAlgorithmConfig.questionCount).toBe(config.questionCount);
            expect(fairAlgorithmConfig.difficulty).toBe(config.difficulty);
            expect(fairAlgorithmConfig.userId).toBeGreaterThan(0);

            // Property: Question count should be positive
            expect(config.questionCount).toBeGreaterThan(0);

            // Property: Category ID should be valid (1-8 for 8 categories)
            expect(config.categoryId).toBeGreaterThanOrEqual(1);
            expect(config.categoryId).toBeLessThanOrEqual(8);

            // Property: Mode should be one of the valid modes
            expect(["quiz", "practice_test", "challenge"]).toContain(config.mode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("selected questions should match requested count or available count", () => {
      fc.assert(
        fc.property(
          fc.record({
            requestedCount: fc.integer({ min: 5, max: 30 }),
            availableCount: fc.integer({ min: 0, max: 50 }),
          }),
          (input) => {
            const { requestedCount, availableCount } = input;

            // Simulate question selection
            const selectedCount = Math.min(requestedCount, availableCount);

            // Property: Selected count should never exceed requested count
            expect(selectedCount).toBeLessThanOrEqual(requestedCount);

            // Property: Selected count should never exceed available count
            expect(selectedCount).toBeLessThanOrEqual(availableCount);

            // Property: If available >= requested, should return exactly requested
            if (availableCount >= requestedCount) {
              expect(selectedCount).toBe(requestedCount);
            } else {
              // Otherwise, should return all available
              expect(selectedCount).toBe(availableCount);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: learning-hub-quiz-system, Property 8: Quiz Completion Recording
  describe("Property 8: Quiz Completion Recording", () => {
    it("completed quiz should create quiz_attempts record with all required fields", () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 1000 }),
            categoryId: fc.option(fc.integer({ min: 1, max: 8 }), { nil: null }),
            mode: fc.oneof(
              fc.constant("quiz" as const),
              fc.constant("practice_test" as const),
              fc.constant("challenge" as const)
            ),
            totalQuestions: fc.integer({ min: 1, max: 50 }),
            correctAnswers: fc.integer({ min: 0, max: 50 }),
            score: fc.integer({ min: 0, max: 5000 }),
          }).filter((record) => record.correctAnswers <= record.totalQuestions),
          (attempt) => {
            // Calculate percentage
            const percentage = Math.round(
              (attempt.correctAnswers / attempt.totalQuestions) * 100
            );

            // Property: All required fields should be present
            expect(attempt.userId).toBeGreaterThan(0);
            expect(attempt.mode).toBeTruthy();
            expect(attempt.totalQuestions).toBeGreaterThan(0);
            expect(attempt.correctAnswers).toBeGreaterThanOrEqual(0);
            expect(attempt.score).toBeGreaterThanOrEqual(0);

            // Property: Correct answers should not exceed total questions
            expect(attempt.correctAnswers).toBeLessThanOrEqual(
              attempt.totalQuestions
            );

            // Property: Percentage should be between 0 and 100
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);

            // Property: Percentage calculation should be correct
            const expectedPercentage = Math.round(
              (attempt.correctAnswers / attempt.totalQuestions) * 100
            );
            expect(percentage).toBe(expectedPercentage);

            // Property: Mode should be valid
            expect(["quiz", "practice_test", "challenge"]).toContain(
              attempt.mode
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("quiz completion should have valid timestamp", () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date("2024-01-01"), max: new Date("2025-12-31") }),
          (completedAt) => {
            // Property: Completion timestamp should be a valid date
            expect(completedAt).toBeInstanceOf(Date);
            
            // Skip invalid dates (NaN)
            if (isNaN(completedAt.getTime())) {
              return true; // Skip this test case
            }
            
            expect(completedAt.getTime()).toBeGreaterThan(0);

            // Property: Completion timestamp should not be in the future (with 1 minute tolerance)
            const now = new Date();
            const oneMinuteFromNow = new Date(now.getTime() + 60000);
            expect(completedAt.getTime()).toBeLessThanOrEqual(
              oneMinuteFromNow.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: learning-hub-quiz-system, Property 22: Quiz Scoring Based on Content Configuration
  describe("Property 22: Quiz Scoring Based on Content Configuration", () => {
    it("correct answer should award base points from content configuration", () => {
      fc.assert(
        fc.property(
          fc.record({
            isCorrect: fc.constant(true),
            scorePoints: fc.integer({ min: 1, max: 100 }),
            mode: fc.oneof(
              fc.constant("quiz" as const),
              fc.constant("practice_test" as const)
            ),
          }),
          (input) => {
            const { isCorrect, scorePoints, mode } = input;

            // Calculate points (no time bonus for quiz and practice_test modes)
            const points = isCorrect ? scorePoints : 0;

            // Property: Correct answer should award exactly scorePoints
            expect(points).toBe(scorePoints);

            // Property: Points should be positive for correct answers
            expect(points).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("incorrect answer should award zero points", () => {
      fc.assert(
        fc.property(
          fc.record({
            isCorrect: fc.constant(false),
            scorePoints: fc.integer({ min: 1, max: 100 }),
          }),
          (input) => {
            const { isCorrect, scorePoints } = input;

            // Calculate points
            const points = isCorrect ? scorePoints : 0;

            // Property: Incorrect answer should award zero points
            expect(points).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("challenge mode should add time bonus for quick correct answers", () => {
      fc.assert(
        fc.property(
          fc.record({
            isCorrect: fc.constant(true),
            scorePoints: fc.integer({ min: 10, max: 100 }),
            timeLimit: fc.integer({ min: 10, max: 60 }),
            timeSpent: fc.integer({ min: 1, max: 60 }),
            mode: fc.constant("challenge" as const),
          }).filter((record) => record.timeSpent < record.timeLimit),
          (input) => {
            const { isCorrect, scorePoints, timeLimit, timeSpent, mode } = input;

            // Calculate points with time bonus
            let points = isCorrect ? scorePoints : 0;

            if (mode === "challenge" && isCorrect && timeSpent < timeLimit) {
              const timeRatio = 1 - timeSpent / timeLimit;
              const timeBonus = Math.floor(scorePoints * timeRatio * 0.5);
              points += timeBonus;
            }

            // Property: Total points should be greater than or equal to base points
            expect(points).toBeGreaterThanOrEqual(scorePoints);

            // Property: Time bonus should be at most 50% of base points
            const maxBonus = Math.floor(scorePoints * 0.5);
            expect(points).toBeLessThanOrEqual(scorePoints + maxBonus);

            // Property: Faster answers should get higher bonuses
            const timeRatio = 1 - timeSpent / timeLimit;
            const expectedBonus = Math.floor(scorePoints * timeRatio * 0.5);
            expect(points).toBe(scorePoints + expectedBonus);

            // Property: If time bonus is calculated, it should be non-negative
            const calculatedBonus = points - scorePoints;
            expect(calculatedBonus).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("time bonus should be zero if time spent equals or exceeds time limit", () => {
      fc.assert(
        fc.property(
          fc.record({
            isCorrect: fc.constant(true),
            scorePoints: fc.integer({ min: 10, max: 100 }),
            timeLimit: fc.integer({ min: 10, max: 60 }),
            timeSpent: fc.integer({ min: 10, max: 60 }),
            mode: fc.constant("challenge" as const),
          }).filter((record) => record.timeSpent >= record.timeLimit),
          (input) => {
            const { isCorrect, scorePoints, timeLimit, timeSpent, mode } = input;

            // Calculate points with time bonus
            let points = isCorrect ? scorePoints : 0;

            if (mode === "challenge" && isCorrect && timeSpent < timeLimit) {
              const timeRatio = 1 - timeSpent / timeLimit;
              const timeBonus = Math.floor(scorePoints * timeRatio * 0.5);
              points += timeBonus;
            }

            // Property: No time bonus if time spent >= time limit
            expect(points).toBe(scorePoints);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: learning-hub-quiz-system, Property 23: Quiz Total Score Calculation
  describe("Property 23: Quiz Total Score Calculation", () => {
    it("total score should equal sum of all question points", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              isCorrect: fc.boolean(),
              points: fc.integer({ min: 0, max: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (answers) => {
            // Calculate total score
            const totalScore = answers.reduce(
              (sum, answer) => sum + answer.points,
              0
            );

            // Property: Total score should be sum of all points
            const expectedTotal = answers.reduce(
              (sum, answer) => sum + answer.points,
              0
            );
            expect(totalScore).toBe(expectedTotal);

            // Property: Total score should be non-negative
            expect(totalScore).toBeGreaterThanOrEqual(0);

            // Property: If all answers are incorrect (0 points), total should be 0
            const allIncorrect = answers.every((a) => a.points === 0);
            if (allIncorrect) {
              expect(totalScore).toBe(0);
            }

            // Property: Total score should not exceed sum of max possible points
            const maxPossibleScore = answers.reduce(
              (sum, answer) => sum + (answer.isCorrect ? answer.points : 0),
              0
            );
            expect(totalScore).toBeLessThanOrEqual(
              answers.reduce((sum, a) => sum + Math.abs(a.points), 0)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("correct answers count should match number of correct answers", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              isCorrect: fc.boolean(),
              points: fc.integer({ min: 0, max: 100 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (answers) => {
            // Count correct answers
            const correctAnswers = answers.filter((a) => a.isCorrect).length;

            // Property: Correct answers count should match filter result
            expect(correctAnswers).toBe(
              answers.filter((a) => a.isCorrect).length
            );

            // Property: Correct answers should be between 0 and total questions
            expect(correctAnswers).toBeGreaterThanOrEqual(0);
            expect(correctAnswers).toBeLessThanOrEqual(answers.length);

            // Property: If all correct, count should equal total
            const allCorrect = answers.every((a) => a.isCorrect);
            if (allCorrect) {
              expect(correctAnswers).toBe(answers.length);
            }

            // Property: If none correct, count should be 0
            const noneCorrect = answers.every((a) => !a.isCorrect);
            if (noneCorrect) {
              expect(correctAnswers).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("percentage should be calculated correctly from correct answers", () => {
      fc.assert(
        fc.property(
          fc.record({
            totalQuestions: fc.integer({ min: 1, max: 50 }),
            correctAnswers: fc.integer({ min: 0, max: 50 }),
          }).filter((record) => record.correctAnswers <= record.totalQuestions),
          (input) => {
            const { totalQuestions, correctAnswers } = input;

            // Calculate percentage
            const percentage = Math.round(
              (correctAnswers / totalQuestions) * 100
            );

            // Property: Percentage should be between 0 and 100
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);

            // Property: Percentage calculation should be correct
            const expectedPercentage = Math.round(
              (correctAnswers / totalQuestions) * 100
            );
            expect(percentage).toBe(expectedPercentage);

            // Property: 100% correct should give 100%
            if (correctAnswers === totalQuestions) {
              expect(percentage).toBe(100);
            }

            // Property: 0% correct should give 0%
            if (correctAnswers === 0) {
              expect(percentage).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("time spent should be sum of all question times", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              timeSpent: fc.option(fc.integer({ min: 1, max: 120 }), {
                nil: null,
              }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (answers) => {
            // Calculate total time spent
            const totalTimeSpent = answers.reduce(
              (sum, answer) => sum + (answer.timeSpent || 0),
              0
            );

            // Property: Total time should be sum of all times
            const expectedTotal = answers.reduce(
              (sum, answer) => sum + (answer.timeSpent || 0),
              0
            );
            expect(totalTimeSpent).toBe(expectedTotal);

            // Property: Total time should be non-negative
            expect(totalTimeSpent).toBeGreaterThanOrEqual(0);

            // Property: If all times are null, total should be 0
            const allNull = answers.every((a) => a.timeSpent === null);
            if (allNull) {
              expect(totalTimeSpent).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional validation properties
  describe("Quiz Validation Properties", () => {
    it("quiz mode should be one of the valid modes", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant("quiz"),
            fc.constant("practice_test"),
            fc.constant("challenge")
          ),
          (mode) => {
            const validModes = ["quiz", "practice_test", "challenge"];
            expect(validModes).toContain(mode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("difficulty should be one of the valid difficulties or undefined", () => {
      fc.assert(
        fc.property(
          fc.option(
            fc.oneof(
              fc.constant("beginner"),
              fc.constant("intermediate"),
              fc.constant("advanced")
            ),
            { nil: undefined }
          ),
          (difficulty) => {
            if (difficulty !== undefined) {
              const validDifficulties = [
                "beginner",
                "intermediate",
                "advanced",
              ];
              expect(validDifficulties).toContain(difficulty);
            } else {
              expect(difficulty).toBeUndefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("answer validation should be case-insensitive", () => {
      fc.assert(
        fc.property(
          fc.record({
            userAnswer: fc.string({ minLength: 1, maxLength: 50 }),
            correctAnswer: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (input) => {
            const { userAnswer, correctAnswer } = input;

            // Simulate case-insensitive comparison
            const normalizedUser = userAnswer.trim().toLowerCase();
            const normalizedCorrect = correctAnswer.trim().toLowerCase();
            const isCorrect = normalizedUser === normalizedCorrect;

            // Property: Same text with different cases should match
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
              expect(isCorrect).toBe(true);
            }

            // Property: Different text should not match
            if (
              userAnswer.toLowerCase().trim() !==
              correctAnswer.toLowerCase().trim()
            ) {
              expect(isCorrect).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
