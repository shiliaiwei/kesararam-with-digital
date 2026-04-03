# Requirements Document

## Introduction

This feature adds a Kahoot-style live quiz game system to the KWD (Kesararam With Digital) driving theory learning app. Teachers host live game sessions from their dashboard; students join via a room code and compete in real time. The system supports multiple game types drawn from existing content (MCQ, True/False, image-based, word puzzle, memory match), a speed-based scoring engine, a live leaderboard, and post-game analytics. All UI and content is bilingual (English and Khmer). The feature builds on the existing `challenge_sessions`, `challenge_participants`, `questions`, `answers`, `categories`, and `leaderboard_entries` tables.

---

## Glossary

- **Game_Session**: A teacher-hosted live quiz game instance identified by a unique room code.
- **Game_Engine**: The server-side component that manages question sequencing, timers, scoring, and state transitions for a Game_Session.
- **Lobby**: The waiting room state of a Game_Session before the teacher starts the game.
- **Question_Round**: A single question presented to all participants simultaneously during a Game_Session.
- **Participant**: A student who has joined a Game_Session.
- **Host**: The teacher who created and controls a Game_Session.
- **Room_Code**: A short alphanumeric code used by students to join a Game_Session.
- **Speed_Score**: Points awarded per correct answer, calculated using base points and a time bonus that decreases as answer time increases.
- **Streak_Bonus**: Additional points awarded when a Participant answers multiple consecutive questions correctly.
- **Leaderboard**: A ranked list of Participants ordered by cumulative Speed_Score within a Game_Session.
- **Game_Type**: The interaction format of a Question_Round (MCQ, True/False, Image_Pick, Word_Puzzle, Memory_Match, Sort_Order).
- **Podium**: The end-of-session screen showing the top three Participants.
- **Solo_Practice**: A self-paced game mode where a single student plays without a Host.
- **Real_Time_Layer**: The WebSocket or SSE channel that pushes state updates from the Game_Engine to all connected clients.
- **Content_Item**: An approved question-answer record from the existing `questions` and `answers` tables.
- **Category**: One of the 8 driving theory categories (Traffic Signs, Road Traffic Law, Right of Way, Driving Skills, Vehicle Technology, Loading People & Goods, General Knowledge, Emergency).

---

## Requirements

### Requirement 1: Teacher Creates a Game Session

**User Story:** As a teacher, I want to create a new game session with a room code, so that my students can join and play together.

#### Acceptance Criteria

1. THE Game_Engine SHALL generate a unique 6-character alphanumeric Room_Code for each new Game_Session.
2. WHEN a teacher submits a session creation form, THE Game_Engine SHALL create a Game_Session record with status `lobby` and return the Room_Code within 2 seconds.
3. THE Host SHALL be able to configure the following session parameters before starting: session name, one or more Categories, difficulty level (easy / medium / hard / mixed), number of questions (5–40), time per question (10–60 seconds), scoring mode (speed-based or equal-points), and language (English / Khmer / both).
4. THE Game_Engine SHALL select questions from the approved Content_Items matching the chosen Categories and difficulty level.
5. IF fewer approved Content_Items exist than the requested question count, THEN THE Game_Engine SHALL use all available approved Content_Items and notify the Host of the reduced count.
6. THE Host SHALL be able to assign a Game_Type to the session (MCQ, True/False, Image_Pick, Word_Puzzle, Memory_Match, Sort_Order) or select "Mixed" to let the Game_Engine assign types per question.

---

### Requirement 2: Student Joins a Game Session

**User Story:** As a student, I want to join a live game session using a room code, so that I can compete with my classmates.

#### Acceptance Criteria

