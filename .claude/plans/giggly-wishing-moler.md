# Dashboard Redesign Plan

## Context

The current dashboard is a flat, unstyled page with a basic list layout — no navigation, no visual hierarchy, no animations. The app concept is a rich event planning platform (weddings, birthdays, dinners, baby showers, etc.) with RSVP, wishlists, co-planning, and more. The dashboard needs to match that ambition: modern, creative, intuitive, with proper navigation and micro-interactions.

A `features.md` file will also be created to track all planned product features for future reference.

---

## Step 1: Create `features.md`

Create `/features.md` at project root — organized feature tracker with status indicators (`[ ] Planned`, `[~] In Progress`, `[x] Done`). Grouped by:
- Core Event Management
- RSVP System
- Date Polling / Co-Planning
- Wishlists & Gift Splitting
- Secret Chat
- Digital Baby Cards
- Photo Gallery, Budget Tracker, Seating, Timeline, Custom Themes
- Creative additions (templates, QR check-in, analytics, thank-you notes, weather integration)

---

## Step 2: Install Packages

```bash
npm install @vueuse/core @vueuse/nuxt @vueuse/motion floating-vue
```

- **@vueuse/core + @vueuse/nuxt** — `useMediaQuery`, `useLocalStorage`, `onClickOutside`, auto-imported
- **@vueuse/motion** — `v-motion` directive for entrance/stagger animations
- **floating-vue** — tooltips on collapsed sidebar items, contextual help

Update `nuxt.config.ts`: add `'@vueuse/nuxt'` and `'@vueuse/motion/nuxt'` to modules.
Create `plugins/floating-vue.client.js` to register floating-vue.

---

## Step 3: Extend Design System

