# 🛒 Grocery Tracker — Frontend

React + TypeScript + Tailwind CSS frontend for the Roommate Shared Grocery Tracker.

## 🚀 Features

- **Real-time Stock**: Items update instantly when teammates log consumption.
- **Visual Indicators**: Progress bars and low-stock badges.
- **Activity Feed**: See exactly who's consuming what.
- **Analytics**: Per-user consumption breakdown.
- **Dark Mode**: Sleek, customizable UI.

## 🛠️ Local Setup

```bash
# 1. Enter directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
touch .env
# Set VITE_API_URL and VITE_WS_URL
```

### Environment Variables (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## 🏗️ State Management

- **Zustand**: Auth state and Room preferences.
- **React Query**: Server state caching and synchronization.
- **WebSockets**: Live broadcast of item changes.

## ☁️ Deploy to Vercel

1. Push your code to GitHub.
2. Link the repository to [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add Environment Variables:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://api.render.com`)
   - `VITE_WS_URL`: Your backend WS URL (e.g., `wss://api.render.com/ws`)
5. Click **Deploy**.