1. WHEN a student submits a valid Room_Code, THE Game_Engine SHALL add the student as a Participant in the Game_Session's Lobby within 1 second.
2. IF a student submits an invalid or expired Room_Code, THEN THE Game_Engine SHALL return a descriptive error message within 1 second.
3. WHILE a Game_Session status is `lobby`, THE Game_Engine SHALL broadcast each new Participant's display name and avatar to all connected clients in real time.
4. WHERE a Game_Session has `allow_late_join` enabled, THE Game_Engine SHALL allow students to join after the game has started, placing them at the bottom of the Leaderboard with a score of 0.
5. THE Game_Engine SHALL support up to 40 simultaneous Participants per Game_Session.
6. IF a Participant disconnects and reconnects within 30 seconds, THEN THE Game_Engine SHALL restore the Participant's score and current position in the Question_Round sequence.

---

### Requirement 3: Host Controls the Game Flow

**User Story:** As a teacher, I want to control when questions start and advance, so that I can pace the game to match my class.

#### Acceptance Criteria

1. WHEN the Host presses "Start Game", THE Game_Engine SHALL transition the Game_Session status from `lobby` to `active` and broadcast the first Question_Round to all Participants.
2. THE Host SHALL be able to manually advance to the next Question_Round at any time before the question timer expires.
3. WHEN the Host advances or the question timer expires, THE Game_Engine SHALL broadcast the correct answer and per-question Leaderboard update to all Participants within 500 milliseconds.
4. THE Host SHALL be able to pause the Game_Session, which SHALL cause THE Game_Engine to freeze all question timers and notify all Participants.
5. THE Host SHALL be able to end the Game_Session early, which SHALL cause THE Game_Engine to transition the session status to `ended` and display the Podium screen.
6. WHEN all Question_Rounds are completed, THE Game_Engine SHALL automatically transition the Game_Session status to `ended` and display the Podium screen.

---

### Requirement 4: Question Round Display

**User Story:** As a student, I want to see each question clearly with a countdown timer, so that I can answer before time runs out.

#### Acceptance Criteria

1. WHEN a Question_Round begins, THE Game_Engine SHALL broadcast the question text, answer options, Game_Type, and countdown duration to all Participants simultaneously.
2. THE Game_Engine SHALL display question and answer text in the language selected for the session (English, Khmer, or both).
3. WHILE a Question_Round is active, THE Game_Engine SHALL decrement the visible countdown timer once per second on each Participant's client.
4. IF a Participant has not answered when the countdown reaches zero, THEN THE Game_Engine SHALL record a non-answer for that Participant and mark the question as timed out.
5. THE Game_Engine SHALL display answer options using color-coded shapes (4 shapes for MCQ, 2 shapes for True/False) consistent with Kahoot-style UX.
6. WHERE a question has an associated image, THE Game_Engine SHALL display the image above the question text during the Question_Round.

---

### Requirement 5: Speed-Based Scoring

**User Story:** As a student, I want to earn more points for answering correctly and quickly, so that I am motivated to stay focused.

#### Acceptance Criteria

1. WHEN a Participant answers correctly, THE Game_Engine SHALL calculate Speed_Score using the formula: `base_points + floor(base_points × (remaining_time / total_time))`, where `base_points` defaults to 1000.
2. WHEN a Participant answers incorrectly or does not answer, THE Game_Engine SHALL award 0 points for that Question_Round.
3. WHEN a Participant answers 3 or more consecutive questions correctly, THE Game_Engine SHALL apply a Streak_Bonus of 10% of the base_points per additional consecutive correct answer, up to a maximum of 50% bonus.
4. THE Game_Engine SHALL accumulate each Participant's Speed_Score across all Question_Rounds to produce a session total score.
5. WHERE the Host selects equal-points scoring mode, THE Game_Engine SHALL award `base_points` for every correct answer regardless of answer time.
6. THE Game_Engine SHALL display the points earned and current rank to each Participant immediately after each Question_Round result is revealed.

---

### Requirement 6: Live Leaderboard

**User Story:** As a student, I want to see a live leaderboard after each question, so that I know how I rank against my classmates.

#### Acceptance Criteria

