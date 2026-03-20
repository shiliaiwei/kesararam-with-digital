# Homepage Redesign - Street Cross-Section Hero

## Overview
A professional, high-fidelity 2D architectural street cross-section illustration designed for the homepage hero section. This design showcases a modern "Complete Street" layout with realistic vehicles, road markings, and urban planning elements.

## Features

### Visual Design
- **Clean white background** with gradient for depth
- **Professional architectural aesthetic** with flat-vector style
- **Realistic elements**: Cars, buses, cyclists, pedestrians, streetlights
- **Accurate road markings**: Lane dividers, arrows, stencils
- **Color-coded lanes**: Red for transit, green for bike lanes, gray for traffic
- **Underground layer**: Visible earth/soil beneath the road surface

### Street Layout (Left to Right)
1. **Left Sidewalk** - 9ft wide with pedestrian
2. **Left Parking** - 8ft with blue P sign and parked car
3. **Southbound Transit/Bike Lane** - 12ft red-tinted with bus and bike stencils
4. **Southbound Traffic** - Two 10ft lanes with downward arrows and vehicles
5. **Center Median** - 4ft with yellow-black diagonal hatching
6. **Northbound Left Turn Lane** - 10ft with curved arrow and vehicle
7. **Northbound Traffic** - Two 10ft lanes with upward arrows and vehicles
8. **Safety Buffer** - 2ft white-hatched zone
9. **Northbound Bike Lane** - 6ft green with bike stencil and cyclist
10. **Right Parking** - 8ft with blue P sign and parked car
11. **Right Sidewalk** - 9ft wide with pedestrian

### Responsive Design
- **Mobile-first approach** with horizontal scrolling for small screens
- **Tablet optimization** with scaled elements
- **Desktop full-width** display on large screens
- **Minimum width**: 1000px for street illustration
- **Flexible text sizing**: Scales from mobile to desktop

### Components

#### Main Components
- `EnhancedStreetHero` - Main hero section component
- `StreetCrossSectionHero` - Alternative simpler version

#### Element Components (`street-elements.tsx`)
- `RealisticCar` - Detailed car with windows, wheels, lights
- `RealisticBus` - Transit bus with route number and windows
- `RealisticCyclist` - Cyclist with bike and helmet
- `RealisticPedestrian` - Walking person with clothing details
- `StreetLight` - Curved streetlight with illumination
- `BikeStencil` - Road marking for bike lanes
- `BusStencil` - Road marking for transit lanes
- `ArrowDown` - Southbound traffic arrow
- `ArrowUp` - Northbound traffic arrow
- `LeftTurnArrow` - Turn lane indicator

## Technical Implementation

### Technologies
- **Next.js 16** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **SVG** for all illustrations (scalable, crisp)
- **Responsive utilities** for device adaptation

### File Structure
```
src/
├── app/(public)/home/
│   └── page.tsx                          # Homepage using new hero
├── components/hero/
│   ├── enhanced-street-hero.tsx          # Main hero component
│   ├── street-cross-section-hero.tsx     # Alternative version
│   ├── street-elements.tsx               # Reusable SVG elements
│   └── road-hero.tsx                     # Original hero (backup)
```

### Bilingual Support
- English and Khmer (Cambodian) language support
- Dynamic font switching for Khmer text
- Context-aware translations

## Usage

### Import and Use
```tsx
import { EnhancedStreetHero } from "@/components/hero/enhanced-street-hero";

export default function HomePage() {
  return (
    <>
      <EnhancedStreetHero />
      {/* Other content */}
    </>
  );
}
```

### Customization
All elements are modular and can be customized:

```tsx
// Custom car color
<RealisticCar x={100} y={80} color="#ff0000" />

// Custom cyclist shirt color
<RealisticCyclist x={200} y={85} color="#00ff00" />

// Custom pedestrian shirt
<RealisticPedestrian x={50} y={90} shirtColor="#0000ff" />
```

## Design Specifications

