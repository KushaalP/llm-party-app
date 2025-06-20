import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// Serve static files from dist directory
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

const rooms = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API Routes
app.post('/api/create-room', (req, res) => {
  const roomCode = generateRoomCode();
  const hostId = uuidv4();
  
  rooms.set(roomCode, {
    code: roomCode,
    host: hostId,
    participants: [{ id: hostId, name: 'Host', isReady: false, preferences: '' }],
    locked: false,
    preferencesStarted: false,
    recommendations: null
  });
  
  res.json({ roomCode, hostId });
});

app.post('/api/join-room', (req, res) => {
  const { roomCode, name } = req.body;
  const room = rooms.get(roomCode);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  if (room.locked) {
    return res.status(403).json({ error: 'Room is locked' });
  }
  
  if (room.participants.length >= 10) {
    return res.status(403).json({ error: 'Room is full' });
  }
  
  const participantId = uuidv4();
  const participant = { id: participantId, name, isReady: false, preferences: '' };
  room.participants.push(participant);
  
  io.to(roomCode).emit('participant-joined', participant);
  
  res.json({ participantId, room: { ...room, participants: room.participants } });
});

app.get('/api/room/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

async function getMovieRecommendations(room) {
  // Collect all user preferences
  const allPreferences = room.participants
    .filter(p => p.preferences && p.preferences.trim())
    .map(p => `${p.name}: ${p.preferences}`)
    .join('\n');
  
  console.log('🎬 Generating recommendations for preferences:');
  console.log(allPreferences);
  
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    console.warn('[WARN] TMDB_API_KEY not set – using fallback movies');
  }
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  
  try {
    // Extract keywords from preferences for search
    const preferenceText = allPreferences.toLowerCase();
    const searchTerms = extractSearchTerms(preferenceText);
    
    console.log('🔍 Search terms:', searchTerms);
    
    const recommendations = [];
    const usedMovieIds = new Set();
    
    // Search for movies based on different terms
    for (const term of searchTerms.slice(0, 3)) { // Limit to 3 search terms
      try {
        const searchResponse = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&sort_by=popularity.desc&vote_average.gte=6.0`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
          // Get top 2 results from each search that we haven't used
          const newMovies = searchData.results
            .filter(movie => !usedMovieIds.has(movie.id) && movie.poster_path && movie.vote_average >= 6.0)
            .slice(0, 2);
            
          for (const movie of newMovies) {
            if (recommendations.length >= 5) break;
            
            usedMovieIds.add(movie.id);
            recommendations.push({
              title: movie.title,
              year: new Date(movie.release_date).getFullYear(),
              reasoning: generateReasoning(movie, term, preferenceText),
              genres: await getMovieGenres(movie.genre_ids, TMDB_API_KEY),
              poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              overview: movie.overview,
              rating: Math.round(movie.vote_average * 10) / 10
            });
          }
        }
      } catch (error) {
        console.error(`Error searching for "${term}":`, error);
      }
    }
    
    // If we don't have enough movies, get popular ones
    if (recommendations.length < 5) {
      try {
        const popularResponse = await fetch(
          `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&vote_average.gte=7.0`
        );
        const popularData = await popularResponse.json();
        
        const additionalMovies = popularData.results
          .filter(movie => !usedMovieIds.has(movie.id) && movie.poster_path)
          .slice(0, 5 - recommendations.length);
          
        for (const movie of additionalMovies) {
          recommendations.push({
            title: movie.title,
            year: new Date(movie.release_date).getFullYear(),
            reasoning: `Highly rated popular film that appeals to diverse tastes - perfect for group viewing.`,
            genres: await getMovieGenres(movie.genre_ids, TMDB_API_KEY),
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            overview: movie.overview,
            rating: Math.round(movie.vote_average * 10) / 10
          });
        }
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      }
    }
    
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    return recommendations.slice(0, 5);
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Fallback to mock data if TMDB fails
    return getFallbackMovies();
  }
}

function extractSearchTerms(preferenceText) {
  // Extract meaningful search terms from preferences
  const terms = [];
  
  // Genre/style keywords
  if (preferenceText.includes('action')) terms.push('action');
  if (preferenceText.includes('comedy')) terms.push('comedy');
  if (preferenceText.includes('horror')) terms.push('horror');
  if (preferenceText.includes('sci-fi') || preferenceText.includes('science fiction')) terms.push('science fiction');
  if (preferenceText.includes('thriller')) terms.push('thriller');
  if (preferenceText.includes('drama')) terms.push('drama');
  if (preferenceText.includes('romance')) terms.push('romance');
  if (preferenceText.includes('superhero') || preferenceText.includes('marvel') || preferenceText.includes('dc')) terms.push('superhero');
  if (preferenceText.includes('animated') || preferenceText.includes('animation')) terms.push('animation');
  if (preferenceText.includes('documentary')) terms.push('documentary');
  if (preferenceText.includes('foreign') || preferenceText.includes('international')) terms.push('foreign film');
  if (preferenceText.includes('classic')) terms.push('classic movies');
  if (preferenceText.includes('indie') || preferenceText.includes('independent')) terms.push('independent film');
  
  // Era keywords
  if (preferenceText.includes('80s') || preferenceText.includes('1980')) terms.push('1980s movies');
  if (preferenceText.includes('90s') || preferenceText.includes('1990')) terms.push('1990s movies');
  if (preferenceText.includes('2000s')) terms.push('2000s movies');
  
  // If no specific terms found, use general popular terms
  if (terms.length === 0) {
    terms.push('popular movies', 'highly rated', 'award winning');
  }
  
  return [...new Set(terms)]; // Remove duplicates
}

async function getMovieGenres(genreIds, apiKey) {
  // TMDB genre mapping
  const genreMap = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  
  return genreIds.map(id => genreMap[id]).filter(Boolean);
}

function generateReasoning(movie, searchTerm, allPreferences) {
  const reasons = [
    `Matches your preference for ${searchTerm} with excellent ratings (${movie.vote_average}/10).`,
    `Perfect ${searchTerm} film that aligns with your group's interests.`,
    `Highly rated ${searchTerm} movie that should appeal to everyone's tastes.`,
    `Popular choice in the ${searchTerm} genre with great audience reception.`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getFallbackMovies() {
  const fallbackMovies = [
    {
      title: "Inception",
      year: 2010,
      reasoning: "Perfect blend of action and mind-bending sci-fi that appeals to fans of complex storytelling and visual spectacle.",
      genres: ["Action", "Sci-Fi", "Thriller"],
      poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      rating: 8.8
    },
    {
      title: "Parasite",
      year: 2019,
      reasoning: "Award-winning thriller that combines dark comedy with social commentary, appealing to fans of sophisticated international cinema.",
      genres: ["Thriller", "Drama", "Comedy"],
      poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      overview: "A poor family schemes to become employed by a wealthy family by infiltrating their household and posing as unrelated, highly qualified individuals.",
      rating: 8.6
    },
    {
      title: "Spider-Man: Into the Spider-Verse",
      year: 2018,
      reasoning: "Innovative animated superhero film that appeals to both comic book fans and animation enthusiasts with its unique visual style.",
      genres: ["Animation", "Action", "Adventure"],
      poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
      overview: "Teen Miles Morales becomes Spider-Man of his reality, crossing his path with five counterparts from other dimensions to stop a threat for all realities.",
      rating: 8.4
    }
  ];

  return fallbackMovies.slice(0, 5);
}

// Socket.io events
io.on('connection', (socket) => {
  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
  });
  
  socket.on('update-preferences', ({ roomCode, participantId, preferences }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const participant = room.participants.find(p => p.id === participantId);
      if (participant) {
        participant.preferences = preferences;
        io.to(roomCode).emit('room-update', room);
      }
    }
  });
  
  socket.on('set-ready', ({ roomCode, participantId, isReady }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const participant = room.participants.find(p => p.id === participantId);
      if (participant) {
        participant.isReady = isReady;
        io.to(roomCode).emit('room-update', room);
        
        if (room.participants.every(p => p.isReady)) {
          room.locked = true;
          io.to(roomCode).emit('generating-recommendations');
          
          getMovieRecommendations(room)
            .then(recommendations => {
              room.recommendations = recommendations;
              io.to(roomCode).emit('recommendations-ready', recommendations);
            })
            .catch(error => {
              console.error('Error generating recommendations:', error);
              io.to(roomCode).emit('recommendations-error', 'Failed to generate recommendations');
            });
        }
      }
    }
  });
  
  socket.on('kick-participant', ({ roomCode, hostId, participantId }) => {
    const room = rooms.get(roomCode);
    if (room && room.host === hostId) {
      room.participants = room.participants.filter(p => p.id !== participantId);
      io.to(roomCode).emit('participant-kicked', participantId);
      io.to(roomCode).emit('room-update', room);
    }
  });
  
  socket.on('start-preferences', ({ roomCode, hostId }) => {
    const room = rooms.get(roomCode);
    if (room && room.host === hostId) {
      room.preferencesStarted = true;
      io.to(roomCode).emit('preferences-started');
      io.to(roomCode).emit('room-update', room);
    }
  });

  socket.on('regenerate-recommendations', async ({ roomCode, hostId }) => {
    const room = rooms.get(roomCode);
    if (room && room.host === hostId) {
      io.to(roomCode).emit('generating-recommendations');
      
      try {
        const recommendations = await getMovieRecommendations(room);
        room.recommendations = recommendations;
        io.to(roomCode).emit('recommendations-ready', recommendations);
      } catch (error) {
        console.error('Error regenerating recommendations:', error);
        io.to(roomCode).emit('recommendations-error', 'Failed to regenerate recommendations');
      }
    }
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Run: npm run build');
  }
});

const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`🎬 MovieParty is running!`);
  console.log(`   Open: http://localhost:${PORT}`);
  console.log(`   Or:   http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('🍿 Ready to find your perfect movie!');
});