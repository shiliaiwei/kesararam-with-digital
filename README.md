# KWD — Kesararam With Digital

Cambodian driving knowledge and licensing education platform. Master traffic signs, road laws, and driving theory.

## Design System

### Design Philosophy: Neo-Brutalism

The website follows a neo-brutalist design approach inspired by road markings and traffic safety aesthetics. This creates a bold, functional, and highly accessible interface that mirrors the clarity and directness of road signage.

### Core Visual Principles

- **Sharp corners only**: border-radius: 0 (enforced with inline styles)
- **No gradients**: Solid colors exclusively
- **Bold black borders**: 2px standard, 4px for emphasis
- **Hard shadows**: Offset box-shadows with no blur
- **High contrast**: Black borders on white/colored backgrounds
- **No emoji**: Text-only labels and descriptions
- **Traffic-light colors**: Semantic color system inspired by road safety

### Shape & Structure

#### Border System
```css
/* Standard borders */
border-2 border-black           /* Default for all interactive elements */
border-4 border-black           /* Emphasis (hero cards, featured content) */
border-2 border-yellow-400      /* Yellow accent borders */

/* Caution borders */
border-2 border-[ #ef4444 ]       /* Alert/warning states */
border-b-4 border-yellow-400    /* Section dividers */
```

#### Corner Radius
```tsx
/* Always sharp corners - enforced with inline styles */
style={{ borderRadius: "0px" }}
className="rounded-none"
```

#### Shadow System (Hard Shadows)
```css
/* Neo-brutalism shadows - no blur, pure offset */
shadow-[2px_2px_0_#000]         /* Small - badges, tags, icons */
shadow-[3px_3px_0_#000]         /* Medium - inputs, small cards */
shadow-[4px_4px_0_#000]         /* Large - standard cards, buttons */
shadow-[6px_6px_0_#000]         /* XL - hover states, emphasis */
shadow-[8px_8px_0_#000]         /* XXL - hero elements, featured cards */

/* Colored shadows for specific contexts */
shadow-[4px_4px_0_#eab308]      /* Yellow shadow for CTAs */
shadow-[6px_6px_0_#eab308]      /* Yellow shadow hover state */
```

#### Interactive States
```css
/* Hover: Lift effect */
hover:-translate-x-0.5 hover:-translate-y-0.5
hover:shadow-[6px_6px_0_#000]
hover:-translate-x-1 hover:-translate-y-1
hover:shadow-[8px_8px_0_#000]

/* Active: Press down effect */
active:translate-x-[2px] active:translate-y-[2px]
active:shadow-none

/* Color transitions */
hover:bg-black hover:text-white
transition-all duration-100
transition-all duration-150
```

### Color Palette

#### Traffic-Light Semantic Colors
Inspired by road safety and traffic signals:

```css
/* Primary colors */
--kwd-yellow: #eab308          /* Primary/Warning - Road signs, CTAs */
--kwd-blue: #3b82f6            /* Info/Signals - Traffic lights, links */
--kwd-green: #22c55e           /* Success/Go - Active states, confirmations */
--kwd-red: #ef4444             /* Danger/Stop - Alerts, errors */
--kwd-orange: #f97316          /* Caution - Warning zones, attention */

/* Accent colors */
--kwd-cyan: #06b6d4            /* Accent - Highlights, decorative */
--kwd-purple: #a855f7          /* Special - Premium features, mixed modes */
--kwd-rose: #fda4af            /* Alert background - Soft warnings */



#### Color Usage Patterns

```tsx
/* Hero sections */
bg-yellow-400 border-b-2 border-black

