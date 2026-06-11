# Task 12: Topic Browse Panel & Pre-Selected Questions

## Status: ✅ Complete

## Overview
Added a topic browsing panel that allows admins to browse topics by category and directly add questions to specific topics. When adding a question from the topic panel, the category and topic are pre-selected and locked in the form.

## Features Added

### 1. **Browse Topics Button**
- New "Browse Topics" button in the header
- Toggles the topic list panel
- Blue background when active
- List icon indicator

### 2. **Topic List Panel**
Organized by category with:
- **Category Headers**: Gradient purple-to-pink background
- **Topic Count Badge**: Shows number of topics per category
- **Topic Cards**: Grid layout (2-4 columns responsive)
- **Question Count**: Shows existing questions per topic
- **Add Question Button**: Direct link to create question

### 3. **Topic Card Design**
Each topic card shows:
- **Book icon**: Visual indicator
- **Topic name**: English name (bold)
- **Topic code**: Unique identifier
- **Question count**: Blue badge with "X Q"
- **Add button**: Green text "+ Add Question"
- **Hover effect**: Yellow background + shadow

### 4. **Pre-Selected Topic Flow**
When clicking "Add Question" from topic card:
- Category dropdown is **disabled** (pre-filled)
- Topic dropdown is **disabled** (pre-filled)
- Green success message shows selected topic
- User proceeds directly to question type selection
- Cannot change category or topic

### 5. **Normal Flow (Add Question Button)**
When clicking main "Add Question" button:
- Category dropdown is **enabled**
- Topic dropdown is **enabled**
- User selects category first
- Topics filter by selected category
- Standard workflow

## UI Components

### Browse Topics Button
```tsx
<button
    onClick={() => setShowTopicList(!showTopicList)}
    className={showTopicList ? "bg-blue-400" : "bg-white"}
>
    <List size={20} />
    {showTopicList ? "Hide Topics" : "Browse Topics"}
</button>
```

### Topic List Panel
```tsx
{showTopicList && (
    <div className="bg-white border-4 border-black p-6">
        <h2>Browse Topics by Category</h2>
        {categories.map((category) => {
            const categoryTopics = topics.filter(t => t.categoryId === category.id);
            return (
                <div key={category.id}>
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400">
                        <FolderTree />
                        <h3>{category.titleEn}</h3>
                        <span>{categoryTopics.length} topics</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {categoryTopics.map((topic) => (
                            <button onClick={() => handleAddQuestionToTopic(topic)}>
                                <BookOpen />
                                <span>{questionCount} Q</span>
                                <div>{topic.nameEn}</div>
                                <div>{topic.topicCode}</div>
                                <span>+ Add Question</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
)}
```

### Pre-Selected Topic Indicator
```tsx
{isTopicPreSelected && (
    <div className="p-3 bg-green-100 border-2 border-green-400">
        <p className="text-green-800">
            <CheckCircle size={16} />
            Topic pre-selected: <span>{preSelectedTopic.nameEn}</span>
        </p>
    </div>
)}
```

### Disabled Dropdowns
```tsx
<select
    value={selectedCategory || ""}
    disabled={isTopicPreSelected}
    className="disabled:bg-gray-100 disabled:cursor-not-allowed"
>
    {/* options */}
</select>
```

## Technical Implementation

### State Management
```typescript
const [topics, setTopics] = useState<any[]>([]);
const [showTopicList, setShowTopicList] = useState(false);
const [selectedTopicForQuestion, setSelectedTopicForQuestion] = useState<any | null>(null);
```

### Topic Fetching
```typescript
const fetchTopics = async () => {
    const res = await fetch("/api/admin/topics?status=approved");
    const data = await res.json();
    setTopics(Array.isArray(data.topics) ? data.topics : []);
};
```

### Topic Selection Handler
```typescript
const handleAddQuestionToTopic = (topic: any) => {
    setSelectedTopicForQuestion(topic);
    setShowCreateModal(true);
    setShowTopicList(false);
};
```

