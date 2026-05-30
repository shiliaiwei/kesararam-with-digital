/**
 * In-process SSE event bus.
 * Maps sessionCode → Set of active stream controllers.
 *
 * Key fix: dead controllers are pruned immediately on enqueue failure
 * so stale connections never swallow future broadcast events.
 */

export type SSEEvent =
  | { type: "lobby_update"; participants: ParticipantInfo[] }
  | { type: "question_start"; question: QuestionPayload; startsAt: string; endsAt: string; index: number; total: number; catchUp?: boolean }
  | { type: "question_end"; correctAnswerId: number | null; leaderboard: LeaderboardEntry[] }
  | { type: "leaderboard"; entries: LeaderboardEntry[] }
  | { type: "session_paused" }
  | { type: "session_resumed" }
  | { type: "session_end"; podium: LeaderboardEntry[]; finalLeaderboard: LeaderboardEntry[] }
  | { type: "ping" }
  | { type: "warning"; message: string };

export interface ParticipantInfo {
  userId: number;
  displayName: string;
  avatar: string | null;
  totalScore: number;
  isConnected: boolean;
}

export interface QuestionPayload {
  id: number;
  questionEn: string;
  questionKm: string;
  imageUrl: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  difficulty: string | null;
  gameType: "mcq" | "true_false" | "image_pick";
  answers: AnswerOption[];
  topicCode?: string | null;
}

export interface AnswerOption {
  id: number;
  answerEn: string;
  answerKm: string;
  imageUrl: string | null;
}

export interface LeaderboardEntry {
  userId: number;
  displayName: string;
  avatar: string | null;
  totalScore: number;
  rank: number;
  rankChange: number;
  correctAnswers: number;
  currentStreak: number;
}

const bus = new Map<string, Set<ReadableStreamDefaultController>>();

export function subscribe(code: string, ctrl: ReadableStreamDefaultController) {
  if (!bus.has(code)) bus.set(code, new Set());
  bus.get(code)!.add(ctrl);
}

export function unsubscribe(code: string, ctrl: ReadableStreamDefaultController) {
  bus.get(code)?.delete(ctrl);
  if (bus.get(code)?.size === 0) bus.delete(code);
}

export function broadcast(code: string, event: SSEEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const controllers = bus.get(code);
  if (!controllers) return;

  const dead: ReadableStreamDefaultController[] = [];

  for (const ctrl of controllers) {
    try {
      ctrl.enqueue(data);
    } catch {
      // Controller is closed/errored — mark for removal
      dead.push(ctrl);
    }
  }

  // Prune dead controllers immediately so they never block future broadcasts
  for (const ctrl of dead) {
    controllers.delete(ctrl);
  }
  if (controllers.size === 0) {
    bus.delete(code);
  }
}

export function subscriberCount(code: string): number {
  return bus.get(code)?.size ?? 0;
}

export function getBusStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const [code, set] of bus.entries()) {
    stats[code] = set.size;
  }
  return stats;
}
