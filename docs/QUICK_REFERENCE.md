# Quick Reference - Random Quiz System

## 🚀 Quick Start

### For Developers

**Import the new algorithm:**
```typescript
import { selectRandomQuestions } from '@/lib/question-selector';
```

**Use it:**
```typescript
const selectedQuestions = selectRandomQuestions({
  questions: allQuestions,      // Array of question objects
  questionCount: 20,             // How many to select
  categoryIds: [1, 2, 3],       // Selected categories
  userId: user?.id,              // Optional: for user-specific variation
  sessionTime: Date.now(),       // Optional: for time-based variation
});
```

### For Testing

**Run tests:**
```bash
npm test src/test/question-selector.test.ts
```

**Check randomness:**
```typescript
import { calculateUniquenessScore } from '@/lib/question-selector';

const set1 = selectRandomQuestions({ ... });
const set2 = selectRandomQuestions({ ... });
const score = calculateUniquenessScore(set1, set2);
// Score should be > 70% for good randomness
```

## 🎮 Game Modes Reference

| Mode | Questions | Time | Types | Color |
|------|-----------|------|-------|-------|
| Quick Quiz | 5-20 | 30s | MCQ, T/F | Yellow |
| Speed Round | 10-30 | 15s | MCQ | Red |
| Sign Challenge | 5-30 | 20s | Images | Cyan |
| Mixed Practice | 10-40 | 30s | All | Purple |

## 📁 File Locations

### Core Files
```
/src/lib/question-selector.ts          ← Main algorithm
/src/lib/game-engine.ts                ← Game mode config
/src/app/api/game/solo/route.ts       ← Solo game API
/src/app/api/game/sessions/route.ts   ← Live game API
/src/app/(public)/play/page.tsx       ← Play page UI
/src/app/(public)/play/solo/page.tsx  ← Solo game UI
```

### Documentation
```
/docs/RANDOM_QUIZ_ALGORITHM.md         ← Full algorithm docs
/docs/BEFORE_AFTER_COMPARISON.md       ← Comparison guide
/docs/QUICK_REFERENCE.md               ← This file
/QUIZ_REDESIGN_SUMMARY.md              ← Summary
```

### Tests
```
/src/test/question-selector.test.ts    ← Algorithm tests
```

## 🔧 Configuration

### Add New Game Mode
```typescript
// In /src/lib/game-engine.ts

// 1. Add to GAME_MODE_TYPES
export const GAME_MODE_TYPES = {
  "your-mode": ["mcq", "true_false"],
};

// 2. Add to GAME_MODE_CONFIG
export const GAME_MODE_CONFIG = {
  "your-mode": {
    defaultQuestionCount: 10,
    allowedQuestionCounts: [5, 10, 15, 20],
    timePerQuestion: 30,
    label: "Your Mode",
    labelKm: "របៀបរបស់អ្នក",
    color: "#3b82f6",
    description: "Your description",
    descriptionKm: "ការពិពណ៌នារបស់អ្នក",
  },
};
```

### Adjust Randomness
```typescript
// In /src/lib/question-selector.ts

// Change time seed interval (default: 1 hour)
const hoursSinceEpoch = Math.floor(now / (1000 * 60 * 60));
// Change to 30 minutes:
const halfHoursSinceEpoch = Math.floor(now / (1000 * 60 * 30));
```

### Adjust Difficulty Balance
```typescript
// In /src/lib/question-selector.ts
// Default: 40% easy, 40% medium, 20% hard

const easyCount = Math.floor(questionCount * 0.4);
const mediumCount = Math.floor(questionCount * 0.4);
const hardCount = Math.floor(questionCount * 0.2);

// Change to 30% easy, 50% medium, 20% hard:
const easyCount = Math.floor(questionCount * 0.3);
const mediumCount = Math.floor(questionCount * 0.5);
const hardCount = Math.floor(questionCount * 0.2);
```

## 🐛 Troubleshooting

### Problem: Same questions appearing
```typescript
// Check if sessionTime is being passed
selectRandomQuestions({
  questions,
  questionCount,
  categoryIds,
  sessionTime: Date.now(), // ← Make sure this is included
});
```

### Problem: Uneven category distribution
```typescript
// Check if categoryIds array is correct
const categoryIds = [1, 2, 3]; // ← Should be array of numbers

// Check if questions have categoryId property
questions.map(q => ({
  ...q,
  categoryId: q.categoryId || 1, // ← Make sure this exists
}));
```

### Problem: Low uniqueness score
```typescript
// Increase question pool size
// Need at least 2x more questions than selection count
// Example: For 20 questions, need 40+ in pool
```

### Problem: Performance issues
```typescript
// Filter questions before selection
const filtered = questions.filter(q => 
  categoryIds.includes(q.categoryId) &&
  (difficulty === 'mixed' || q.difficulty === difficulty)
);

// Then select from filtered
selectRandomQuestions({
  questions: filtered, // ← Pre-filtered
  questionCount,
  categoryIds,
});
```

## 📊 Monitoring

