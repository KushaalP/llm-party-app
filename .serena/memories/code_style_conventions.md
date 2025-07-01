# Code Style & Conventions

## JavaScript/React Patterns
- **Functional Components**: Uses React functional components with hooks
- **ES6+ Syntax**: Arrow functions, destructuring, template literals
- **State Management**: React useState/useEffect, no external state library
- **Real-time Communication**: Socket.io with custom hooks

## Component Structure
- **Component Files**: `.jsx` extension for React components
- **Component Organization**: Grouped in feature-based directories
  - `homeComponents/` - Home page components
  - `lobbyComponents/` - Lobby/room management
  - `recommendationsComponents/` - Movie recommendation displays
  - `preferencesComponents/` - User preference collection
  - `ui/` - Reusable UI components

## Naming Conventions
- **Components**: PascalCase (e.g., `RecommendationCard.jsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase (e.g., `roomCode`, `participantId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE`, `GEMINI_API_KEY`)

## CSS & Styling
- **Primary**: Tailwind CSS utility classes
- **Custom Styles**: Module CSS files (e.g., `swipedeck.module.css`)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Socket.io Patterns
- **Event Naming**: kebab-case (e.g., `generating-recommendations`)
- **Room Management**: Room codes as Socket.io rooms
- **Error Handling**: Dedicated error events and fallback states