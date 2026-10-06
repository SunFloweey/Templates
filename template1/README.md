# Fernly Clone

Frontend reconstruction of the Fernly SaaS workspace demo for a university project.

## Stack

- Next.js 16 + React 19 + TypeScript
- CSS design tokens and responsive layout
- GSAP for page/card entrance motion
- dnd-kit for task board drag and drop
- Recharts for Analytics charts
- Lucide React for the icon system

## Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000` (or the port shown by Next.js).

Run the automated smoke tests with:

```bash
pnpm test
```

## Current implementation

- Shared sidebar/topbar shell with hash navigation
- Dashboard with KPI cards, project analytics, reminder, tracker and collaboration widgets
- Task board with filters, draggable cards and task modal
- Task persistence within the session, task move menu, keyboard navigation and global search
- Calendar with selectable dates and agenda
- Analytics with range switcher, KPI cards, area chart, donut, activity heatmap and CSV export
- Team directory with department filters, messages and profile side panel
- Settings tabs for profile, notifications and appearance, including persisted accent themes
- Help center with searchable FAQ and keyboard shortcut reference
- Responsive desktop/tablet/mobile layouts

The current build has been verified with `pnpm exec tsc --noEmit`, `pnpm test` and `pnpm build`. The local browser smoke check covers project/task creation, task filtering and moving, calendar navigation, team profiles, settings switches and keyboard shortcuts.

The reverse-engineering specification is maintained in the project workspace at:
`outputs/fernly-reverse-engineering-spec.md`.
