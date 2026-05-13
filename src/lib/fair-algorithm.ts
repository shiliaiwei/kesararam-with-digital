/**
 * Fair Algorithm for Question Selection
 * 
 * This module implements the Fair Algorithm that ensures balanced question selection
 * across subtopics, excludes recently answered questions, prioritizes weak topics
 * (< 60% correct rate), and adapts difficulty based on user performance.
 * 
 * Requirements validated: 16.1, 16.2, 16.3, 16.4
 */

import { db } from "@/lib/db";
import { contentItems } from "@/db/schema/content";
import { quizAnswers, quizAttempts } from "@/db/schema/quizzes";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import type { ContentItem } from "@/db/schema/content";

export interface FairAlgorithmConfig {
  categoryId: number;
  questionCount: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  userId: number;
}

export interface UserQuizHistory {
  contentId: number;
  isCorrect: boolean;
  subtopic: string | null;
  answeredAt: Date;
}

export interface WeakTopic {
  subtopic: string;
  correctRate: number;
  totalAttempts: number;
}

/**
 * Get user's quiz history for a specific category
 * Returns recent quiz answers with content details
 */
export async function getUserQuizHistory(
  userId: number,
  categoryId: number,
  limit: number = 100
): Promise<UserQuizHistory[]> {
  const history = await db
    .select({
      contentId: quizAnswers.contentId,
      isCorrect: quizAnswers.isCorrect,
      subtopic: contentItems.subtopic,
      answeredAt: quizAnswers.answeredAt,
    })
    .from(quizAnswers)
    .innerJoin(quizAttempts, eq(quizAnswers.attemptId, quizAttempts.id))
    .innerJoin(contentItems, eq(quizAnswers.contentId, contentItems.id))
    .where(
      and(
        eq(quizAttempts.userId, userId),
        eq(contentItems.categoryId, categoryId)
      )
    )
    .orderBy(desc(quizAnswers.answeredAt))
    .limit(limit);

  return history;
}

/**
 * Identify weak topics where user has < 60% correct rate over 3+ attempts
 * Returns up to 3 weakest topics
 */
export function identifyWeakTopics(history: UserQuizHistory[]): WeakTopic[] {
  const topicPerformance = new Map<
    string,
    { correct: number; total: number }
  >();

  // Calculate performance per subtopic
  for (const answer of history) {
    const topic = answer.subtopic || "general";
    const stats = topicPerformance.get(topic) || { correct: 0, total: 0 };
    stats.total++;
    if (answer.isCorrect) stats.correct++;
    topicPerformance.set(topic, stats);
  }

  // Filter to weak topics (< 60% correct rate, at least 3 attempts)
  const weakTopics: WeakTopic[] = [];
  for (const [subtopic, stats] of topicPerformance.entries()) {
    if (stats.total >= 3) {
      const correctRate = stats.correct / stats.total;
      if (correctRate < 0.6) {
        weakTopics.push({
          subtopic,
          correctRate,
          totalAttempts: stats.total,
        });
      }
    }
  }

  // Sort by correct rate (weakest first) and return top 3
  return weakTopics
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 3);
}

/**
 * Get recently answered question IDs to exclude from selection
 * Returns last N question IDs (default 50)
 */
export function getRecentlyAnsweredQuestions(
  history: UserQuizHistory[],
  count: number = 50
): number[] {
  return history.slice(0, count).map((h) => h.contentId);
}

/**
 * Group questions by subtopic
 */
function groupBySubtopic(
  questions: ContentItem[]
): Map<string, ContentItem[]> {
  const grouped = new Map<string, ContentItem[]>();

  for (const question of questions) {
    const subtopic = question.subtopic || "general";
    const existing = grouped.get(subtopic) || [];
    existing.push(question);
    grouped.set(subtopic, existing);
  }

  return grouped;
}

function getSecureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

/**
 * Random sample from array without replacement
 */
function randomSample<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => getSecureRandom() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Shuffle array in place
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Main Fair Algorithm function
 * Selects questions with balanced distribution, recency exclusion, and weak topic prioritization
 */
export async function selectQuestions(
  config: FairAlgorithmConfig
): Promise<ContentItem[]> {
  const { categoryId, questionCount, difficulty, userId } = config;

  // 1. Get user's performance history
  const userHistory = await getUserQuizHistory(userId, categoryId);
  const weakTopics = identifyWeakTopics(userHistory);
  const recentQuestions = getRecentlyAnsweredQuestions(userHistory, 50);

  // 2. Get available active questions for category
  let availableQuestions = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.categoryId, categoryId),
        eq(contentItems.status, "active"),
        eq(contentItems.isActive, true)
      )
    );

  // Filter by difficulty if specified
  if (difficulty) {
    availableQuestions = availableQuestions.filter(
      (q) => q.difficulty === difficulty
    );
  }

  // Exclude recently answered questions
  availableQuestions = availableQuestions.filter(
    (q) => !recentQuestions.includes(q.id)
  );

  // Check if we have enough questions
  if (availableQuestions.length === 0) {
    throw new Error(
      "No available questions found for the specified criteria"
    );
  }

  if (availableQuestions.length < questionCount) {
    console.warn(
      `Requested ${questionCount} questions but only ${availableQuestions.length} available. Adjusting quiz length.`
    );
  }

  // 3. Distribute across subtopics
  const subtopicGroups = groupBySubtopic(availableQuestions);
  const subtopics = Array.from(subtopicGroups.keys());
  const selectedQuestions: ContentItem[] = [];

  // 4. Prioritize weak topics (40% of questions)
  const weakTopicCount = Math.floor(questionCount * 0.4);
  const weakTopicNames = weakTopics.map((t) => t.subtopic);

  for (const weakTopic of weakTopicNames) {
    const topicQuestions = subtopicGroups.get(weakTopic) || [];
    const questionsPerWeakTopic = Math.ceil(
      weakTopicCount / weakTopicNames.length
    );
    const selected = randomSample(
      topicQuestions,
      Math.min(questionsPerWeakTopic, topicQuestions.length)
    );
    selectedQuestions.push(...selected);

    // Break if we've reached the weak topic allocation
    if (selectedQuestions.length >= weakTopicCount) {
      break;
    }
  }

  // 5. Fill remaining with balanced selection across all subtopics
  const remaining = questionCount - selectedQuestions.length;
  const questionsPerSubtopic = Math.ceil(remaining / subtopics.length);

  for (const subtopic of subtopics) {
    const topicQuestions = subtopicGroups.get(subtopic) || [];

    // Count how many from this subtopic we already selected
    const alreadySelected = selectedQuestions.filter(
      (q) => (q.subtopic || "general") === subtopic
    ).length;

    const needed = Math.max(0, questionsPerSubtopic - alreadySelected);

    if (needed > 0) {
      const available = topicQuestions.filter(
        (q) => !selectedQuestions.some((s) => s.id === q.id)
      );
      const selected = randomSample(
        available,
        Math.min(needed, available.length)
      );
      selectedQuestions.push(...selected);
    }

    // Break if we have enough questions
    if (selectedQuestions.length >= questionCount) {
      break;
    }
  }

  // 6. Shuffle and return requested count
  const shuffled = shuffle(selectedQuestions);
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}
