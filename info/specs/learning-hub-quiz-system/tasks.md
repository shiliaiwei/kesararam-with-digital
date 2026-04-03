# Implementation Plan: Learning Hub Quiz System

## Overview

This implementation plan covers the complete Learning Hub Quiz System for Cambodian driving education. The system includes 8 content categories with bilingual support, content approval workflow, 4 learning modes (Flashcards, Quiz, Practice Test, Challenge), quiz engine with Fair Algorithm, progress tracking, and ranking system.

The implementation follows 4 phases: Database Schema & Core APIs → Quiz Engine & Progress Tracking → Challenge System & Rankings → Frontend Components.

## Tasks

- [x] 1. Enhance database schema for quiz system
  - [x] 1.1 Add missing fields to content_items table
    - Add `status` field (enum: 'pending', 'active', 'rejected', 'inactive')
    - Add `subtopic` field for categorization within categories
    - Add `approvedBy` and `approvedAt` fields for approval tracking
    - _Requirements: 10.1, 11.2, 11.3, 16.1, 29.1_
  
  - [x] 1.2 Add audioMuted field to users table
    - Add `audioMuted` boolean field with default false
    - _Requirements: 19.4, 20.1, 20.4_
  
  - [x] 1.3 Create content_approvals table
    - Create table with fields: id, contentId, adminId, action, comments, createdAt
    - Add foreign key references to content_items and users
    - _Requirements: 11.5, 29.5_
  
  - [x] 1.4 Create user_progress table
    - Create table with fields: id, userId, contentId, completed, lastViewedAt, createdAt
    - Add unique constraint on (userId, contentId)
    - Add foreign key references
    - _Requirements: 18.1, 18.2_
  
  - [x] 1.5 Create quiz_attempts table
    - Create table with fields: id, userId, categoryId, mode, totalQuestions, correctAnswers, score, percentage, timeSpent, completedAt
    - Add foreign key references
    - _Requirements: 13.5, 18.3, 26.3_
  
  - [x] 1.6 Create quiz_answers table
    - Create table with fields: id, attemptId, contentId, isCorrect, points, timeSpent, answeredAt
    - Add foreign key references to quiz_attempts and content_items
    - _Requirements: 13.3, 26.1, 26.4_
  
  - [x] 1.7 Enhance challenge_sessions table
    - Add `categoryId` field for category-specific challenges
    - Ensure roomCode has unique constraint
    - _Requirements: 15.1, 24.1, 28.1_
  
  - [x] 1.8 Update session_answers table
    - Change `questionId` reference to `contentId` for direct content reference
    - Add `timeBonus` field for challenge scoring
    - _Requirements: 15.3, 26.2_
  
  - [x] 1.9 Enhance leaderboard_entries table
    - Add `categoryId` field (nullable for overall rankings)
    - Add `correctAnswers` and `totalAttempts` fields
    - Add `periodStart` date field for period tracking
    - Add unique constraint on (studentId, categoryId, period, periodStart)
    - _Requirements: 17.1, 17.5_
  
  - [x] 1.10 Generate and run database migration
    - Run `drizzle-kit generate` to create migration files
    - Review generated SQL migration
    - Run `drizzle-kit push` to apply schema changes
    - _Requirements: All database requirements_



- [x] 2. Implement content management APIs
  - [x] 2.1 Create GET /api/categories endpoint
    - Return all active categories with bilingual titles
    - Add caching for performance
    - _Requirements: 1.1, 1.3_
  
  - [x] 2.2 Create GET /api/content/[categorySlug] endpoint
    - Implement pagination (default 20 items per page)
    - Add filtering by status, difficulty, search term
    - Students see only active content, Staff/Admin see all
    - _Requirements: 1.2, 22.1, 22.3, 22.4, 23.1_
  
  - [x] 2.3 Create GET /api/content/item/[id] endpoint
    - Return full content item with all bilingual fields and media URLs
    - Check user permissions (active content for students, all for staff/admin)
    - _Requirements: 2.2, 21.1, 21.2_
  
  - [x] 2.4 Create POST /api/content/create endpoint
    - Validate required bilingual fields
    - Set status to 'pending' for staff users
    - Set createdBy to current user ID
    - Create audit log entry
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 29.1_
  
  - [x] 2.5 Write property test for content creation status
    - **Property 3: Staff Content Creation Status**
    - **Validates: Requirements 10.1, 10.5, 23.5**
  
  - [x] 2.6 Create PUT /api/content/update/[id] endpoint
    - Allow creator to edit pending content
    - Allow admin to edit any content
    - Update updatedAt timestamp
    - Create audit log entry
    - _Requirements: 10.2, 29.3_
  
  - [x] 2.7 Create POST /api/content/upload endpoint
    - Validate file type (images: JPG, PNG, SVG, WebP; audio: MP3, WAV, OGG)
    - Validate file size (images ≤ 5MB, audio ≤ 10MB)
    - Upload to Cloudinary
    - Return URL and publicId
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [x] 2.8 Write property tests for file upload validation
    - **Property 20: File Upload Format Validation**
    - **Property 21: File Upload Size Validation**
    - **Validates: Requirements 25.1, 25.2, 25.3**

