# FlowTrack

FlowTrack is a modern, beautifully designed task management Progressive Web App (PWA) built to help you stay in the flow. It seamlessly combines daily habit tracking, weekly routines, and one-off deadlines into a single, intuitive interface.

## ✨ Features

- **Daily & Weekly Routines**: Manage tasks that recur daily or on specific days of the week.
- **Deadline Tracking**: Stay on top of one-off tasks with specific due dates.
- **Subtasks & Checklists**: Break complex tasks down into smaller, manageable subtasks. Subtask completion is accurately reflected in your daily progress bar.
- **Daily Progress & Streaks**: Visualize your daily completion rate and build momentum by maintaining your daily streak.
- **Kanban & List Views**: Organize your workflow your way. Drag and drop tasks across columns in the Kanban board or view them in a streamlined list.
- **Cloud Sync & Offline Support**: Uses Firebase Realtime Database to keep your tasks synced across devices. If you're not logged in, it gracefully falls back to LocalStorage.
- **Progressive Web App (PWA)**: Install FlowTrack directly to your home screen on mobile or desktop for a native-like experience.
- **Stunning UI/UX**: Built with a beautiful dark aesthetic, featuring glassmorphism elements, vibrant gradients, and smooth micro-animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Realtime Database & Authentication)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Firebase project (for cloud sync and auth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhinhere/flowtrack.git
   cd flowtrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 PWA Installation

To install FlowTrack as a standalone app:
- **Desktop (Chrome/Edge)**: Click the install icon in the URL bar, or click "Install FlowTrack" from the app's header.
- **iOS (Safari)**: Tap the Share button and select "Add to Home Screen".
- **Android (Chrome)**: Tap the menu button and select "Install app" or "Add to Home screen".

## 🎨 Design Philosophy

FlowTrack was designed to be more than just a functional utility—it's meant to be a premium, delightful experience. We avoid generic, flat designs in favor of curated HSL color palettes, dynamic hover states, and fluid page transitions. The interface should feel responsive and "alive," encouraging continuous interaction and productivity.