**`assets/css/variables.css`** — add:
- Sidebar: `--sidebar-width: 260px`, `--sidebar-width-collapsed: 72px`
- Dashboard layout: `--max-width-dashboard: 1400px`
- Event type colors: birthday (#9b59b6), wedding (#e91e63), dinner (#ff9800), baby-shower (#4caf50), corporate (#2196f3)
- Skeleton: `--color-skeleton`, `--color-skeleton-highlight`

**`assets/css/animations.css`** (new) — add `@keyframes shimmer`, `pulse-soft`, `slide-in-from-left`, stagger utility classes.

Import in `assets/css/main.css`.

---

## Step 4: New Icons in AppIcon

Add to `components/atoms/AppIcon.vue`:
`home`, `settings`, `bell`, `log-out`, `trending-up`, `inbox`, `chevron-left`, `chevron-right`, `cake`, `heart`, `baby`, `utensils`, `briefcase`, `activity`, `more-horizontal`, `menu`

---

## Step 5: New Atom Components

| Component | Purpose |
|-----------|---------|
| `atoms/SkeletonLoader.vue` | Shimmer loading placeholder (variants: text, circle, card, stat) |
| `atoms/AvatarCircle.vue` | User avatar with initials fallback |
| `atoms/ProgressRing.vue` | SVG circular progress (for RSVP rates) |
| `atoms/CountBadge.vue` | Notification count pill with pulse animation |

---

## Step 6: New Composables

| Composable | Purpose |
|------------|---------|
| `composables/useSidebar.js` | Sidebar state: collapsed (localStorage), mobileOpen, toggle/expand/collapse |
| `composables/useGreeting.js` | Time-of-day greeting key (morning/afternoon/evening) |
| `composables/useDashboardStats.js` | Aggregated stats from events data (upcoming count, pending RSVPs, etc.) |

---

## Step 7: New Molecule Components

| Component | Purpose |
|-----------|---------|
| `molecules/StatCard.vue` | Icon + large number + label + optional trend. Used in stats overview |
| `molecules/ActivityItem.vue` | Single activity feed row: icon + message + relative timestamp |
| `molecules/QuickActionCard.vue` | Large action card with icon, label, description. Hover lift effect |
| `molecules/EmptyState.vue` | Reusable empty state: large icon + title + description + CTA |
| `molecules/SidebarNavItem.vue` | Sidebar nav row: icon + label + optional badge. Tooltip when collapsed |
| `molecules/UserMenu.vue` | User avatar dropdown with profile/billing/settings/sign-out links |

---

## Step 8: New Organism Components

| Component | Purpose |
|-----------|---------|
| `organisms/DashboardSidebar.vue` | Collapsible sidebar nav (260px/72px). Logo, nav items, subscription chip, user menu. Mobile: overlay with backdrop |
| `organisms/DashboardHeader.vue` | Top bar: page title/breadcrumb, notification bell, user menu. Mobile: hamburger |
| `organisms/StatsOverview.vue` | Row of 4 StatCards with staggered entrance animations |
| `organisms/ActivityFeed.vue` | Card with "Recent Activity" header + list of ActivityItems (max 5) |
| `organisms/QuickActions.vue` | Row of 3 QuickActionCards: Create Event, Invitations, Wishlists |
| `organisms/UpcomingEventsTimeline.vue` | Vertical mini-timeline of next 3-5 events with date markers |

---

## Step 9: DashboardTemplate + Nested Routing

**`components/templates/DashboardTemplate.vue`** — the key architectural piece:
```
┌──────────────────────────────────────┐
│ DashboardSidebar │ DashboardHeader   │
│ (fixed left)     │ (sticky top)      │
│                  │                   │
│                  │ <slot /> (content) │
│                  │                   │
└──────────────────────────────────────┘
```
CSS Grid: `grid-template-columns: var(--sidebar-width) 1fr`. Transitions on collapse.

**Restructure `pages/dashboard.vue`** → nested route wrapper:
```vue
<template>
  <DashboardTemplate>
    <NuxtPage />
  </DashboardTemplate>
</template>
```

**New/moved pages:**
- `pages/dashboard/index.vue` — dashboard home (current content, redesigned)
- `pages/dashboard/events/index.vue` — full events list with search/filter
- `pages/dashboard/events/[id].vue` — already exists, update to remove DefaultTemplate
- `pages/dashboard/invitations.vue` — invitations with status filters
- `pages/dashboard/settings.vue` — placeholder settings page
- `pages/billing.vue` → move to `pages/dashboard/billing.vue` (or keep, but use DashboardTemplate)

---

## Step 10: Dashboard Home Redesign (`pages/dashboard/index.vue`)

Layout top to bottom:
1. **Greeting** — "Good morning, {name}" (time-aware) + today's date
2. **StatsOverview** — 4 stat cards in responsive row
3. **Two-column layout:**
   - Left (2/3): QuickActions → "My Events" (grid, max 4, "View all" link)
   - Right (1/3): ActivityFeed → UpcomingEventsTimeline
4. Mobile: single column, stats 2x2

All sections have staggered `v-motion` entrance animations.

---

## Step 11: Refactor Existing Components

- **EventCard.vue** — colored left border by event type, improved hover (scale + shadow), `v-motion` entrance
- **EventList.vue** — responsive grid (`auto-fill, minmax(340px, 1fr)`), use EmptyState component, staggered animations
- **SubscriptionCard.vue** — add `compact` variant prop for sidebar placement
- **CreateEventForm.vue** — style as a modal/slide-over instead of inline form

---

## Step 12: i18n Updates

Add keys to both `en.json` and `nl.json`:
- `dashboard.greeting.morning/afternoon/evening`
- `dashboard.stats.*` (upcomingEvents, pendingRsvps, activeWishlists, nextEvent)
- `dashboard.quickActions.*`
- `dashboard.activity.*`
- `dashboard.sidebar.*` (home, events, invitations, settings)
- `dashboard.emptyState.*`

---

## Implementation Order

1. **Foundation**: features.md, packages, nuxt.config, variables.css, animations.css, floating-vue plugin, new icons
2. **Atoms**: SkeletonLoader, AvatarCircle, ProgressRing, CountBadge
3. **Composables**: useSidebar, useGreeting, useDashboardStats
4. **Molecules**: StatCard, ActivityItem, QuickActionCard, EmptyState, SidebarNavItem, UserMenu
5. **Organisms**: DashboardSidebar, DashboardHeader, StatsOverview, ActivityFeed, QuickActions, UpcomingEventsTimeline
6. **Template + Routing**: DashboardTemplate, convert dashboard.vue to nested wrapper, create sub-pages
7. **Refactor**: EventCard, EventList, SubscriptionCard, CreateEventForm
8. **i18n**: All new translation keys in both locales

---

## Verification

After each phase:
1. `npm run dev` — no build errors
2. Navigate `/dashboard` — visual inspection
3. Test sidebar collapse/expand + mobile overlay
4. Test sub-page navigation (/dashboard/events, /dashboard/invitations)
5. Verify empty states render when no data
6. Test NL/EN language switching
7. Verify auth middleware still protects `/dashboard(.*)`
8. Check animations are smooth (no layout thrashing)

---

## Critical Files

- `components/templates/DashboardTemplate.vue` — entire authenticated layout
- `pages/dashboard.vue` — convert to nested-route wrapper
- `components/organisms/DashboardSidebar.vue` — core navigation
- `pages/dashboard/index.vue` — redesigned dashboard home
- `assets/css/variables.css` — extended design tokens
- `composables/useSidebar.js` — sidebar state management