- [x] 3. Checkpoint - Verify content management
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement approval workflow APIs
  - [x] 4.1 Create GET /api/admin/pending-content endpoint
    - Return paginated list of content with status='pending'
    - Add filtering by categoryId
    - Restrict access to admin role only
    - _Requirements: 11.1, 23.3_
  
  - [x] 4.2 Create POST /api/admin/approve/[contentId] endpoint
    - Update content status to 'active'
    - Set approvedBy and approvedAt fields
    - Create content_approvals record with action='approved'
    - Create audit log entry
    - Restrict to admin role
    - _Requirements: 11.2, 11.5, 29.5_
  
  - [x] 4.3 Write property test for approval workflow
    - **Property 5: Approval Workflow State Transitions**
    - **Validates: Requirements 11.2, 11.3, 11.5**
  
  - [x] 4.4 Create POST /api/admin/reject/[contentId] endpoint
    - Update content status to 'rejected'
    - Create content_approvals record with action='rejected' and comments
    - Create audit log entry
    - Restrict to admin role
    - _Requirements: 11.3, 11.5_
  
  - [x] 4.5 Create PUT /api/admin/toggle-active/[contentId] endpoint
    - Toggle isActive field
    - Create audit log entry
    - Restrict to admin role
    - _Requirements: 30.1, 30.4_
  
  - [x] 4.6 Write property test for inactive content exclusion
    - **Property 26: Inactive Content Exclusion for Students**
    - **Validates: Requirements 30.2, 30.5**

- [x] 5. Implement Fair Algorithm for question selection
  - [x] 5.1 Create Fair Algorithm utility function
    - Implement getUserQuizHistory to fetch user's recent quiz answers
    - Implement identifyWeakTopics (topics with <60% correct rate over 3+ attempts)
    - Implement getRecentlyAnsweredQuestions (last 50 questions)
    - _Requirements: 16.3, 16.4_
  
  - [x] 5.2 Implement question selection logic
    - Get available active questions for category
    - Filter by difficulty if specified
    - Exclude recently answered questions
    - Group questions by subtopic
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 5.3 Implement weak topic prioritization
    - Allocate 40% of questions to weak topics
    - Fill remaining with balanced selection across subtopics
    - Shuffle and return requested question count
    - _Requirements: 16.4_
  
  - [x] 5.4 Write property test for subtopic distribution
    - **Property 9: Fair Algorithm Subtopic Distribution**
    - **Validates: Requirements 16.1**
  
  - [x] 5.5 Write property test for recency exclusion
    - **Property 10: Fair Algorithm Recency Exclusion**
    - **Validates: Requirements 16.3**
  
  - [x] 5.6 Write property test for weak topic prioritization
    - **Property 11: Fair Algorithm Weak Topic Prioritization**
    - **Validates: Requirements 16.4**



- [x] 6. Implement quiz engine APIs
  - [x] 6.1 Create POST /api/quiz/start endpoint
    - Accept categoryId, mode, difficulty, questionCount
    - Use Fair Algorithm to select questions
    - Create quiz_attempts record with initial data
    - Return attemptId and selected questions
    - _Requirements: 13.1, 14.1, 16.1_
  
  - [x] 6.2 Write property test for Fair Algorithm invocation
    - **Property 7: Quiz Question Selection Invokes Fair Algorithm**
    - **Validates: Requirements 13.1**
  
  - [x] 6.3 Create POST /api/quiz/answer endpoint
    - Accept attemptId, contentId, answer, timeSpent
    - Validate answer against content item
    - Calculate points (base points + time bonus for challenge mode)
    - Create quiz_answers record
    - Return isCorrect, points, correctAnswer
    - _Requirements: 13.3, 26.1, 26.2_
  
  - [x] 6.4 Write property test for quiz scoring
    - **Property 22: Quiz Scoring Based on Content Configuration**
    - **Validates: Requirements 26.1, 26.2**
  
  - [x] 6.5 Create POST /api/quiz/complete endpoint
    - Calculate total score, percentage, correct answers count
    - Update quiz_attempts record with final results
    - Update user_progress for completed content items
    - Update leaderboard_entries
    - Return detailed results with breakdown
    - _Requirements: 13.4, 13.5, 18.1, 26.3_
  
  - [x] 6.6 Write property test for quiz completion recording
    - **Property 8: Quiz Completion Recording**
    - **Validates: Requirements 13.5**
  
  - [x] 6.7 Write property test for total score calculation
    - **Property 23: Quiz Total Score Calculation**
    - **Validates: Requirements 26.3**
  
  - [x] 6.8 Create GET /api/quiz/history endpoint
    - Return paginated quiz attempts for user
    - Filter by categoryId if provided
    - Include score, percentage, date
    - _Requirements: 18.3_