1. AFTER each Question_Round result is revealed, THE Game_Engine SHALL broadcast an updated Leaderboard showing all Participants ranked by cumulative score.
2. THE Game_Engine SHALL display each Participant's display name, avatar, cumulative score, and rank change (up/down/same) on the Leaderboard.
3. THE Game_Engine SHALL highlight the top 3 Participants on the Leaderboard with distinct visual indicators.
4. THE Game_Engine SHALL show each Participant their own rank prominently, even if they are not in the top 3.
5. WHEN the Game_Session ends, THE Game_Engine SHALL display the Podium screen showing the top 3 Participants with their final scores.
6. THE Game_Engine SHALL persist the final Leaderboard results to the `leaderboard_entries` table upon session completion.

---

### Requirement 7: Game Types

**User Story:** As a teacher, I want to use different question formats, so that the game stays engaging and tests different skills.

#### Acceptance Criteria

1. THE Game_Engine SHALL support the MCQ Game_Type, presenting one question with 2–4 answer options where exactly one is correct.
2. THE Game_Engine SHALL support the True/False Game_Type, presenting one statement with exactly two options: True and False.
3. THE Game_Engine SHALL support the Image_Pick Game_Type, presenting an image (e.g., a traffic sign) and asking the Participant to select the correct label from 2–4 options.
4. THE Game_Engine SHALL support the Word_Puzzle Game_Type, presenting a scrambled word or phrase related to driving theory and asking the Participant to unscramble it by selecting letters in order.
5. THE Game_Engine SHALL support the Memory_Match Game_Type, presenting a set of 4–8 card pairs (term and definition) that the Participant must match within the question time limit.
6. THE Game_Engine SHALL support the Sort_Order Game_Type, presenting 3–5 items that the Participant must arrange in the correct sequence (e.g., steps in a procedure).
7. WHEN the Host selects "Mixed" game type, THE Game_Engine SHALL assign a Game_Type to each question based on the available answer data for that Content_Item.

---

### Requirement 8: Solo Practice Mode

**User Story:** As a student, I want to play a quiz game on my own without a teacher, so that I can practice at any time.

#### Acceptance Criteria

1. THE Game_Engine SHALL provide a Solo_Practice mode where a student selects Category, difficulty, question count, and time per question without requiring a Host.
2. WHEN a student starts a Solo_Practice session, THE Game_Engine SHALL generate a question set and begin the game immediately without a Lobby phase.
3. THE Game_Engine SHALL apply the same Speed_Score and Streak_Bonus rules in Solo_Practice mode as in live sessions.
4. WHEN a Solo_Practice session ends, THE Game_Engine SHALL display a results screen showing score, accuracy percentage, time taken, and a per-question breakdown.
5. THE Game_Engine SHALL save Solo_Practice results to the `game_scores` table and update the student's `user_streaks` record.
6. THE Game_Engine SHALL show the student their personal best score for the same Category and difficulty after each Solo_Practice session.

---

### Requirement 9: Post-Game Analytics for Teachers

**User Story:** As a teacher, I want to see how my students performed after a game, so that I can identify topics that need more attention.

#### Acceptance Criteria

1. WHEN a Game_Session ends, THE Game_Engine SHALL generate a session summary showing: total participants, average score, average accuracy, and average time per question.
2. THE Game_Engine SHALL provide a per-question breakdown showing: question text, percentage of correct answers, average answer time, and most-selected wrong answer.
3. THE Game_Engine SHALL provide a per-student breakdown showing: student name, total score, correct answers, incorrect answers, and average answer time.
4. THE Game_Engine SHALL identify the 3 questions with the lowest correct-answer rate and flag them as "needs review" in the session summary.
5. THE Host SHALL be able to export the session summary as a CSV file containing all per-student and per-question data.
6. THE Game_Engine SHALL retain session analytics data for a minimum of 90 days.

---

### Requirement 10: Real-Time Communication

**User Story:** As a student, I want the game to update instantly without page refreshes, so that the experience feels live and responsive.

