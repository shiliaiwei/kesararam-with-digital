# TODO: Complete Q&A System Implementation

## ✅ Completed
- [x] Create QAContentGrid component
- [x] Create QAContentManagement admin component
- [x] Create QAContentForm with Cloudinary integration
- [x] Implement admin API routes (CRUD + approval)
- [x] Add comprehensive documentation
- [x] Test build compilation

## 🔄 Next Steps

### 1. Get Category IDs from Database
Run this query to get the correct category IDs:
```sql
SELECT id, slug, title_en, title_km FROM categories ORDER BY id;
```

Save the results for reference.

### 2. Update Public Category Pages

Update each category page to use the QAContentGrid component:

#### Road Traffic
```tsx
// src/app/(public)/road-traffic/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function RoadTrafficPage() {
  return (
    <CategoryPageShell
      slug="road-traffic"
      titleEn="Road Traffic"
      titleKh="ចរាចរណ៍ផ្លូវ"
      descEn="Study the legal framework governing road use and the responsibilities of all road users."
    >
      <QAContentGrid categorySlug="road-traffic" />
    </CategoryPageShell>
  );
}
```

#### Priority
```tsx
// src/app/(public)/priority/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function PriorityPage() {
  return (
    <CategoryPageShell
      slug="priority"
      titleEn="Priority Rules"
      titleKh="ច្បាប់អាទិភាព"
      descEn="Understand road priority rules through interactive scenarios and intersection diagrams."
    >
      <QAContentGrid categorySlug="priority" />
    </CategoryPageShell>
  );
}
```

#### Driving
```tsx
// src/app/(public)/driving/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function DrivingPage() {
  return (
    <CategoryPageShell
      slug="driving"
      titleEn="Driving Techniques"
      titleKh="បច្ចេកទេសបើកបរ"
      descEn="Practical content to improve your driving technique. Covers manoeuvres and demonstrations."
    >
      <QAContentGrid categorySlug="driving" />
    </CategoryPageShell>
  );
}
```

#### Technical
```tsx
// src/app/(public)/technical/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function TechnicalPage() {
  return (
    <CategoryPageShell
      slug="technical"
      titleEn="Technical Knowledge"
      titleKh="ចំណេះដឹងបច្ចេកទេស"
      descEn="Educational content about how vehicles work, safety features, and routine maintenance."
    >
      <QAContentGrid categorySlug="technical" />
    </CategoryPageShell>
  );
}
```

#### Loading People & Goods
```tsx
// src/app/(public)/loading-people-goods/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function LoadingPage() {
  return (
    <CategoryPageShell
      slug="loading-people-goods"
      titleEn="Loading People & Goods"
      titleKh="ផ្ទុកមនុស្ស និងទំនិញ"
      descEn="Information on safe loading of passengers and cargo, legal weight limits, and transport regulations."
    >
      <QAContentGrid categorySlug="loading-people-goods" />
    </CategoryPageShell>
  );
}
```

#### General Knowledge
```tsx
// src/app/(public)/general-knowledge/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function GeneralKnowledgePage() {
  return (
    <CategoryPageShell
      slug="general-knowledge"
      titleEn="General Knowledge"
      titleKh="ចំណេះដឹងទូទៅ"
      descEn="Covers broad driving and road safety topics. Essential knowledge and useful reference documents."
    >
      <QAContentGrid categorySlug="general-knowledge" />
    </CategoryPageShell>
  );
}
```

#### Emergency
```tsx
// src/app/(public)/emergency/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function EmergencyPage() {
  return (
    <CategoryPageShell
      slug="emergency"
      titleEn="Emergency Procedures"
      titleKh="នីតិវិធីបន្ទាន់"
      descEn="Emergency procedures, contact numbers, and protocols for handling road incidents."
    >
      <QAContentGrid categorySlug="emergency" />
    </CategoryPageShell>
  );
}
```

### 3. Create Admin Management Pages

Create admin pages for each category (use the category IDs from step 1):