- [x] 7. Checkpoint - Verify quiz engine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement progress tracking APIs
  - [x] 8.1 Create GET /api/progress/[userId] endpoint
    - Calculate completion statistics by category
    - Return totalItems, completedItems, completionPercentage, averageScore
    - Allow user to view own progress, admin to view all
    - _Requirements: 18.1, 18.2, 18.4_
  
  - [x] 8.2 Write property test for completion percentage
    - **Property 14: Category Completion Percentage Calculation**
    - **Validates: Requirements 18.2**
  
  - [x] 8.3 Create GET /api/progress/[userId]/category/[categoryId] endpoint
    - Return detailed progress for specific category
    - Include list of completed items, scores, trends
    - _Requirements: 18.4, 18.5_
  
  - [x] 8.4 Create POST /api/progress/mark-viewed endpoint
    - Update or create user_progress record
    - Set lastViewedAt to current timestamp
    - _Requirements: 18.1_
  
  - [x] 8.5 Create POST /api/progress/mark-completed endpoint
    - Update user_progress record
    - Set completed to true
    - _Requirements: 18.1_
  
  - [x] 8.6 Write property test for progress tracking
    - **Property 13: Progress Tracking Per Content Item**
    - **Validates: Requirements 18.1**

- [x] 9. Implement challenge system APIs
  - [x] 9.1 Create POST /api/challenge/create endpoint
    - Accept categoryId, challengeType, level, maxStudents
    - Generate unique 6-character room code
    - Create challenge_sessions record with status='waiting'
    - Return sessionId and roomCode
    - _Requirements: 28.1_
  
  - [x] 9.2 Write property test for room code uniqueness
    - **Property 24: Challenge Session Room Code Uniqueness**
    - **Validates: Requirements 28.1**
  
  - [x] 9.3 Create POST /api/challenge/join endpoint
    - Accept roomCode
    - Validate session exists and status is 'waiting' or 'active'
    - Check participant count against maxStudents
    - Create session_participants record
    - Return sessionId, status, participantCount
    - _Requirements: 28.2, 28.3_
  
  - [x] 9.4 Write property test for participant limit
    - **Property 25: Challenge Session Participant Limit**
    - **Validates: Requirements 28.2**
  
  - [x] 9.5 Create POST /api/challenge/start/[sessionId] endpoint
    - Use Fair Algorithm to select questions for category
    - Update session status to 'active'
    - Set startedAt timestamp
    - Return questions and startedAt
    - _Requirements: 15.2, 28.4_
  
  - [x] 9.6 Create POST /api/challenge/answer endpoint
    - Accept sessionId, contentId, answer, timeSpent
    - Validate answer
    - Calculate points with time bonus
    - Create session_answers record
    - Update session_participants score
    - Calculate current rank
    - Return isCorrect, points, timeBonus, currentRank
    - _Requirements: 15.3, 28.4_
  
  - [x] 9.7 Create POST /api/challenge/complete/[sessionId] endpoint
    - Update session status to 'completed'
    - Set endedAt timestamp
    - Calculate final rankings for all participants
    - Update session_participants ranks
    - Update leaderboard_entries for all participants
    - Return rankings and finalScores
    - _Requirements: 15.4, 28.5_
  
  - [x] 9.8 Create GET /api/challenge/session/[sessionId] endpoint
    - Return session details with participants and current scores
    - Include real-time rankings
    - _Requirements: 15.4_



