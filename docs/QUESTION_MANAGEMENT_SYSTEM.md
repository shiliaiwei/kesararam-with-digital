# Question Management System

## Overview
A comprehensive question creation and management system designed with psychological learning principles for the KWD driving education platform.

## System Architecture

### 1. **Hierarchical Structure**
```
8 Categories
  └─ Multiple Topics per Category
      └─ Multiple Questions per Topic
          └─ 2-5 Answers per Question
```

### 2. **8 Main Categories**
1. **Road Traffic** - Traffic rules and regulations
2. **Road Sign** - Traffic signs and their meanings
3. **Priority** - Right of way and priority rules
4. **Driving** - Driving techniques and skills
5. **Technical** - Vehicle technical knowledge
6. **Emergency** - Emergency procedures
7. **Loading People & Goods** - Loading regulations
8. **General Knowledge** - General driving knowledge

## Question Creation Form

### Step 1: Category & Topic Selection
- **Category Dropdown**: Select from 8 main categories
- **Topic Dropdown**: Dynamically filtered based on selected category
- **Smart Filtering**: Only shows approved topics
- **Visual Feedback**: Shows count of available topics

### Step 2: Question Type & Difficulty

#### Question Types (4 Types)
1. **Multiple Choice (MCQ)**
   - Single correct answer
   - 2-5 answer options
   - Best for: Knowledge recall, concept understanding

2. **True / False**
   - Binary choice
   - Exactly 2 options (auto-populated)
   - Best for: Quick fact verification, rule confirmation

3. **Multi-Select**
   - Multiple correct answers
   - 3-5 answer options
   - Best for: Complex scenarios, multiple valid approaches

4. **Image Matching**
   - Visual recognition
   - 2-4 options with images
   - Best for: Sign recognition, visual identification choose image one correct, and auto original url image with that topic slected and 3 other image randome next that qestion was made, and guide image is only in roads-signs and priority page, are avavlble for guse image ,

#### Difficulty Levels (3 Levels)
1. **Easy (Green)** - Basic recall and recognition
   - Simple facts
   - Direct questions
   - Clear answers

2. **Medium (Orange)** - Application and understanding
   - Scenario-based
   - Requires thinking
   - Context application

3. **Hard (Red)** - Analysis and critical thinking
   - Complex scenarios
   - Multiple factors
   - Decision making
for the score and point in live stream game mode is logical easy +1 for streak, hard +3 meduim +2 auto, and make it standard 
### Step 3: Question Content
- **Bilingual Support**: English + Khmer
- **Question Text**: Main question (required in English)
- **Learning Hint**: Optional hint to guide learners
- **Question Image**: Optional visual aid
- **Rich Text Support**: Clear, concise formatting

### Step 4: Answer Options
- **Dynamic Answers**: Add/remove based on question type
- **Visual Marking**: Green highlight for correct answers
- **Checkbox Selection**: Click to mark correct
- **Bilingual Answers**: English + Khmer support
- **Image Support**: For image-matching questions
- **Validation**: Ensures at least one correct answer

## Psychological Learning Principles

### 1. **Spaced Repetition**
- Questions linked to topics for organized review
- Difficulty progression from easy to hard
- Systematic coverage of all categories

### 2. **Active Recall**
- Multiple question types engage different memory systems
- Hints available but optional (promotes effort)
- Immediate feedback through correct/incorrect marking

### 3. **Cognitive Load Management**
- Clear visual hierarchy (numbered steps)
- Color-coded sections reduce mental effort
- Progressive disclosure (category → topic → question)

### 4. **Interleaving**
- Mix of question types within topics
- Varied difficulty levels
- Cross-category connections possible

### 5. **Elaborative Encoding**
- Hints provide context and connections
- Images enhance memory formation
- Bilingual support aids deeper understanding

### 6. **Metacognition**
- Difficulty levels help learners self-assess
- Question types match learning objectives
- Clear feedback on correctness

## Features

### Admin Controls
✅ **Easy Topic Linking**: Select category → topic in 2 clicks
✅ **Smart Filtering**: Only approved topics shown
✅ **Type-Based Validation**: Answer count matches question type
✅ **Visual Feedback**: Color-coded difficulty and types
✅ **Bulk Management**: Filter, search, and organize questions
✅ **Edit & Delete**: Full CRUD operations

### User Experience
✅ **Neo-Brutalism Design**: Bold, clear, accessible
✅ **Bilingual Interface**: English + Khmer throughout
✅ **Responsive Layout**: Works on all screen sizes
✅ **Keyboard Accessible**: Full keyboard navigation
✅ **Error Prevention**: Validation before submission

### Data Integrity
✅ **Required Fields**: Enforced validation
✅ **Type Safety**: TypeScript throughout
✅ **Database Relations**: Proper foreign keys
✅ **Status Tracking**: Draft, approved, rejected states

## API Endpoints

### Questions
- `GET /api/admin/questions` - List all questions with filters
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/[id]` - Update question
- `DELETE /api/admin/questions/[id]` - Delete question

### Topics
- `GET /api/admin/topics?status=approved` - Get approved topics
- `GET /api/admin/topics?categoryId=1` - Filter by category

### Categories
- `GET /api/categories` - List all categories

## Database Schema

### Questions Table
```sql
- id: serial (primary key)
- topic_id: integer (foreign key → topics)
- question_en: text (required)
- question_km: text
- hint_en: text
- hint_km: text
- image_url: text
- difficulty: text (easy/medium/hard)
- created_by: integer (foreign key → users)
- created_at: timestamp
```

### Answers Table
```sql
- id: serial (primary key)
- question_id: integer (foreign key → questions)
- answer_en: text (required)
- answer_km: text
- is_correct: boolean
- image_url: text
- sort_order: integer
- created_at: timestamp
```

## Best Practices

### Creating Effective Questions

1. **Clear and Concise**
   - Use simple language
   - One concept per question
   - Avoid double negatives

2. **Realistic Scenarios**
   - Base on real driving situations
   - Use practical examples
   - Include context when needed

3. **Balanced Difficulty**
   - Mix easy, medium, hard questions
   - Progress logically through topics
   - Challenge without frustrating

4. **Quality Distractors**
   - Wrong answers should be plausible
   - Avoid obvious incorrect options
   - Test understanding, not tricks

5. **Consistent Format**
   - Similar structure across questions
   - Predictable answer patterns
   - Professional language

## Usage Guide

### Creating a Question

1. **Click "Add Question"** button
2. **Select Category** (e.g., "Road Traffic")
3. **Select Topic** (e.g., "Speed Limits")
4. **Choose Question Type** (e.g., "Multiple Choice")
5. **Set Difficulty** (e.g., "Medium")
6. **Write Question** in English (and Khmer)
7. **Add Hint** (optional but recommended)
8. **Add Image** (if visual aid helps)
9. **Enter Answers** (2-5 options)
10. **Mark Correct Answer(s)**
11. **Click "Create Question"**

### Editing a Question

1. Click **Edit** icon on question row
2. Modify any fields
3. Click **Update Question**

### Filtering Questions

- **By Type**: Click question type buttons
- **By Difficulty**: Click difficulty level buttons
- **By Search**: Type in search box (searches question text and topic)

## Future Enhancements

- [ ] Question preview mode
- [ ] Bulk import from CSV
- [ ] Question templates
- [ ] AI-powered question suggestions
- [ ] Analytics on question performance
- [ ] Duplicate detection
- [ ] Version history
- [ ] Collaborative editing
- [ ] Question bank sharing

## Support

For questions or issues with the question management system, contact the development team or refer to the main documentation.

---

**Last Updated**: May 9, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