### Modal Close Handler
```typescript
const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingQuestion(null);
    setSelectedTopicForQuestion(null); // Clear pre-selection
};
```

### Form Modal Props
```typescript
interface QuestionFormModalProps {
    initialData?: any;
    preSelectedTopic?: any; // NEW
    onClose: () => void;
    onSuccess: () => void;
}
```

### Pre-Selection Logic
```typescript
const [selectedCategory, setSelectedCategory] = useState<number | null>(
    preSelectedTopic?.categoryId || null
);
const [selectedTopic, setSelectedTopic] = useState<number | null>(
    preSelectedTopic?.id || null
);
const isTopicPreSelected = !!preSelectedTopic;
```

## User Workflows

### Workflow 1: Browse and Add Question
1. Click "Browse Topics" button
2. Topic panel opens showing all categories
3. Find desired category (e.g., "Road Traffic")
4. See all topics in that category
5. Click "+ Add Question" on specific topic
6. Form opens with category and topic pre-selected
7. Fill in question details
8. Submit question

### Workflow 2: Direct Add Question
1. Click "Add Question" button (main)
2. Form opens with empty category/topic
3. Select category from dropdown
4. Select topic from filtered list
5. Fill in question details
6. Submit question

### Workflow 3: View Topic Questions
1. Click "Browse Topics"
2. See question count badge on each topic
3. Identify topics needing more questions
4. Click to add questions to those topics

## Visual Design