- [x] 10. Implement ranking system APIs
  - [x] 10.1 Create ranking calculation utility function
    - Implement updateRankings function
    - Handle period calculation (weekly, monthly, all-time)
    - Update or create leaderboard_entries
    - Recalculate ranks for affected period/category
    - _Requirements: 17.1, 17.2_
  
  - [x] 10.2 Create GET /api/leaderboard endpoint
    - Accept categoryId, period, limit query params
    - Return ranked list ordered by score, then correctAnswers
    - Include student displayName and avatar
    - _Requirements: 17.3, 17.4_
  
  - [x] 10.3 Create GET /api/leaderboard/user/[userId] endpoint
    - Accept categoryId and period query params
    - Return user's rank and score for specified period/category
    - _Requirements: 17.4_
  
  - [x] 10.4 Integrate ranking updates into quiz completion
    - Call updateRankings after quiz/challenge completion
    - Update for weekly, monthly, and all-time periods
    - Update both category-specific and overall rankings
    - _Requirements: 17.2, 17.5_

- [x] 11. Implement user preference APIs
  - [ ] 11.1 Create GET /api/user/preferences endpoint
    - Return user preferences including audioMuted
    - Restrict to authenticated user's own preferences
    - _Requirements: 20.1_
  
  - [ ] 11.2 Create PUT /api/user/preferences endpoint
    - Accept audioMuted boolean
    - Update users.audioMuted field
    - Return updated preferences
    - _Requirements: 20.2, 20.3_
  
  - [ ] 11.3 Write property test for audio mute preference
    - **Property 16: Audio Mute Preference Persistence**
    - **Validates: Requirements 20.4**

- [ ] 12. Checkpoint - Verify backend APIs
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement student interface components
  - [ ] 13.1 Create CategoryBrowser component
    - Display categories in grid layout with bilingual titles
    - Show category icons and descriptions
    - Navigate to category content on click
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 13.2 Create ContentList component for category browsing
    - Display content items in grid/list layout
    - Show preview (title, thumbnail, difficulty)
    - Add filtering by difficulty and subtopic
    - Add search functionality
    - Show completion indicators
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_
  
  - [ ] 13.3 Create ContentDetailModal component
    - Display full content with bilingual text
    - Show images and audio players
    - Provide language toggle (Khmer/English)
    - Add navigation to next/previous content
    - Include close button
    - _Requirements: 2.2, 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [ ] 13.4 Create AudioController component
    - Provide play buttons for Khmer and English audio
    - Respect user's audioMuted preference (no auto-play if muted)
    - Allow manual playback even when muted
    - Show audio loading and playing states
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 20.5_
  
  - [ ] 13.5 Write property test for audio mute enforcement
    - **Property 15: Audio Mute Preference Enforcement**
    - **Validates: Requirements 19.4, 19.5, 20.5**
  
  - [ ] 13.6 Create FlashcardViewer component
    - Display flashcard with front/back flip animation
    - Show question on front, answer on back
    - Add next/previous navigation
    - Show progress indicator (card X of Y)
    - Support bilingual content
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 13.7 Create QuizInterface component
    - Display question with multiple choice or true/false options
    - Show immediate feedback on answer submission
    - Display score and progress during quiz
    - Show final results on completion
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 13.8 Create PracticeTestInterface component
    - Display questions one at a time
    - Show timer per question
    - Auto-advance on time expiration
    - Hide correct answers until completion
    - Show detailed results with explanations at end
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 13.9 Create ChallengeInterface component
    - Show room code and participant count
    - Display real-time rankings during challenge
    - Show timer and score
    - Display final rankings on completion
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ] 13.10 Create ProgressDashboard component
    - Display completion percentage by category
    - Show quiz history with scores and dates
    - Display trends and statistics
    - Highlight areas needing focus
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ] 13.11 Create LeaderboardView component
    - Display ranked list of students
    - Show filters for period (weekly, monthly, all-time) and category
    - Highlight current user's rank
    - Show avatars, names, scores
    - _Requirements: 17.3, 17.4, 17.5_



- [ ] 14. Implement staff interface components
  - [ ] 14.1 Create ContentCreationForm component
    - Multi-step form for content creation
    - Bilingual input fields (Khmer and English)
    - Category and type selection
    - Difficulty and subtopic fields
    - Question and answer fields
    - Score points and time limit configuration
    - _Requirements: 10.2, 10.3_
  
  - [ ] 14.2 Create MediaUploader component
    - File upload for images and audio
    - Cloudinary resource browser integration
    - File type and size validation
    - Preview uploaded media
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ] 14.3 Create ContentListView component for staff
    - Display created content with status indicators
    - Filter by status (pending, active, rejected)
    - Show approval status and comments
    - Allow editing of pending content
    - _Requirements: 10.1, 11.3_
  
  - [ ] 14.4 Create ChallengeSessionCreator component
    - Form to create challenge session
    - Category, type, level, maxStudents selection
    - Display generated room code
    - Show participant list
    - Start session button
    - _Requirements: 28.1, 28.2, 28.3, 28.4_

