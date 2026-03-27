# Game Session Lifecycle Documentation

## Overview
This document explains the complete lifecycle of a live game session, from creation to completion.

## Session States

### 1. **Lobby** (Waiting Room)
- **Status**: `lobby`
- **Description**: Session is created and waiting for players to join
- **Host Actions**:
  - View room code
  - See real-time player list with connection status
  - Start game (requires at least 1 player)
  - Terminate lobby (cancels session before it starts)
- **Player Actions**:
  - Join using room code (requires login)
  - Wait for host to start
  - See other players in lobby
- **Restrictions**:
  - Only authenticated users can join
  - Maximum player limit enforced
  - Late join NOT allowed once game starts

### 2. **Active** (Game In Progress)
- **Status**: `active`
- **Description**: Game is running, questions are being presented
- **Host Actions**:
  - View current question
  - See live leaderboard
  - Advance to next question
  - Pause game
  - End game early
- **Player Actions**:
  - Answer questions within time limit
  - See immediate feedback (correct/incorrect)
  - View points earned
  - Wait for next question
- **Automatic Transitions**:
  - After last question → `ended`
  - When host clicks "End" → `ended`

### 3. **Paused**
- **Status**: `paused`
- **Description**: Game temporarily stopped by host
- **Host Actions**:
  - Resume game
  - End game
- **Player Actions**:
  - Wait for resume
  - See pause notification

### 4. **Ended** (Game Over)
- **Status**: `ended`
- **Description**: Game has completed
- **What Happens**:
  - Final leaderboard calculated
  - Player ranks saved to database
  - Podium (top 3) displayed
  - Session remains in database for analytics
- **Host Actions**:
  - View final results
  - Access analytics page
  - Create new game
- **Player Actions**:
  - View final standings
  - See their rank and score
  - Return to play page

## Session Lifecycle Flow

```
CREATE SESSION
    ↓
[LOBBY] ←─────────────┐
    ↓                  │
  START               │
    ↓                  │
[ACTIVE] ←──RESUME────┤
    ↓                  │
  PAUSE ──────────────┘
    ↓
  END / LAST QUESTION
    ↓
[ENDED]
```

## Termination vs. End

### Terminate (Lobby Only)
- **When**: Before game starts (lobby phase)
- **Action**: Immediately cancels session
- **Effect**: 
  - Session status → `ended`
  - All players disconnected
  - No scores recorded
  - Room code becomes invalid

### End (During Game)
- **When**: Game is active or paused
- **Action**: Gracefully ends game
- **Effect**:
  - Session status → `ended`
  - Final scores calculated
  - Leaderboard saved
  - Analytics available

## After Game Ends

### Session Data Retention
- Session record remains in database
- All participant scores preserved
- Answer history maintained
- Available for analytics and review

### Room Code
- Code becomes invalid (cannot join)
- SSE connections closed
- Players see "Game Over" screen

### Analytics Access
- Host can view detailed results
- Question-by-question breakdown
- Player performance metrics
- Export capabilities (if implemented)

## Real-Time Updates (SSE)

### Events Broadcast to All Participants

1. **lobby_update**
   - Sent when: Player joins/leaves
   - Contains: Current player list with connection status

2. **question_start**
   - Sent when: New question begins
   - Contains: Question data, timer, index

3. **question_end**
   - Sent when: Host advances or time expires
   - Contains: Correct answer, updated leaderboard

4. **session_paused**
   - Sent when: Host pauses game

5. **session_resumed**
   - Sent when: Host resumes game

6. **session_end**
   - Sent when: Game completes
   - Contains: Final leaderboard, podium (top 3)

7. **warning**
   - Sent when: Session terminated or other alerts

## Authentication & Access Control

### Join Requirements
- Must be logged in (authenticated user)
- Session must be in `lobby` status
- Room must not be full (< maxPlayers)
- Cannot join if game already started

### Solo Mode (Future Enhancement)
- Non-logged-in users can access solo practice mode
- Separate from live multiplayer sessions
- No leaderboard or competition
- Scores not saved

## Best Practices

### For Teachers/Hosts
1. Create session with appropriate settings
2. Share room code with students
3. Wait for all students to join before starting
4. Monitor player count in real-time
5. Use "Terminate" if you need to cancel before starting
6. Use "End" to gracefully finish an active game
7. Review analytics after game ends

### For Students/Players
1. Log in before joining
2. Join using room code
3. Wait in lobby for host to start
4. Answer questions quickly for bonus points
5. Stay connected throughout game
6. View final results when game ends

## Troubleshooting

### "Cannot join game" Error
- Check if you're logged in
- Verify room code is correct
- Ensure game hasn't started yet
- Check if room is full

### Start Button Not Working
- Ensure at least 1 player has joined
- Check for error messages
- Verify you're the host
- Try refreshing the page

### Players Not Showing Up
- Check SSE connection status
- Verify players successfully joined
- Look for connection indicators
- Check browser console for errors

### Game Stuck in Lobby
- Host must click "Start Game" button
- Cannot start with 0 players
- Check for error messages

## Technical Details

### Database Tables
- `game_sessions`: Session metadata and configuration
- `game_participants`: Player scores and stats
- `game_session_answers`: Individual answer records

### State Management
- Server-side state in PostgreSQL
- Real-time sync via SSE (Server-Sent Events)
- Client-side state in React components

### Scoring System
- Base points: 1000
- Speed bonus: Based on remaining time (if enabled)
- Streak bonus: Up to 5x consecutive correct answers
- Server-side calculation (prevents cheating)
