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
