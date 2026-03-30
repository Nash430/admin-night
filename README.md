# Admin Night

一個幫助拖延型使用者透過線下共工 session 完成行政雜務與自由辦公的匿名聚會平台。主打低社交壓力與最低摩擦的線下互動。
An anonymous meetup platform that helps procrastination-prone users complete administrative chores and flexible work through in-person co-working sessions. It emphasizes low social pressure and the lowest-friction offline interaction.



## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS (Mobile-first, Minimalist UI)
- **Backend / Auth / Database:** Supabase (PostgreSQL, Auth, Realtime)
- **Map Integration:** Leaflet (via React-Leaflet)
- **Deployment:** Vercel

## Project Structure

\`\`\`text
app/
  api/               # Route Handlers (Webhook, 外部觸發) # Route Handlers (Webhook, external triggers)
  auth/              # Google OAuth / Auth Callback 
  (main)/            # 帶有共用 Layout 的主要頁面  # Main pages with a shared layout
    feed/            # 首頁 Feed (附近場次) # Home feed (nearby sessions)
    sessions/        # 場次詳情 / 開一場 # Session details / create a session
    todos/           # 個人待辦清單 # Personal to-do list
components/
  feed/              # Feed 專用 UI 組件 # Feed-specific UI components
  session/           # 場次專用 UI 組件 (含 Map) # Session-specific UI components (including Map)
  todos/             # 待辦清單 UI 組件 # To-do list UI components
  ui/                # 共用基礎組件 (Buttons, Modals 等) # Shared base components (Buttons, Modals, etc.)
utils/
  supabase/          # Supabase Client / Server / Middleware 
\`\`\`

## Getting Started

First, install dependencies and set up your `.env.local` with Supabase keys.

Then, run the development server:

\`\`\`bash
npm run dev
# or yarn dev / pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.