### Check Randomness Quality
```typescript
// Generate multiple sessions
const sessions = [];
for (let i = 0; i < 10; i++) {
  sessions.push(selectRandomQuestions({
    questions,
    questionCount: 20,
    categoryIds: [1],
    sessionTime: Date.now() + i * 1000,
  }));
}

// Calculate average uniqueness
let totalUniqueness = 0;
let comparisons = 0;
for (let i = 0; i < sessions.length; i++) {
  for (let j = i + 1; j < sessions.length; j++) {
    totalUniqueness += calculateUniquenessScore(sessions[i], sessions[j]);
    comparisons++;
  }
}
const avgUniqueness = totalUniqueness / comparisons;
console.log(`Average uniqueness: ${avgUniqueness}%`);
// Should be > 70%
```

### Check Performance
```typescript
const startTime = Date.now();
const selected = selectRandomQuestions({
  questions,
  questionCount: 50,
  categoryIds: [1, 2, 3],
});
const endTime = Date.now();
console.log(`Selection took ${endTime - startTime}ms`);
// Should be < 100ms
```

### Check Category Distribution
```typescript
const selected = selectRandomQuestions({
  questions,
  questionCount: 30,
  categoryIds: [1, 2, 3],
});

const distribution = {};
selected.forEach(q => {
  distribution[q.categoryId] = (distribution[q.categoryId] || 0) + 1;
});
console.log('Distribution:', distribution);
// Should be roughly even: { 1: 10, 2: 10, 3: 10 }
```

## 🔍 Common Patterns

### Solo Game with Balanced Difficulty
```typescript
import { selectBalancedQuestions } from '@/lib/question-selector';

const selected = selectBalancedQuestions(
  questions,
  20,
  [1, 2, 3],
  user?.id
);
// Returns 40% easy, 40% medium, 20% hard
```

### Live Game with Same Questions for All
```typescript
// Generate once when session is created
const sessionQuestions = selectRandomQuestions({
  questions,
  questionCount: 20,
  categoryIds: [1, 2],
  userId: hostId,
  sessionTime: Date.now(),
});

// Store in database
await db.insert(gameSessions).values({
  questionIds: sessionQuestions.map(q => q.id),
  // ...
});

// All students get same questions from database
```

### Check if Two Sets are Different
```typescript
import { areQuestionSetsDifferent } from '@/lib/question-selector';

const set1 = selectRandomQuestions({ ... });
const set2 = selectRandomQuestions({ ... });

if (areQuestionSetsDifferent(set1, set2)) {
  console.log('✅ Questions are different');
} else {
  console.log('❌ Questions are the same');
}
```

## 📝 API Examples

### Solo Game API
```bash
POST /api/game/solo
Content-Type: application/json

{
  "categoryIds": [1, 2, 3],
  "difficulty": "mixed",
  "questionCount": 20,
  "timePerQuestion": 30,
  "gameMode": "mixed-practice",
  "targetGroup": "university"
}
```

### Live Game API
```bash
POST /api/game/sessions
Content-Type: application/json

{
  "categoryIds": [1, 2],
  "difficulty": "medium",
  "questionCount": 15,
  "timePerQuestion": 30,
  "scoringMode": "speed",
  "gameType": "quick-quiz",
  "maxPlayers": 30,
  "language": "both",
  "targetGroup": "university"
}
```

## 🎯 Best Practices

### DO ✅
- Always pass `sessionTime` for time-based variation
- Pass `userId` for user-specific variation
- Pre-filter questions before selection
- Use `selectBalancedQuestions` for difficulty balance
- Test randomness with `calculateUniquenessScore`
- Monitor performance with large question pools

### DON'T ❌
- Don't use Math.random() for question selection
- Don't select from unfiltered question pool
- Don't forget to shuffle answers within questions
- Don't cache selected questions client-side
- Don't expose session seeds to frontend
- Don't select more questions than available

## 🚨 Emergency Fixes

### Revert to Old Algorithm
```typescript
// In /src/app/api/game/solo/route.ts
// Comment out new algorithm:
// const selectedQuestions = selectRandomQuestions({ ... });

// Use old shuffle:
for (let i = targetedQuestions.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [targetedQuestions[i], targetedQuestions[j]] = 
    [targetedQuestions[j], targetedQuestions[i]];
}
const selectedQuestions = targetedQuestions.slice(0, questionCount);
```

### Disable User-Specific Variation
```typescript
// Pass undefined for userId
selectRandomQuestions({
  questions,
  questionCount,
  categoryIds,
  userId: undefined, // ← Disable user variation
  sessionTime: Date.now(),
});
```

### Disable Time-Based Variation
```typescript
// Pass fixed timestamp
selectRandomQuestions({
  questions,
  questionCount,
  categoryIds,
  userId: user?.id,
  sessionTime: 0, // ← Disable time variation
});
```

## 📞 Support

- **Documentation**: `/docs/RANDOM_QUIZ_ALGORITHM.md`
- **Tests**: `/src/test/question-selector.test.ts`
- **Code**: `/src/lib/question-selector.ts`

---

**Last Updated**: 2026-05-31  
**Version**: 2.0.0
