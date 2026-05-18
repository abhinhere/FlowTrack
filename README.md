# FlowTrack

A minimal, focused task management PWA built for daily flow. Manage your tasks across a Kanban board, track daily progress, and build consistent streaks — all with cloud sync and offline support.

> Built by [@abhinhere](https://github.com/abhinhere)

---

## Features

- **Daily Tasks** — Tasks that appear every day, no deadline needed
- **Weekly Tasks** — Recurring tasks on specific days of the week
- **Deadline Tasks** — One-off tasks with a due date
- **Subtasks** — Break any task into a checklist of subtasks
- **Daily Progress** — Visual progress bar tracking today's completion rate
- **Streaks** — Build momentum by completing all tasks each day
- **Kanban & List Views** — Switch between board and list layouts
- **Search** — Instantly filter tasks by title or description
- **Cloud Sync** — Firebase Realtime Database keeps tasks in sync across devices
- **Offline Fallback** — LocalStorage is used when not signed in
- **PWA** — Install as a standalone app on mobile or desktop

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Drag & Drop | [@dnd-kit](https://dndkit.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Auth & DB | [Firebase](https://firebase.google.com/) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (for cloud sync and Google auth)

### Installation

```bash
git clone https://github.com/abhinhere/flowtrack.git
cd flowtrack
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## PWA Installation

- **Desktop (Chrome/Edge)** — Click the install icon in the URL bar, or use the "Install" button in the app header
- **Android (Chrome)** — Tap menu → "Add to Home screen"
- **iOS (Safari)** — Tap Share → "Add to Home Screen"

---

## Project Structure

```
app/
  page.tsx              # Home — daily checklist & progress
  tasks/page.tsx        # Tasks — kanban/list with search
components/
  layout/AppShell.tsx   # Sidebar, header, nav, back button
  tasks/                # TaskCard, TaskList, KanbanBoard, TaskFormModal
  ui/                   # Toast, LoadingState, InstallAppButton
hooks/
  useTasks.ts           # Task CRUD with Firebase/LocalStorage sync
  useStreak.ts          # Daily streak logic
lib/
  tasks.ts              # Task types, constants, helpers
  firebase.ts           # Firebase config
```