#### Acceptance Criteria

1. THE Real_Time_Layer SHALL use WebSocket connections to push game state updates from the Game_Engine to all connected clients.
2. WHEN a client connects to a Game_Session, THE Real_Time_Layer SHALL send the current game state (lobby participant list, current question, or results) within 500 milliseconds.
3. IF a WebSocket connection drops, THEN THE Real_Time_Layer SHALL attempt to reconnect automatically up to 5 times with exponential backoff before showing a connection error to the user.
4. THE Real_Time_Layer SHALL broadcast Question_Round start events to all Participants within 200 milliseconds of the Host triggering the event.
5. THE Real_Time_Layer SHALL handle at least 40 concurrent WebSocket connections per Game_Session without degrading broadcast latency beyond 500 milliseconds.

---

### Requirement 11: Content Integration and Bilingual Support

**User Story:** As a staff member, I want existing approved content to be usable in game sessions, so that I don't have to re-enter questions.

#### Acceptance Criteria

1. THE Game_Engine SHALL source all questions exclusively from Content_Items with status `approved` in the existing `questions` and `answers` tables.
2. THE Game_Engine SHALL support displaying question text and answer options in English, Khmer, or both languages simultaneously, based on the session language setting.
3. WHERE a Content_Item has an associated audio URL, THE Game_Engine SHALL play the audio for the question when the Question_Round begins, if the student's audio is not muted.
4. THE Game_Engine SHALL map each Content_Item to a compatible Game_Type based on the answer structure (e.g., 4 options with one correct → MCQ or Image_Pick if an image is present).
5. IF a Content_Item cannot be mapped to the session's selected Game_Type, THEN THE Game_Engine SHALL skip that Content_Item and select a replacement from the same Category.

---

### Requirement 12: Role-Based Access Control

**User Story:** As an admin, I want game features to be accessible only to the appropriate roles, so that the system remains secure and well-managed.

#### Acceptance Criteria

1. THE Game_Engine SHALL restrict Game_Session creation to users with the `teacher` role.
2. THE Game_Engine SHALL restrict access to post-game analytics and session management to the Host who created the session or users with the `admin` role.
3. THE Game_Engine SHALL allow users with the `student` role to join live Game_Sessions and access Solo_Practice mode.
4. THE Game_Engine SHALL allow users with the `admin` role to view all Game_Sessions, terminate any active session, and access all analytics.
5. IF a user with the `staff` role attempts to create or host a Game_Session, THEN THE Game_Engine SHALL return a 403 Forbidden response.
```
ADMIN
├── Controls game modes (enable/disable, configure)
├── Controls which categories are active
├── Views all session analytics across all teachers
└── Can terminate any live session

TEACHER  
├── Creates live sessions (picks category, mode, questions)
├── Hosts the game (start/pause/advance/end)
├── Views analytics for their own sessions
└── Cannot modify game mode configs

STAFF
├── Creates content (topics + questions + answers)
├── Submits for admin approval
└── NO access to game sessions

STUDENT
├── Joins live sessions via room code
├── Plays solo practice (any mode)
└── Views own leaderboard/history
Categories (8) — seeded, Admin manages active/inactive
    ↓
Topics — Staff creates, Admin approves
    ↓  
Questions + Answers — linked to topics
    ↓
Game Engine picks approved questions
matching selected category + difficulty
    ↓
Serves to game mode (MCQ, Image, etc.)
game_session_answers (append-only, never updated)
├── session_id
├── user_id  
├── question_id
├── answer_id (what they picked)
├── is_correct (server-calculated)
├── points_awarded (server-calculated)
├── answer_time_ms (server clock delta)
└── created_at

game_scores (final summary per session)
├── user_id
├── session_id / game_mode
├── total_score
├── correct_answers
├── accuracy_percent
└── created_at

leaderboard_entries (ranked, updated after session ends)
├── user_id
├── category_id
├── score
├── period (weekly / monthly / all-time)
└── updated_at
