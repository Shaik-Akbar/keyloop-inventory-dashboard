# Keyloop Inventory Dashboard

Frontend implementation of **Scenario B — The Intelligent Inventory Dashboard**
from the Keyloop technical assessment. Full architecture and design rationale
live in [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) (also published as
[`docs/Keyloop_Inventory_Dashboard_System_Design.pdf`](docs/Keyloop_Inventory_Dashboard_System_Design.pdf)).

## What it does

- Lists dealership inventory, filterable by make and model, and paginated
  so the view stays fast as inventory grows.
- Flags any vehicle on the lot for more than 90 days as **aging stock**,
  sorted oldest-first so the stock that needs attention surfaces at the top.
- Lets a manager log a follow-up action against a vehicle (e.g. "Price
  reduction planned"), persisted as an append-only history, with a vehicle
  photo in the detail panel.
- Styled to match Keyloop's own Vehicle Hub product (dark navy header bar,
  Fusion wordmark) rather than a generic admin-panel theme.

The backend is mocked with [json-server](https://github.com/typicode/json-server)
against a static seed dataset — this submission implements the **frontend**
layer per the assessment's "Your Choice" requirement.

## Stack

React 18 · TypeScript · Vite · json-server (mock API) · Vitest + React Testing Library

## Getting started

```bash
npm install
npm start          # runs the mock API (port 4000) and the app (port 5173) together
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the mock
backend, so the app never talks to port 4000 directly — see `vite.config.ts`.

To run the pieces separately:

```bash
npm run mock   # json-server on :4000, watching mock-server/db.json
npm run dev    # vite on :5173
```

## Testing

```bash
npm test        # run once
npm run test:watch
```

37 tests, two layers deep:

- **Domain** (`src/domain/inventory.test.ts`, 20 tests) — the 90-day aging
  rule, filtering, sorting, and pagination. This is the business logic the
  scenario is actually graded on, tested with no React involved.
- **Components & integration** (17 tests) — `InventoryTable` (aging badge
  threshold, selection), `FilterBar` (make/model cascading, aging toggle,
  the make-reset-model behavior), `Pagination` (boundary disabling, range
  display), and `App` (the API mocked, filtering actually narrows the
  rendered table, changing a filter resets pagination to page 1, selecting
  a row opens the detail panel) — proving the pieces are wired correctly,
  not just correct in isolation.

## Build

```bash
npm run build      # type-checks then builds to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  domain/        pure business logic (aging rule, filters, sorting, pagination) — framework-free, unit-tested
  api/            fetch client — correlation IDs, error normalization, the one seam to the backend
  hooks/          useInventory, useVehicleActions — data fetching + state
  components/     presentation: FilterBar, InventoryTable, Pagination, ActionLogPanel, VehiclePhoto, AgingBadge, ErrorBoundary
  lib/logger.ts   structured client-side event logging
mock-server/
  db.json         seed vehicles + actions served by json-server (includes a photoUrl per vehicle)
```

## AI Collaboration Narrative

I built this AI-natively — Claude Code was my primary development partner
from the design document through implementation, not an occasional
assist. It drafted the architecture, wrote the first pass of every layer,
and ran trade-off comparisons on request. My role was direction and
review: a clear spec and constraints up front, then validating what came
back the way I'd review any strong engineer's PR — checking the
reasoning, not just the result.

Where that review mattered:

- Rejected an API client draft that read the base URL from `window.location`
  instead of the fixed `/api` prefix — would've broken the mock-to-real
  backend swap the whole design is built around.
- Wrote the aging-threshold boundary tests myself (90 vs. 91 days); the
  first pass only checked "old" vs. "new" and would've passed with an
  off-by-one bug.
- Caught `useVehicleActions` re-sorting its array on every render instead
  of once per fetch, and moved the sort to where the data actually changes.
- Pushed back on an `InventoryTable` draft that computed aging inline
  instead of calling the domain function — a second definition of "aging"
  waiting to drift from the first.
- A reported "page reload on filter change" wasn't one — confirmed with a
  scripted DevTools Protocol session and a `sessionStorage` probe, which
  pointed at a CSS Grid default stretching the header instead.
- A "misaligned price column" traced to a CSS specificity conflict,
  confirmed with `getComputedStyle` rather than guessed from the symptom.
- A fix that still looked broken in a later screenshot turned out to be a
  stale browser tab, confirmed by checking the actual open tabs rather
  than re-debugging a fix that already worked.
- Every vehicle photo was HTTP-verified before use, which caught a search
  query returning the wrong vehicle entirely.

Business logic lives in a framework-free domain layer specifically so it's
testable independent of the UI — that's what let the test suite catch real
bugs instead of a green checkmark standing in for verification.
