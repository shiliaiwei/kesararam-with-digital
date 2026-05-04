# Subscription Components

Ready-to-use React components for subscription management.

## Components

### SubscriptionBadge

Display user's current subscription plan as a badge.

```tsx
import { SubscriptionBadge } from "@/components/subscription";

<SubscriptionBadge />
```

**Features:**
- Auto-fetches current subscription
- Color-coded by plan (gray=free, blue=teacher_pro, purple=school)
- Loading state with skeleton

---

### QuotaDisplay

Show user's quota usage with progress bars.

```tsx
import { QuotaDisplay } from "@/components/subscription";

<QuotaDisplay />
```

**Features:**
- Shows classes and students usage
- Progress bars with color coding (green/yellow/red)
- Lists available features
- Handles unlimited quotas

---

### UpgradePrompt

Display upgrade prompt when feature requires higher plan.

```tsx
import { UpgradePrompt } from "@/components/subscription";

<UpgradePrompt 
  feature="Analytics Dashboard" 
  requiredPlan="teacher_pro"
>
  <AnalyticsDashboard />
</UpgradePrompt>
```

**Props:**
- `feature`: Name of the feature (for display)
- `requiredPlan`: Minimum plan required ("teacher_pro" | "school")
- `children`: Content to show if user has access

**Features:**
- Shows upgrade prompt if access denied
- Renders children if user has required plan
- Includes upgrade and learn more buttons

---

### FeatureGate

Conditionally render content based on subscription access.

```tsx
import { FeatureGate } from "@/components/subscription";

<FeatureGate 
  feature="analytics"
  fallback={<div>Upgrade to access analytics</div>}
>
  <AnalyticsContent />
</FeatureGate>
```

**Props:**
- `feature`: Feature to check ("createClass" | "addStudent" | "analytics" | "customContent")
- `fallback`: Optional custom fallback component
- `children`: Content to show if access granted

**Features:**
- Checks actual subscription limits
- Shows custom fallback or default message
- Loading state

---

## Usage Examples

### Show badge in header

```tsx
export function Header() {
  return (
    <header>
      <h1>Dashboard</h1>
      <SubscriptionBadge />
    </header>
  );
}
```

### Show quota in sidebar

```tsx
export function Sidebar() {
  return (
    <aside>
      <nav>...</nav>
      <QuotaDisplay />
    </aside>
  );
}
```

### Protect analytics page

```tsx
export function AnalyticsPage() {
  return (
    <UpgradePrompt feature="Analytics" requiredPlan="teacher_pro">
      <AnalyticsDashboard />
    </UpgradePrompt>
  );
}
```

### Gate class creation button

```tsx
export function CreateClassButton() {
  return (
    <FeatureGate 
      feature="createClass"
      fallback={
        <button disabled>
          Upgrade to create more classes
        </button>
      }
    >
      <button onClick={handleCreateClass}>
        Create New Class
      </button>
    </FeatureGate>
  );
}
```

### Combine multiple components

```tsx
export function DashboardLayout() {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <SubscriptionBadge />
      </header>
      
      <aside>
        <QuotaDisplay />
      </aside>
      
      <main>
        <FeatureGate feature="analytics">
          <AnalyticsWidget />
        </FeatureGate>
      </main>
    </div>
  );
}
```

## Styling

All components use Tailwind CSS classes. Customize by:

1. **Modifying the component files directly**
2. **Wrapping with custom styles**
3. **Using Tailwind's @apply directive**

Example custom wrapper:

```tsx
<div className="my-custom-styles">
  <SubscriptionBadge />
</div>
```

## State Management

Components fetch data independently using Server Actions. For better performance in complex apps, consider:

1. **Context Provider**: Share subscription data across components
2. **SWR/React Query**: Cache and revalidate subscription data
3. **Server Components**: Fetch once on server, pass as props

Example with Context:

```tsx
// SubscriptionContext.tsx
const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  
  useEffect(() => {
    getCurrentSubscription().then(({ subscription }) => {
      setSubscription(subscription);
    });
  }, []);
  
  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Then modify components to use context instead of fetching
```

## Testing

Test components with different subscription states:

```tsx
// Mock the server action
jest.mock("@/app/actions/subscriptions", () => ({
  getCurrentSubscription: jest.fn(() => 
    Promise.resolve({
      subscription: {
        plan: "teacher_pro",
        planName: "Teacher Pro",
        features: { analytics: true }
      }
    })
  ),
}));

// Test component
render(<SubscriptionBadge />);
expect(screen.getByText("Teacher Pro")).toBeInTheDocument();
```

## Accessibility

All components include:
- Semantic HTML
- Loading states
- Clear error messages
- Keyboard navigation support

## Performance

- Components use `useEffect` for data fetching
- Loading states prevent layout shift
- Consider memoization for expensive renders
- Use React.memo() if re-rendering is an issue

## Browser Support

Works in all modern browsers that support:
- ES6+
- React 18+
- Next.js 13+ (App Router)
