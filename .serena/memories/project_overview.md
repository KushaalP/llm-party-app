# LLM Party App - Project Overview

## Purpose
This is a movie recommendation party app that allows groups of people to:
- Create and join rooms using room codes
- Share movie preferences as text
- Get AI-powered movie recommendations based on group preferences
- View detailed movie cards with posters, ratings, and genres
- Regenerate recommendations or reroll individual movies

## Core Features
- **Room-based Sessions**: Host creates room, others join with codes
- **Preference Collection**: Each participant enters their movie preferences
- **AI Recommendations**: Uses Google Gemini API to generate personalized movie recommendations
- **Interactive Results**: Display recommendation cards with movie details
- **Regeneration/Reroll**: Host can regenerate all recommendations or reroll individual movies
- **Real-time Updates**: Socket.io for live updates across all participants

## User Flow
1. Host creates room and gets room code
2. Participants join using room code
3. Everyone enters movie preferences
4. When all ready, AI generates 5 movie recommendations
5. Group views recommendations with detailed movie cards
6. Host can regenerate or reroll specific movies if needed