### Color Scheme
- **Browse Button Active**: Blue (#60a5fa)
- **Category Header**: Purple-to-pink gradient
- **Topic Card Hover**: Yellow (#fef3c7)
- **Question Count Badge**: Blue (#dbeafe)
- **Pre-Selected Alert**: Green (#d1fae5)
- **Add Button Text**: Green (#16a34a)

### Layout
- **Topic Grid**: 2 columns (mobile) → 4 columns (desktop)
- **Responsive**: Flex-wrap for all screen sizes
- **Spacing**: 3-4 unit gaps between elements
- **Borders**: 2px black (Neo-Brutalism)
- **Shadows**: 3px on hover

### Icons Used
- `List` - Browse Topics button
- `FolderTree` - Category headers
- `BookOpen` - Topic cards
- `CheckCircle` - Pre-selected indicator
- `Plus` - Add Question button

## Benefits

### For Admins
✅ **Quick Navigation**: Browse all topics at once
✅ **Visual Organization**: See topics grouped by category
✅ **Question Distribution**: See which topics need questions
✅ **Fast Workflow**: Click topic → add question
✅ **No Mistakes**: Pre-selected topics prevent errors

### For System
✅ **Better Organization**: Questions properly linked to topics
✅ **Data Integrity**: Locked selections prevent mismatches
✅ **User Experience**: Intuitive workflow
✅ **Scalability**: Handles many topics efficiently

### For Content Quality
✅ **Balanced Coverage**: Easy to see gaps
✅ **Topic Focus**: Questions stay on-topic
✅ **Systematic Creation**: Organized approach
✅ **Quality Control**: Admin reviews per topic

## Database Queries

### Fetch Approved Topics
```sql
SELECT 
    t.id,
    t.topic_code as "topicCode",
    t.name_en as "nameEn",
    t.name_km as "nameKm",
    t.category_id as "categoryId",
    c.title_en as "categoryName"
FROM topics t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.status = 'approved'
ORDER BY c.sort_order, t.sort_order, t.name_en
```

### Count Questions Per Topic
```typescript
const questionCount = questions.filter(q => q.topicId === topic.id).length;
```

## Edge Cases Handled

### No Topics in Category
- Category header not shown if no topics
- Prevents empty sections

### No Approved Topics
- Shows message in dropdown
- Prevents form submission without topic

### Pre-Selected Topic Deleted
- Form validates topic still exists
- Shows error if topic unavailable

### Modal Close
- Clears pre-selected topic state
- Resets form to normal mode

## Testing Checklist

- [x] Browse Topics button toggles panel
- [x] Topics grouped by category correctly
- [x] Question count displays accurately
- [x] Click topic opens form with pre-selection
- [x] Category dropdown disabled when pre-selected
- [x] Topic dropdown disabled when pre-selected
- [x] Green alert shows selected topic
- [x] Normal "Add Question" still works
- [x] Modal close clears pre-selection
- [x] Responsive grid layout works
- [x] Hover effects work correctly
- [x] Icons render properly (no emojis)

## Future Enhancements

- [ ] Search/filter topics in panel
- [ ] Sort topics by question count
- [ ] Bulk add questions to multiple topics
- [ ] Topic statistics (avg difficulty, types)
- [ ] Quick edit topic from panel
- [ ] Drag-and-drop question assignment
- [ ] Topic templates
- [ ] Clone questions between topics
- [ ] Topic completion percentage
- [ ] Recommended topics (low question count)

## API Endpoints Used

### Get Approved Topics
```
GET /api/admin/topics?status=approved
```

**Response:**
```json
{
    "topics": [
        {
            "id": 1,
            "topicCode": "RT-001",
            "nameEn": "Speed Limits",
            "nameKm": "ល្បឿនកំណត់",
            "categoryId": 1,
            "categoryName": "Road Traffic"
        }
    ],
    "total": 1
}
```

### Get Categories
```
GET /api/categories
```

**Response:**
```json
{
    "categories": [
        {
            "id": 1,
            "slug": "road-traffic",
            "titleEn": "Road Traffic"
        }
    ]
}
```

## Component Props

### QuestionManagementPanel
```typescript
// No props - standalone component
```

### QuestionFormModal
```typescript
interface QuestionFormModalProps {
    initialData?: any;           // For editing existing question
    preSelectedTopic?: any;      // NEW: Pre-selected topic from browse
    onClose: () => void;         // Close modal handler
    onSuccess: () => void;       // Success callback
}
```

## State Flow

### Normal Flow
```
User clicks "Add Question"
  ↓
Modal opens
  ↓
preSelectedTopic = null
  ↓
Category dropdown enabled
  ↓
User selects category
  ↓
Topic dropdown enabled
  ↓
User selects topic
  ↓
Continue with question
```

### Pre-Selected Flow
```
User clicks topic card
  ↓
handleAddQuestionToTopic(topic)
  ↓
setSelectedTopicForQuestion(topic)
  ↓
Modal opens
  ↓
preSelectedTopic = topic
  ↓
Category pre-filled & disabled
  ↓
Topic pre-filled & disabled
  ↓
Green alert shown
  ↓
Continue with question
```

## Performance Considerations

### Topic Loading
- Fetched once on component mount
- Cached in state
- No re-fetch on panel toggle

### Question Counting
- Calculated client-side from existing data
- No additional API calls
- Efficient filter operations

### Grid Rendering
- CSS Grid for optimal layout
- Responsive breakpoints
- Lazy rendering possible for 100+ topics

## Accessibility

### Keyboard Navigation
- All buttons keyboard accessible
- Tab order logical
- Enter key activates buttons

### Screen Readers
- Descriptive button labels
- ARIA labels on icons
- Semantic HTML structure

### Visual Feedback
- Clear hover states
- Disabled state styling
- Color + text indicators

## Migration Notes

### No Database Changes Required
- Uses existing topics table
- Uses existing questions table
- No schema modifications needed

### Backward Compatible
- Existing "Add Question" flow unchanged
- New feature is additive
- No breaking changes

---

**Completed**: May 9, 2026
**Status**: Production Ready ✅
**No Emojis**: Confirmed ✅
**Icons**: Lucide React Only ✅
**Responsive**: Mobile-First ✅