- [ ] 15. Implement admin interface components
  - [ ] 15.1 Create ApprovalQueue component
    - Display pending content in list/grid
    - Filter by category
    - Show content preview
    - Quick approve/reject actions
    - _Requirements: 11.1_
  
  - [ ] 15.2 Create ContentReviewModal component
    - Display full content details
    - Allow inline editing
    - Approve button with confirmation
    - Reject button with comment field
    - Show creator information
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [ ] 15.3 Create AuditLogViewer component
    - Display audit logs with filters
    - Show action, user, timestamp, details
    - Filter by entity type, action, date range
    - _Requirements: 29.5_
  
  - [ ] 15.4 Create ContentActivationToggle component
    - Toggle switch for isActive field
    - Confirmation dialog for deactivation
    - Show current status
    - _Requirements: 30.1, 30.4_

- [ ] 16. Implement role-based access control
  - [ ] 16.1 Create authorization middleware
    - Check user session and role
    - Protect API routes based on role requirements
    - Return 401 for unauthenticated, 403 for unauthorized
    - _Requirements: 23.1, 23.2, 23.3_
  
  - [ ] 16.2 Write property tests for role-based access
    - **Property 17: Role-Based Content Access**
    - **Property 18: Role-Based Content Creation**
    - **Property 19: Role-Based Admin Permissions**
    - **Validates: Requirements 23.1, 23.2, 23.3, 23.4, 23.5**
  
  - [ ] 16.3 Implement client-side route protection
    - Redirect unauthorized users from protected pages
    - Hide UI elements based on user role
    - Show appropriate error messages
    - _Requirements: 23.4, 23.5_

- [ ] 17. Implement game mode integration
  - [ ] 17.1 Create LearningModeSelector component
    - Display 4 learning mode options (Flashcards, Quiz, Practice Test, Challenge)
    - Show mode descriptions and icons
    - Pass category context to selected mode
    - _Requirements: 24.1, 24.2, 24.4_
  
  - [ ] 17.2 Integrate challenge system with game modes
    - Connect Challenge mode to challenge session creation
    - Display available game modes per category
    - _Requirements: 24.3_
  
  - [ ] 17.3 Aggregate game mode scores into rankings
    - Ensure all quiz modes update leaderboards
    - Include challenge scores in overall rankings
    - _Requirements: 24.5_

- [ ] 18. Implement error handling and validation
  - [ ] 18.1 Create consistent error response format
    - Define ErrorResponse interface
    - Implement error handler middleware
    - Return appropriate HTTP status codes
    - _Requirements: All error scenarios_
  
  - [ ] 18.2 Add validation for all API endpoints
    - Validate required fields
    - Validate field formats and types
    - Validate business rules (e.g., file size, participant limits)
    - Return clear validation error messages
    - _Requirements: 25.3, 28.2_
  
  - [ ] 18.3 Implement client-side error handling
    - Display user-friendly error messages
    - Handle network errors gracefully
    - Show loading states
    - Implement retry logic where appropriate
    - _Requirements: All user-facing features_

- [ ] 19. Final integration and testing
  - [ ] 19.1 Test complete student workflow
    - Browse categories → View content → Take quiz → View progress
    - Verify all learning modes work correctly
    - Test audio playback and mute preferences
    - _Requirements: All student requirements_
  
  - [ ] 19.2 Test complete staff workflow
    - Create content → Upload media → Submit for approval
    - Verify pending status and inability to publish directly
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 19.3 Test complete admin workflow
    - Review pending content → Edit → Approve/Reject
    - Verify content becomes visible to students after approval
    - Test content activation toggle
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 30.1, 30.4_
  
  - [ ] 19.4 Test challenge session workflow
    - Create session → Students join → Start → Answer questions → View rankings
    - Verify participant limits and room code uniqueness
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_
  
  - [ ] 19.5 Test Fair Algorithm with various scenarios
    - Test with different user performance histories
    - Verify weak topic prioritization
    - Verify recency exclusion
    - Verify subtopic distribution
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 19.6 Run all property-based tests
    - Execute all property tests with 100+ iterations
    - Verify all properties hold across randomized inputs
    - Fix any failing properties
    - _Requirements: All correctness properties_

- [ ] 20. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with Next.js, Drizzle ORM, and PostgreSQL
- Cloudinary is used for media storage with resource browser integration
- All bilingual content must be complete for active content items
- The Fair Algorithm ensures balanced, adaptive question selection
- Progress tracking and rankings provide engagement and motivation
- Role-based access control ensures content quality through approval workflow
