/**
 * In-process SSE event bus.
 * Maps sessionCode → Set of active stream controllers.
 */

export type SSEEvent =
  | { type: "lobby_update"; participants: ParticipantInfo[] }
  | { type: "question_start"; question: QuestionPayload; startsAt: string; endsAt: string; index: number; total: number }
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
  gameType: "mcq" | "true_false" | "image_pick";
  answers: AnswerOption[];
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
  for (const ctrl of controllers) {
    try {
      ctrl.enqueue(data);
    } catch {
      // client disconnected — will be cleaned up on close
    }
  }
}

export function subscriberCount(code: string): number {
  return bus.get(code)?.size ?? 0;
}
