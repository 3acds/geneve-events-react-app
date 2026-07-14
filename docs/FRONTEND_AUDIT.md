# Frontend audit

Audit date: 2026-07-14

## Architecture

- **Framework:** React 18.2 with Vite 5.2 and JavaScript/JSX. React Router DOM
  6.23 provides client-side routing.
- **Routes:** `/` category index, `/category/:tag` event listing,
  `/event/:eventId` details, `/profile`, and `/about`. Render rewrites all paths
  to `index.html` for browser routing.
- **State:** local component state plus React Context for language,
  notifications, and authentication. There is no external state library.
- **API client:** `src/services/api/api.js` uses `fetch`, in-memory and
  `localStorage` caches, a 30-minute TTL, stale-on-server-error behavior, and a
  pending-request map to coalesce duplicate requests.
- **Event model:** no declared type existed. Components consumed legacy API
  fields (`id`, `img`, `title`, `date`, `day`, `month`, `year`, `description`,
  `tag`, `source_url`) directly.
- **Views:** category cards on the home page; `EventCard` owns listing, search,
  pagination, cache restoration and fetch state; `EventDetailPage` supports
  cached/direct navigation but displays only title, description and date.
- **Filters:** category is represented by the route path and title search is
  local component state. There was no structured date/time filter UI or URL
  query persistence.
- **Authentication:** Firebase Authentication with Google sign-in; profile data
  uses Firebase Realtime Database. Authentication is unrelated to API requests.
- **Testing:** Jest 29, jsdom and Testing Library. There is no TypeScript
  type-check script or formatter script.
- **Deployment:** Render static site; `npm ci && npm run build`; API origin comes
  from `VITE_API_URL` and defaults to the production Render API.
- **Accessibility/responsiveness:** semantic headings, links/buttons, labelled
  inputs, loading status, focus-visible and reduced-motion rules, touch targets,
  responsive grids and mobile breakpoints.

## Integration risks

1. Old cached documents may lack every normalized field; normalization must be additive.
2. Naive backend timestamps represent Geneva wall time. Native `Date` parsing
   varies with viewer timezone, so utilities must avoid local-zone drift.
3. Query responses need distinct cache keys or filters can return stale results.
4. Category behavior is encoded in route paths and must remain intact.
5. API validation errors should be surfaced; stale fallback remains limited to
   network, rate-limit and server failures.

## Calendar architecture decision

The calendar is implemented with React, semantic HTML and the existing router
instead of adding a calendar dependency. The feature is read-only, needs only a
month grid and seven-day agenda, and already has normalized event/date helpers.
A full calendar package would add significant JavaScript and styling for unused
editing, drag-and-drop and scheduling features. The native implementation keeps
keyboard-accessible links and buttons, exposes date/status text independently of
colour, and switches the month grid to a compact agenda on small screens.
