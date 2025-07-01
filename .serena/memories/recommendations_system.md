# Movie Recommendations System

## AI Integration
- **Primary Engine**: Google Gemini 2.5 Flash model
- **Fallback**: Mock movie data when API fails
- **Location**: `server.js` - `generateRecommendationsGemini()` function

## Recommendation Process
1. Collects all participant preferences as text
2. Sends structured prompt to Gemini API
3. Requests 5 movies with title, year, reasoning, and other details
4. Enriches results with TMDB API data (posters, genres, ratings)
5. Stores in room state and broadcasts to all participants

## Key Features
- **Exclusion Logic**: Tracks recommendation history to avoid duplicates
- **Regeneration Limits**: Max 2 full regenerations per room
- **Individual Rerolls**: Max 2 rerolls per movie slot
- **Real-time Updates**: Socket events for generating/ready/error states

## Prompt Structure
The Gemini prompt includes:
- Role definition as "Movie Party AI"
- Group preferences formatted as bullet points
- Exclusion list of previously recommended movies
- Structured output format requirements
- Emphasis on group enjoyment and variety

## Components
- `Recommendations.jsx` - Main recommendations display component
- `RecommendationCard.jsx` - Individual movie card component
- Socket events: `generating-recommendations`, `recommendations-ready`, `recommendations-error`