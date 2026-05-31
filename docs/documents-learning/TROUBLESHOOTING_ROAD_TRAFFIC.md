# Troubleshooting: Road Traffic Changes Not Visible

## Issue
Changes to road-traffic page (question numbering, randomization, save card) are not appearing in the browser.

## Root Causes & Solutions

### 1. Browser Cache
**Problem**: Browser is serving cached version of the page
**Solution**:
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux)
- Clear browser cache completely
- Open in incognito/private window
- Try different browser

### 2. Development Server Not Running
**Problem**: Changes only appear after rebuild/restart
**Solution**:
```bash
cd kesararam
npm run dev
# or
yarn dev
```
Then visit: `http://localhost:3000/learn/road-traffic`

### 3. Build Cache
**Problem**: Next.js build cache contains old version
**Solution**:
```bash
cd kesararam
rm -rf .next
npm run build
npm run dev
```

### 4. Deployment Not Updated
**Problem**: Production site hasn't been redeployed
**Solution**:
- Trigger new deployment on Vercel
- Check deployment status
- Wait for build to complete

## What Should Be Visible

### Question Numbering
- Each question should have a blue number (1, 2, 3, etc.) on the left
- Format: `1. Question text`
- Numbers update when randomization is toggled

### Randomization Button
- Located in filter bar next to "Reset" button
- Shows "Randomize Order" when in sequential mode
- Shows "Sequential Order" when in randomized mode
- Yellow background when active
- Shuffle icon visible

### Save Card Button
- Appears when you expand a question (click on it)
- Located at bottom of expanded answer panel
- Blue background (#blue-50)
- Shows "Save Card" text with download icon
- Generates PNG file when clicked

## Save Card Updates

### Yellow Sign Image Background
- Sign image area now has yellow (#ffd700) background
- No white background inside
- Maintains rounded corners (10px radius)

### QR Code
- QR code now appears in bottom-right corner
- Size: 120x120 pixels
- Shows "Scan to learn" label below
- Links to: https://www.kesararamwithdigital.tech/

### Promotional Message
- Khmer: រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត
- English: Protect your life and loved ones.
- English: Learn traffic signs, build safety knowledge for life

## Verification Steps

1. **Check Code Changes**
   ```bash
   git -C kesararam log --oneline -5
   # Should show recent commits with "question numbering" and "QR code"
   ```

2. **Verify Files Modified**
   ```bash
   git -C kesararam diff HEAD~2 src/components/learn/road-traffic-catalogue.tsx
   git -C kesararam diff HEAD~1 src/components/learn/save-card-button.tsx
   ```

3. **Check for TypeScript Errors**
   - Open VS Code
   - Check Problems panel
   - Should show no errors in road-traffic-catalogue.tsx

4. **Test in Browser DevTools**
   - Open DevTools (F12)
   - Go to Network tab
   - Reload page
   - Check that road-traffic-catalogue.tsx is loaded
   - Check Console for any errors

## File Locations

- **Road Traffic Component**: `kesararam/src/components/learn/road-traffic-catalogue.tsx`
- **Save Card Component**: `kesararam/src/components/learn/save-card-button.tsx`
- **Page File**: `kesararam/src/app/(public)/learn/road-traffic/page.tsx`

## Recent Commits

1. **Commit 860f2bb**: Added question numbering, randomization, save card
2. **Commit 605db7a**: Updated save card with yellow background and QR code

## If Still Not Working

1. Check browser console for JavaScript errors
2. Verify API is returning topics correctly
3. Check network requests in DevTools
4. Verify component is being imported correctly
5. Check for TypeScript compilation errors
6. Try clearing node_modules and reinstalling:
   ```bash
   cd kesararam
   rm -rf node_modules
   npm install
   npm run dev
   ```

## Expected Behavior

### On Page Load
- Blue header with "Road Traffic Law" title
- Search bar and filter pills
- "Randomize Order" button visible in filter bar
- Questions list below

### When Clicking a Question
- Question expands to show answer
- "Save Card" button appears at bottom
- Audio button available if audio URL exists

### When Clicking "Randomize Order"
- Button turns yellow
- Questions reorder randomly
- Question numbers update (1, 2, 3, etc.)
- Expanded panels close

### When Clicking "Save Card"
- Download starts
- File named: `{QUESTION_CODE}-KWD.png`
- Image shows:
  - Yellow background for question image
  - QR code in bottom-right
  - Promotional message in center
  - Question code and category tag

## Contact Support

If issues persist after trying all solutions:
1. Check git log for recent changes
2. Verify deployment status
3. Check server logs for errors
4. Review TypeScript diagnostics
