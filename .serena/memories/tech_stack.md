# Tech Stack

## Frontend
- **React 18** - Main UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Socket.io Client** - Real-time communication

## Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **Socket.io** - WebSocket server for real-time updates
- **Google Generative AI (Gemini)** - AI recommendations engine
- **TMDB API** - Movie database for posters and details
- **uuid** - Unique ID generation

## Key Files Structure
- `server.js` - Main production server with Socket.io
- `prod-server.js` - Simplified production server
- `src/components/` - React components
  - `Recommendations.jsx` - Main recommendations display
  - `recommendationsComponents/RecommendationCard.jsx` - Individual movie cards
  - `Room.jsx` - Main room management component
- `src/hooks/useSocket.js` - Socket connection management