/* Game mode cards */
bg-white border-2 border-black shadow-[4px_4px_0_#000]

/* CTAs */
bg-black text-white border-2 border-black shadow-[4px_4px_0_#000]
bg-yellow-400 text-black border-2 border-yellow-400 shadow-[4px_4px_0_#eab308]

/* Badges */
bg-black text-white px-3 py-1.5 rounded-none
bg-yellow-400 text-black border-2 border-black

/* Icon containers */
border-2 border-black shadow-[2px_2px_0_#000]
style={{ backgroundColor: color }} /* Dynamic color per category */
```

### Typography

#### Font Families
```css
/* Khmer fonts */
--font-kh-header: "Kantumruy Pro", sans-serif  /* Headers, bold text */
--font-kh-body: "Siemreap", sans-serif         /* Body text, paragraphs */

/* Latin fonts */
--font-sans: Inter, sans-serif                  /* Default sans-serif */
```

#### Font Weights & Styles
```css
/* Headers */
font-black (900)                /* Primary headings */
uppercase                       /* All caps for emphasis */
tracking-tighter                /* Tight letter spacing for large text */
tracking-widest                 /* Wide spacing for small labels */

/* Body text */
font-medium (500)               /* Regular body text */
font-bold (700)                 /* Emphasized text, labels */
leading-none                    /* Tight line height for headings */
leading-relaxed                 /* Comfortable reading for paragraphs */

/* Labels & badges */
text-xs font-black uppercase tracking-widest
text-sm font-bold uppercase
```

#### Typography Scale
```tsx
/* Headings */
text-7xl font-black             /* Hero titles (mobile: text-5xl) */
text-5xl font-black             /* Page titles */
text-4xl font-black             /* Section titles */
text-3xl font-black             /* Subsection titles */
text-2xl font-black             /* Card titles */
text-xl font-black              /* Small card titles */

/* Body */
text-lg                         /* Large body text, descriptions */
text-sm                         /* Standard body text */
text-xs                         /* Small text, labels */
text-[10px]                     /* Micro text, metadata */
text-[11px]                     /* Tiny labels */
```

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
```tsx
/* Decorative warning pattern */
<div className="h-1.5 bg-[repeating-linear-gradient(-45deg,#eab308_0px,#eab308_12px,#000000_12px,#000000_24px)]" />
```

### Component Patterns

#### Hero Section
```tsx
<section className="bg-yellow-400 border-b-2 border-black py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="inline-block bg-black text-white text-xs font-black 
                    tracking-widest uppercase px-3 py-1.5 rounded-none">
      Label
    </div>
    <h1 className="text-5xl md:text-7xl font-black text-black leading-none">
      Title
    </h1>
    <p className="text-lg text-black/70 max-w-lg leading-relaxed">
      Description text
    </p>
  </div>
</section>
```

#### Neo-Brutalist Card
```tsx
<div className="bg-white border-2 border-black rounded-none p-6 
                shadow-[4px_4px_0_#000] 
                hover:shadow-[8px_8px_0_#000] 
                hover:-translate-x-1 hover:-translate-y-1 
                transition-all duration-150">
  {/* Content */}
</div>
```


#### Button Variants
```tsx
/* Primary CTA */
<button className="px-6 py-3 bg-black text-white font-black 
                   border-2 border-black rounded-none 
                   shadow-[4px_4px_0_#000] 
                   hover:shadow-[6px_6px_0_#000] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Click Me
</button>

/* Secondary CTA */
<button className="px-6 py-3 bg-white text-black font-black 
                   border-2 border-black rounded-none 
                   shadow-[4px_4px_0_#000] 
                   hover:shadow-[6px_6px_0_#000] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Click Me
</button>

/* Yellow accent CTA */
<button className="px-8 py-4 bg-yellow-400 text-black font-black 
                   border-2 border-yellow-400 rounded-none 
                   shadow-[4px_4px_0_#eab308] 
                   hover:shadow-[6px_6px_0_#eab308] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Start Now
</button>

/* Small action button */
<button className="px-3 py-1.5 text-xs font-black uppercase 
                   tracking-widest border-2 border-black 
                   bg-white text-black shadow-[2px_2px_0_#000] 
                   hover:bg-black hover:text-white 
                   active:shadow-none active:translate-x-[2px] 
                   active:translate-y-[2px] transition-colors">
  Action
</button>
```

#### Badge/Tag
```tsx
/* Black badge */
<span className="inline-block bg-black text-white text-xs font-black 
                 tracking-widest uppercase px-3 py-1.5 rounded-none">
  Label
</span>

/* Colored badge with border */
<span className="text-[10px] font-black tracking-widest uppercase 
                 px-2.5 py-1 border-2 border-black rounded-none"
      style={{ backgroundColor: color }}>
  Badge
</span>

/* Small tag */
<span className="px-1.5 py-0.5 text-[10px] font-black uppercase 
                 border border-black bg-black text-white">
  Tag
</span>
```

#### Icon Container
```tsx
<div className="w-12 h-12 border-2 border-black rounded-none 
                flex items-center justify-center shadow-[2px_2px_0_#000]"
     style={{ backgroundColor: color }}>
  <Icon size={20} className="text-black" />
</div>
```

#### Stats Card
```tsx
<div className="border-2 border-black rounded-none p-5 
                shadow-[4px_4px_0_#000] flex flex-col gap-1">
  <span className="text-3xl font-black" style={{ color }}>
    500+
  </span>
  <span className="text-sm font-bold text-zinc-600">
    Label
  </span>
</div>
```

#### Profile/Identity Card
```tsx
<div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] 
                overflow-hidden">
  {/* Color bar accent */}
  <div className="h-1.5" style={{ background: color }} />
  
  <div className="flex items-center gap-5 p-5">
    <div className="border-2 border-black shadow-[4px_4px_0_#000]">
      {/* Avatar */}
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-black text-black leading-none">
        Name
      </h2>
      <p className="text-sm text-zinc-500 font-medium">
        Email
      </p>
    </div>
  </div>
</div>
```

#### Tab Navigation
```tsx
<div className="flex border-2 border-black shadow-[4px_4px_0_#000] 
                overflow-hidden">
  <button className={`flex-1 flex items-center justify-center gap-2 
                      py-2.5 text-xs font-black uppercase tracking-widest 
                      transition-colors border-l-2 border-black first:border-l-0
                      ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-yellow-400'}`}>
    <Icon className="size-3.5" />
    Tab Label
  </button>
</div>
```

### Layout Structure

#### Dashboard Theme
```css
.kwd-dash {
  --background: #1e2430      /* Dark blue-gray background */
  --foreground: #f0f2f5      /* Light text */
  --primary: #ffd700         /* Yellow accent */
  --card: #252d3d            /* Card background */
  --sidebar: #1a2035         /* Sidebar dark */
}
```

#### Spacing System
```css
/* Consistent Tailwind spacing */
gap-2, gap-3, gap-4, gap-5, gap-6    /* Flexbox/grid gaps */
p-4, p-5, p-6                        /* Card padding */
px-3, px-6, py-2, py-3, py-4         /* Button padding */
space-y-2, space-y-4, space-y-6      /* Vertical spacing */
```

#### Container Widths
```css
max-w-7xl mx-auto px-6               /* Standard page container */
max-w-4xl mx-auto px-6               /* Narrow content */
max-w-2xl                            /* Forms, profiles */
max-w-lg, max-w-xl                   /* Text blocks */
```

### Accessibility Features

- High contrast ratios (black borders on colored backgrounds)
- Clear focus states with ring utilities
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Grayscale images with color on hover for visual hierarchy

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

1. **Always use 2px black borders** on interactive elements (4px for emphasis)
2. **Apply hard shadows** (no blur) with varied sizes: 2px, 3px, 4px, 6px, 8px
3. **Keep corners sharp** - border-radius: 0 (enforced with inline styles)
4. **Use traffic-light colors** for semantic meaning
5. **Maintain high contrast** for accessibility
6. **Apply hover/active states** with translate + shadow changes
7. **Use uppercase + bold** for emphasis
8. **No gradients or emoji** - keep it brutalist
9. **Colored shadows** for yellow CTAs (#eab308)
10. **Grayscale to color** on hover for images




The Animation Logic
The Animation Logic

remove the traffic icon, all .  and let create new desgin animation roads loop using this style Function of Longitudinal Markings , and Index of Guide Posts, SINGLE YELLOW BROKEN LINE,SINGLE YELLOW SOLID LINE,DOUBLE YELLOW SOLID LINE, DOUBLE YELLOW COMBINATION LINE,DOUBLE YELLOW COMBINATION LINE, SINGLE WHITE BROKEN LINE, WHITE SINGLE SOLID LINE, EDGE LINE, YELLOW-WHITE CURB MARKINGS, RED-WHITE CURB MARKINGS, YELLOW-BLACK MARKINGS ON ROAD DEVIDER BLOCK,  crreate animation loop roads using these style 



 make it design by code to make animation The Animation Logic , take it long and perfect







 The Vienna Convention on Road Signs and Signals

 In article 2 the convention classes all road signs into a number of categories (A–H):

A: Danger warning signs
B: Priority signs
C: Prohibitory or restrictive signs
D: Mandatory signs
E: Special regulation signs
F: Information, facilities, or service signs
G: Direction, position, or indication sign
H: Additional panels


https://gettingaroundgermany.info/parken.shtml
https://www.roadtrafficsigns.com/
https://unece.org/road-traffic-and-road-signs-and-signals-agreements-and-conventions

List of questions (classic view)
What is the correct way to navigate multiple mini-roundabouts?
You have stopped at a red light. The traffic light changes to red and amber. What should you do?
Which vehicles are turning correctly at this roundabout?
When can you drive in a bus lane?
What does this sign mean?
You stop at a pelican crossing with a central island. The light turns green, but someone is still crossing. What should you do?
When can you drive in an operational cycle lane?
You see this sign at the edge of the motorway. What does it mean?
What does this sign mean?
What does this sign mean?
What does this sign mean?
You have arrived at a narrow junction where a lorry is turning. What should you do here?
Where should you start indicating for the left turn pictured?
You wish to cross this dual carriageway. How should you cross?
You see this sign on the motorway. What does it mean?
What does this sign mean?
You see this flashing amber sign on the motorway. What does it mean?
You see children playing on the road in a Home Zone. What should you do?
You are on a single carriageway with three lanes. Who may drive in the centre lane?
You have arrived at a box junction and you have a green light. Can you enter the junction before your path is clear?
What is a Red Route?
Where will you find this sign?
What does this sign mean?
What does this sign mean?
What does this sign mean?
Three cars arrive at a junction. Which cars have priority?
What does this sign mean?
You are waiting for a gap in traffic so you can turn right onto a minor road. Where should you wait?
You see a painted triangle on the road ahead. What does this marking mean?
You arrive at an amber traffic light. What should you do?
You are driving an ordinary car along the motorway. Can you enter this HOV lane?
Two cars are turning right at a junction. In which scenarios are both cars turning legally?
You arrive at a red traffic light with a bike lane and two stop lines. You should stop
What does this sign mean?
Where will you find this sign?
You are on the motorway and you see this sign. What does it mean?
What does this sign mean?
What does this sign mean?
What does this sign mean?
You are on a single-track road and you encounter an oncoming vehicle. What should you do?
What does this sign mean?
You stop at a zebra crossing to let a pedestrian cross. When can you proceed?
You arrive at a section of road bordered by a pair of red lines. What do these lines mean?
What does this sign mean?
You stop at a zebra crossing with a central island to let a pedestrian cross. When can you proceed?
You see this signal on the motorway. What does it mean?
After seeing this sign, what should you beware of?
What precautions should you take when you drive down a steep hill?
You see this sign by the roadside. What is ahead?
What does this sign mean?
















































eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWMwMmIyNmU0OTQ3M2FkNDRhZjg2NmMiLCJ1c2VySWQiOiI2OWMwMmE0OTQ2NzY0OGNkZWJiZDNmMGEiLCJ2IjozLCJ0eXBlIjoiYXBpX2tleSIsImlhdCI6MTc3NDIwMTYzOCwiZXhwIjo0OTI3ODAxNjM4fQ.OCtulYunvXs6UkrqVBTjAGEQmzXxTPAWIGQuQ6IriYI