### Color Palette
- **Sidewalks**: `#e5e7eb` (zinc-200)
- **Parking**: `#d4d4d8` (zinc-300)
- **Transit Lane**: `#ef4444` with 40% opacity (red-400/40)
- **Traffic Lanes**: `#52525b` (zinc-600)
- **Bike Lane**: `#22c55e` with 50% opacity (green-500/50)
- **Median**: Yellow-black diagonal stripes
- **Underground**: Amber gradient (900-950)

### Typography
- **Labels**: 8-10px bold sans-serif
- **Measurements**: 12-14px black sans-serif
- **Headings**: 48-96px black, responsive
- **Body**: 16-20px medium, responsive

### Shadows & Depth
- **Hard shadows** beneath vehicles (40% black ellipses)
- **Border shadows** on lane sections
- **Drop shadows** on streetlights
- **Texture overlays** for realism

## Accessibility
- High contrast text on all backgrounds
- Clear visual hierarchy
- Semantic HTML structure
- Keyboard-navigable CTA buttons
- Screen reader friendly labels

## Performance
- **SVG optimization**: Inline SVGs for fast rendering
- **No external images**: All graphics are code-based
- **Minimal JavaScript**: Static rendering where possible
- **Lazy loading**: Components load on demand

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- [ ] Add animation for moving vehicles
- [ ] Interactive lane highlighting on hover
- [ ] Day/night mode toggle
- [ ] Seasonal variations (trees, weather)
- [ ] Accessibility audit improvements
- [ ] Performance optimization for mobile

## Credits
Design inspired by urban planning street cross-section diagrams and modern web design principles.

## License
Part of the KWD (Khmer Web Development) project.



help wwrite plan about this category  needed to input output frontent interface user, and what these category type of user could be learn from these exampple 




The system architecture manages input and output through a structured resource management workflow. First, the Road Signs category displays a 12-column grid layout where users can browse official Cambodian road signs. Each entry includes the sign's logo; clicking a sign opens a popup with detailed descriptions and bilingual audio support (Khmer and English).

This data feeds into various Game Modes, such as Flashcards, Quizzes, Practice Tests ( is for none user only they can test the knowledge without login but no record anyt thing like score and data they just do the quiz testing thire memory ), and Challenges. While staff members create the core content, teachers have the logic to customize these modes by selecting specific question types and difficulty levels for their students. To ensure quality, the system follows a strict administrative workflow: all content must be reviewed and approved by an Admin before it is published to the frontend.

let make it from frontent and backent and link to  all role what they can do.

so start build logical for input and output controll controol resoruce management conten: start first
-/road-traffic if user enter this category: user can see the question and answer q and a 
Study the legal framework governing road use and the responsibilities of all road users. Covers law articles, case studies, and structured Q&A.
Flashcards
Quiz
Practice Test
Challenge

-priority
Understand road priority rules through interactive scenarios and intersection diagrams. Learn who goes first and how to handle complex junctions safely.
 image reference to solve prompblem
Flashcards
Quiz
Practice Test
Challenge

-driving
Practical content to improve your driving technique. Covers manoeuvres, demonstrations, and a personal progress tracking system.
user see q and a 
Flashcards
Quiz
Practice Test
Challenge

-technical
Educational content about how vehicles work, safety features, and routine maintenance knowledge essential for safe driving.
 user see the question and answer q and a 
Flashcards
Quiz
Practice Test
Challenge
-loading-people-goods
Information on the safe loading of passengers and cargo, legal weight limits, and national transport regulations.

Flashcards
Quiz
Practice Test
Challenge
-general-knowledge
Covers broad driving and road safety topics. Essential knowledge not covered by specific categories, including useful reference documents and links.

Flashcards
Quiz
Practice Test
Challenge
-Emergency 
Emergency procedures, contact numbers, and protocols for handling road incidents. Know what to do in any urgent situation on Cambodian roads.

Flashcards
Quiz
Practice Test
Challenge

and what method to create quiz Flashcards
Quiz
Practice Test
Challenge  and how it store or link relationship and keep score correct make it all better method to learning  all these learning hub first and quiz or challeng later, 
all who controll these resource input output like staff teacher admin but i want to all input and ouput should be confirm by admin approve make sure admin check it correct data ouput, 