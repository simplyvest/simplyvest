# SimplyVest App Sidebar Design Spec

## Overview

Transform the app section (`/app/*`) from a top-navbar-only layout into a professional dashboard with a sidebar navigation, slim top bar, and responsive behavior.

## Layout

```
+-------------------------------------------------+
|  Top Bar: Logo | Chain Badge | Profile Dropdown |  56px
+----------+--------------------------------------+
|          |                                      |
| Sidebar  |         Main Content                 |
| 240px    |         (<Outlet />)                 |
| (64px    |                                      |
|  icon    |                                      |
|  rail)   |                                      |
|----------|                                      |
| Bottom   |                                      |
| pinned   |                                      |
+----------+--------------------------------------+
```

## Top Bar (App Section)

Replaces the current navbar for `/app/*` routes. Fixed at top, full width, glass-morphism.

**Contents (left to right):**
1. SimplyVest logo -> links to `/app/dashboard`
2. Chain badge -- pill showing "Devnet" (amber) or "Mainnet" (green) from `VITE_SOLANA_CHAIN`
3. Spacer
4. Profile button -- avatar/initials, dropdown with:
   - User email or truncated wallet address (read-only display)
   - "Logout" item (calls `logout()` from `useAuth`)

**Public routes (`/`, `/docs`, `/faq`, `/waitlist`) keep the existing navbar unchanged.**

## Sidebar

Glass-morphism style matching current navbar.

**Top section (scrollable if overflow):**
| Item | Icon | Route |
|------|------|-------|
| Dashboard | `LuLayoutDashboard` | `/app/dashboard` |
| Create Stream | `LuCirclePlus` | `/app/create` |
| -- divider -- | | |
| Organizations | `LuBuilding2` | `/app/organizations` |
| Activity | `LuClock` | `/app/activity` |
| Analytics | `LuBarChart3` | `/app/analytics` |

**Bottom section (pinned to bottom):**
| Item | Icon | Action |
|------|------|--------|
| -- divider -- | | |
| Profile | `LuUser` | `/app/profile` |
| Help & Support | `LuCircleHelp` | `/app/help` |
| -- divider -- | | |
| Theme toggle | `LuSun`/`LuMoon` | Toggle dark/light |
| Collapse | `LuPanelLeftClose`/`Open` | Toggle sidebar width |

**Active state:** Highlighted background on current route item, using `--sol` accent color.

**Collapsed state (icon rail, 64px):** Shows only icons. Tooltips on hover show labels.

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `< 768px` | Sidebar hidden. Hamburger button in top bar opens drawer overlay. |
| `768px - 1024px` | Icon rail (64px). Click expand toggle to expand. |
| `> 1024px` | Expanded (240px) by default. Collapse toggle available. |

## New Routes

| Route | File | Description |
|---|---|---|
| `/app/organizations` | `app.organizations.tsx` | Org list + create/manage |
| `/app/profile` | `app.profile.tsx` | Profile form |
| `/app/activity` | `app.activity.tsx` | Stream event history |
| `/app/analytics` | `app.analytics.tsx` | Portfolio overview |
| `/app/help` | `app.help.tsx` | FAQ, docs links |

`/app/settings` redirects to `/app/profile`.

## Components

### New
- `components/layout/app-layout.tsx` -- orchestrator
- `components/layout/top-bar.tsx` -- slim bar shell
- `components/layout/top-bar/chain-badge.tsx` -- devnet/mainnet pill
- `components/layout/top-bar/profile-menu.tsx` -- dropdown with logout
- `components/layout/sidebar.tsx` -- sidebar shell
- `components/layout/sidebar/nav-item.tsx` -- single link with icon + label
- `components/layout/sidebar/nav-section.tsx` -- group of nav items
- `components/layout/sidebar/sidebar-bottom.tsx` -- profile, help, theme, collapse
- `components/layout/sidebar/mobile-drawer.tsx` -- overlay for mobile

### Modified
- `routes/__root.tsx` -- conditionally render app-layout for `/app/*`
- `routes/app.tsx` -- use new app-layout
- `routes/app.settings.tsx` -- redirect to `/app/profile`
- `components/layout/navbar.tsx` -- remove app links

### Unchanged
- All existing public routes and navbar
- All domain components
- UI primitives

## Icons

Use `react-icons/lu` (already in deps). Set: `LuLayoutDashboard`, `LuCirclePlus`, `LuBuilding2`, `LuClock`, `LuBarChart3`, `LuUser`, `LuCircleHelp`, `LuSun`, `LuMoon`, `LuPanelLeftClose`, `LuPanelLeftOpen`, `LuMenu`, `LuLogOut`.

## State Management

- Sidebar collapse: `useState` in app-layout, persisted to `localStorage` key `sidebar-collapsed`
- Mobile drawer: `useState` in app-layout
- Chain badge: reads `VITE_SOLANA_CHAIN` env var
