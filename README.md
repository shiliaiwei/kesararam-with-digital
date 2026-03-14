# KWD — Kesararam With Digital

Cambodian driving knowledge and licensing education platform. Master traffic signs, road laws, and driving theory.

## Design System

### Design Philosophy: Neo-Brutalism

The website follows a neo-brutalist design approach inspired by road markings and traffic safety aesthetics. This creates a bold, functional, and highly accessible interface.

### Core Visual Principles

- **No border-radius**: Sharp corners only (border-radius: 0)
- **No gradients**: Solid colors exclusively
- **Bold borders**: Minimum 2px black borders on all elements
- **Hard shadows**: Offset box-shadows (no blur) for depth
- **High contrast**: Black borders on white/colored backgrounds
- **No emoji**: Text-only labels and descriptions

### Shape & Structure

#### Border System
```css
/* Standard border */
border: 2px solid #000000

/* Component borders */
border-2 border-black        /* All interactive elements */
border-2 border-[#a8a8a8]    /* Neutral/disabled states */
border-2 border-[#ef4444]    /* Alert/caution states */
```

#### Shadow System (Hard Shadows)
```css
/* Neo-brutalism shadows - no blur, pure offset */
shadow-[2px_2px_0_#000]      /* Small - buttons, badges */
shadow-[3px_3px_0_#000]      /* Medium - cards, inputs */
shadow-[4px_4px_0_#000]      /* Large - main cards, modals */
shadow-[6px_6px_0_#000]      /* XL - hero elements */
shadow-[8px_8px_0_#000]      /* XXL - featured content */
```

#### Interactive States
```css
/* Hover: Lift effect */
hover:-translate-x-0.5 hover:-translate-y-0.5
hover:shadow-[4px_4px_0_#000]

/* Active: Press down effect */
active:translate-x-[2px] active:translate-y-[2px]
active:shadow-none
```

### Color Palette

#### Traffic-Light Semantic Colors
Inspired by road safety and traffic signals:

```css
--kwd-yellow: #ffd700    /* Primary/Warning - Road signs */
--kwd-blue: #3b82f6      /* Info/Signals - Traffic lights */
--kwd-red: #ff0050       /* Danger/Stop - Stop signs */
--kwd-green: #006747     /* Success/Go - Active states */
--kwd-orange: #f97316    /* Caution - Warning zones */
--kwd-cyan: #06b6d4      /* Accent - Highlights */
--kwd-purple: #a855f7    /* Special - Premium features */
--kwd-rose: #fda4af      /* Alert background */
```

#### Neutral Grays
```css
--kwd-gray-dark: #374151
--kwd-gray-mid: #8e8e8e
--kwd-gray-light: #d1d5db
```

### Road Marking Categories

#### 1. Curbs Markings
Edge line and curb delineation markings
```css
border: 2px solid #a8a8a8
box-shadow: 4px 4px 0 #000
background: #ffffff
accent: #006747 (active states)
```

#### 2. Signals Markings
Stop lines, pedestrian crossings, signal zones
```css
border: 2px solid #a8a8a8
box-shadow: 4px 4px 0 #000
highlight: #3b82f6 (signal indicators)
```

#### 3. Longitudinal Markings
Center lines, lane dividers, caution zones
```css
border: 2px solid #a8a8a8
box-shadow: 4px 4px 0 #000
warning: #f97316 (caution zones)
```

#### 4. Caution Border
Alert and warning states
```css
border: 2px solid #ef4444
box-shadow: 4px 4px 0 #000
background: #fda4af (alerts)
```

### Typography

#### Font Families
```css
/* Khmer fonts */
--font-kh-header: "Kantumruy Pro", sans-serif  /* Headers, bold text */
--font-kh-body: "Siemreap", sans-serif         /* Body text */

/* Latin fonts */
--font-sans: Inter, sans-serif                  /* Default */
```

#### Font Weights & Styles
- Headers: font-black (900) with uppercase and tight tracking
- Body: font-medium (500) to font-bold (700)
- Labels: font-bold (700) with uppercase

### Background Patterns

#### Grid Background
```css
.grid-bg {
  background-image: 
    linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

#### Dot Background
```css
.dot-bg {
  background-image: radial-gradient(
    circle, 
    rgba(59, 130, 246, 0.18) 1px, 
    transparent 1px
  );
  background-size: 24px 24px;
}
```

#### Caution Tape
```css
.caution-tape {
  background: repeating-linear-gradient(
    -45deg,
    #eab308 0px, #eab308 12px,
    #000000 12px, #000000 24px
  );
  height: 6px;
}
```

### Component Patterns

#### Neo-Brutalist Card
```tsx
<div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] 
                hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] 
                transition-all duration-100">
  {/* Content */}
</div>
```

#### Neo-Brutalist Button
```tsx
<button className="px-4 py-2 border-2 border-black bg-yellow-400 
                   shadow-[3px_3px_0_#000] font-black uppercase 
                   hover:bg-black hover:text-white 
                   active:translate-x-[2px] active:translate-y-[2px] 
                   active:shadow-none transition-all">
  Click Me
</button>
```

#### Badge/Tag
```tsx
<span className="inline-block px-3 py-1 border-2 border-black 
                 bg-cyan-400 shadow-[2px_2px_0_#000] 
                 text-xs font-black uppercase tracking-widest">
  Label
</span>
```

### Layout Structure

#### Dashboard Theme
```css
.kwd-dash {
  --background: #1e2430      /* Dark blue-gray */
  --foreground: #f0f2f5      /* Light text */
  --primary: #ffd700         /* Yellow accent */
  --card: #252d3d            /* Card background */
  --sidebar: #1a2035         /* Sidebar dark */
}
```

#### Spacing System
- Consistent use of Tailwind spacing scale
- Gap utilities: gap-2, gap-4, gap-6
- Padding: p-4, p-5, p-6 for cards
- Margins: Minimal, prefer gap/space utilities

### Accessibility Features

- High contrast ratios (black borders on colored backgrounds)
- Clear focus states with ring utilities
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support

### Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4 with custom utilities
- **UI Components**: shadcn/ui (base-nova style)
- **Icons**: Lucide React
- **Database**: Drizzle ORM with Neon PostgreSQL
- **Media**: Cloudinary
- **Internationalization**: next-intl (EN/KH)

### File Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin panel
│   │   └── teacher/        # Teacher panel
│   ├── (public)/           # Public pages
│   └── globals.css         # Global styles & tokens
├── components/
│   ├── ui/                 # Base UI components
│   ├── dashboard/          # Dashboard-specific
│   ├── shared/             # Shared components
│   └── categories/         # Category components
└── lib/                    # Utilities & helpers
```

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Design Guidelines Summary

1. **Always use 2px black borders** on interactive elements
2. **Apply hard shadows** (no blur) for depth perception
3. **Keep corners sharp** - no border-radius
4. **Use traffic-light colors** for semantic meaning
5. **Maintain high contrast** for accessibility
6. **Apply hover/active states** with translate + shadow changes
7. **Use uppercase + bold** for emphasis
8. **No gradients or emoji** - keep it brutalist
