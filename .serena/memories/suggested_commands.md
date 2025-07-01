# Suggested Development Commands

## Development Server
- `npm run dev` - Start Vite development server (likely port 5173)
- `npm start` - Start production server 
- `node server.js` - Start main server with Socket.io
- `node prod-server.js` - Start simplified production server

## Build & Deploy
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Testing & Quality
- `npm run lint` - ESLint code checking
- `npm test` - Run tests (if configured)

## System Commands (macOS/Darwin)
- `ls -la` - List files with details
- `find . -name "*.jsx" -type f` - Find specific file types
- `grep -r "pattern" src/` - Search for text in source files
- `git status` - Check git status
- `git log --oneline -10` - Recent commits

## Environment Setup
- Copy `.env.example` to `.env` and configure:
  - `GEMINI_API_KEY` - Google Gemini API key
  - `TMDB_API_KEY` - The Movie Database API key

## Port Configuration
- Frontend dev: 5173 (Vite default)
- Backend server: 3001 (proxied from frontend)
- Socket.io runs on same port as Express server