#### Road Traffic Admin
```tsx
// src/app/(dashboard)/admin/content/road-traffic/page.tsx
import { Metadata } from "next";
import { QAContentManagement } from "@/components/admin/qa-content-management";

export const metadata: Metadata = {
  title: "Road Traffic Content | Admin",
  description: "Manage road traffic Q&A content",
};

export default function RoadTrafficAdminPage() {
  return (
    <QAContentManagement
      categorySlug="road-traffic"
      categoryId={2} // Replace with actual ID from database
      categoryTitle="Road Traffic"
    />
  );
}
```

Repeat for all other categories:
- priority → `/admin/content/priority/page.tsx`
- driving → `/admin/content/driving/page.tsx`
- technical → `/admin/content/technical/page.tsx`
- loading-people-goods → `/admin/content/loading-people-goods/page.tsx`
- general-knowledge → `/admin/content/general-knowledge/page.tsx`
- emergency → `/admin/content/emergency/page.tsx`

### 4. Test the System

#### Test Public Pages
1. Visit each category page
2. Verify empty state shows correctly
3. Add test content via admin
4. Verify content appears on public page

#### Test Admin Dashboard
1. Login as admin
2. Visit admin content page for each category
3. Create new Q&A content
4. Test Cloudinary image browser
5. Test audio URL input
6. Save content

#### Test Approval Workflow
1. Login as staff
2. Create new content
3. Verify status is "pending"
4. Login as admin
5. Approve the content
6. Verify it appears on public page
7. Test rejection workflow

### 5. Add Sample Content

For each category, create at least 5-10 sample Q&A items:

**Example for Road Traffic:**
```json
{
  "questionEn": "What is the speed limit in urban areas of Cambodia?",
  "questionKm": "តើល្បឿនកំណត់ក្នុងតំបន់ទីក្រុងនៃប្រទេសកម្ពុជាគឺប៉ុន្មាន?",
  "answerEn": "The speed limit in urban areas is 40 km/h. This limit is enforced to ensure the safety of pedestrians and other road users in densely populated areas.",
  "answerKm": "ល្បឿនកំណត់ក្នុងតំបន់ទីក្រុងគឺ ៤០ គីឡូម៉ែត្រក្នុងមួយម៉ោង។ ការកំណត់នេះត្រូវបានអនុវត្តដើម្បីធានាសុវត្ថិភាពរបស់អ្នកថ្មើរជើង និងអ្នកប្រើប្រាស់ផ្លូវផ្សេងទៀតក្នុងតំបន់ដែលមានប្រជាជនច្រើន។",
  "difficulty": "easy",
  "subtopic": "Speed Limits",
  "scorePoints": 10,
  "timeLimit": 30
}
```

### 6. Configure Cloudinary

1. Organize folders in Cloudinary:
   - `/road-traffic/`
   - `/priority/`
   - `/driving/`
   - `/technical/`
   - `/loading-people-goods/`
   - `/general-knowledge/`
   - `/emergency/`

2. Upload sample images for each category

3. Test image selection in admin form

### 7. Final Testing

- [ ] All public pages display correctly
- [ ] Admin pages work for all categories
- [ ] Content creation works
- [ ] Approval workflow functions
- [ ] Images load from Cloudinary
- [ ] Audio playback works
- [ ] Bilingual content displays
- [ ] Search and filters work
- [ ] Mobile responsive

### 8. Documentation

- [ ] Update README with Q&A system info
- [ ] Create content creation guidelines
- [ ] Document Cloudinary setup
- [ ] Add troubleshooting guide

## 📝 Notes

- The `contentItems` table already supports Q&A content
- No database migration needed
- All API routes use existing authentication
- Cloudinary integration uses existing component
- System follows same pattern as traffic signs

## 🚀 Deployment

Once testing is complete:
```bash
npm run build
git add .
git commit -m "feat: update all category pages with Q&A system"
git push origin docs
```

## 📞 Support

If you encounter issues:
1. Check QA_CONTENT_SYSTEM.md for detailed documentation
2. Review QA_IMPLEMENTATION_SUMMARY.md for quick reference
3. Test API endpoints with curl
4. Check browser console for errors
5. Verify database connections
