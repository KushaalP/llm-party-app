import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Read API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[WARN] GEMINI_API_KEY not set – falling back to mock data');
}

if (!TMDB_API_KEY) {
  console.warn('[WARN] TMDB_API_KEY not set – movie enrichment disabled');
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.post('/api/create-room', (req, res) => {
  const { name } = req.body;
  const roomCode = generateRoomCode();
  const hostId = uuidv4();
  
  rooms.set(roomCode, {
    code: roomCode,
    host: hostId,
    participants: [{ id: hostId, name: name?.trim() || 'Host', isReady: false, preferences: '' }],
    locked: false,
    recommendations: null,
    // tracking for rerolls / regenerations
    regenerateCount: 0,
    rerollCounts: {},
    recommendationHistory: []
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

function getMockMovies() {
  // Mock movie recommendations with various data
  const mockMovies = [
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
      title: "The Grand Budapest Hotel",
      year: 2014,
      reasoning: "Whimsical comedy-drama with stunning visuals and quirky characters, perfect for those who enjoy unique storytelling styles.",
      genres: ["Comedy", "Drama"],
      poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
      overview: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
      rating: 8.1
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
    },
    {
      title: "Knives Out",
      year: 2019,
      reasoning: "Modern murder mystery with wit and charm, perfect for groups who enjoy clever plots and ensemble casts.",
      genres: ["Mystery", "Comedy", "Crime"],
      poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
      overview: "A detective investigates the death of a patriarch of an eccentric, combative family.",
      rating: 7.9
    }
  ];

  // Randomly select and shuffle 5 movies
  const shuffled = [...mockMovies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

async function fetchMovieDetails(title) {
  try {
    if (!TMDB_API_KEY) return null;
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    if (data.results && data.results.length) {
      const movie = data.results[0];

      // Fetch detailed info to get genre names
      const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`);
      const detail = await detailRes.json();

      const genres = (detail.genres || []).map(g => g.name);

      return {
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        reasoning: '', // will fill later
        genres,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        overview: movie.overview,
        rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : undefined
      };
    }
  } catch (err) {
    console.error('TMDB lookup error', err);
  }
  return null;
}

async function generateRecommendationsGemini(preferences=[]) {
  // Debug: indicate function invocation
  console.log('generateRecommendationsGemini invoked. Preferences:', preferences);
  try {
    const apiKey = GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const formattedPrefs = preferences.length ? `Here are the group preferences: \n- ${preferences.join('\n- ')}` : 'No explicit preferences were provided.';

    const prompt = `You are Movie Party AI, an expert movie-night matchmaker. Choose five films the group will most likely enjoy together. For each movie provide:\n- title\n- reasoning (2 short bullet points referencing the preferences)\n\nRespond ONLY with JSON in this form (max 5 items, no markdown):\n[\n  {\n    \"title\": \"Movie Title\",\n    \"reasoning\": \"Why it fits...\"\n  }\n]\n\n${formattedPrefs}`;

    // Log the prompt for debugging
    console.log('Gemini prompt:', prompt);

    const result = await model.generateContent(prompt, { requestOptions: { apiVersion: 'v1' } });
    const text = result?.response?.text?.() || '';
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    if (Array.isArray(parsed) && parsed.length) {
      // Enrich with TMDB
      const enriched = await Promise.all(parsed.slice(0, 5).map(async (item) => {
        const base = await fetchMovieDetails(item.title);
        if (base) {
          return { ...base, reasoning: item.reasoning };
        }
        return { title: item.title, reasoning: item.reasoning };
      }));
      return enriched;
    }
  } catch (err) {
    console.error('Gemini recommendation error', err);
  }
  return getMockMovies();
}

async function getMovieRecommendations(preferences) {
  return generateRecommendationsGemini(preferences);
}

// FIRST_EDIT: helper to ensure movies are unique across a room's history
async function getUniqueMovies({ existingTitles = new Set(), preferences = [], count = 1, maxAttempts = 5 }) {
  const uniques = [];
  const exclude = new Set(existingTitles);
  let attempts = 0;
  while (uniques.length < count && attempts < maxAttempts) {
    // eslint-disable-next-line no-await-in-loop
    const candidates = await getMovieRecommendations(preferences);
    for (const movie of candidates) {
      if (!exclude.has(movie.title)) {
        exclude.add(movie.title);
        uniques.push(movie);
        if (uniques.length === count) break;
      }
    }
    attempts += 1;
  }
  return uniques;
}

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

          const preferences = room.participants
            .filter(p => p.preferences.trim())
            .map(p => p.preferences);

          getMovieRecommendations(preferences)
            .then(recommendations => {
              room.recommendations = recommendations;
              room.recommendationHistory = [
                ...(room.recommendationHistory || []),
                ...recommendations.map(m => m.title)
              ];
              room.rerollCounts = {};
              io.to(roomCode).emit('recommendations-ready', recommendations);
              io.to(roomCode).emit('room-update', room);
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
  
  socket.on('regenerate-recommendations', async ({ roomCode, hostId }) => {
    const room = rooms.get(roomCode);
    if (room && room.host === hostId) {
      if (room.regenerateCount >= 2) {
        io.to(roomCode).emit('recommendations-error', 'Maximum regenerates reached');
        return;
      }

      io.to(roomCode).emit('generating-recommendations');

      const preferences = room.participants
        .filter(p => p.preferences.trim())
        .map(p => p.preferences);

      try {
        const recommendations = await getUniqueMovies({
          existingTitles: new Set(room.recommendationHistory || []),
          preferences,
          count: 5
        });

        if (recommendations.length < 5) {
          io.to(roomCode).emit('recommendations-error', 'Unable to find enough unique movies');
          return;
        }

        room.regenerateCount += 1;
        room.recommendations = recommendations;
        room.recommendationHistory.push(...recommendations.map(m => m.title));
        room.rerollCounts = {};

        io.to(roomCode).emit('recommendations-ready', recommendations);
        io.to(roomCode).emit('room-update', room);
      } catch (error) {
        console.error('Error regenerating recommendations:', error);
        io.to(roomCode).emit('recommendations-error', 'Failed to regenerate recommendations');
      }
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

  socket.on('reroll-movie', async ({ roomCode, hostId, movieIndex }) => {
    const room = rooms.get(roomCode);
    if (!room || room.host !== hostId) return;

    // Initialize counter if missing
    if (!room.rerollCounts) room.rerollCounts = {};
    room.rerollCounts[movieIndex] = room.rerollCounts[movieIndex] || 0;

    if (room.rerollCounts[movieIndex] >= 2) {
      io.to(roomCode).emit('recommendations-error', 'Maximum rerolls reached for this movie');
      return;
    }

    const preferences = room.participants
      .filter(p => p.preferences.trim())
      .map(p => p.preferences);

    try {
      const [newMovie] = await getUniqueMovies({
        existingTitles: new Set(room.recommendationHistory || []),
        preferences,
        count: 1
      });

      if (!newMovie) {
        io.to(roomCode).emit('recommendations-error', 'Unable to find a unique movie');
        return;
      }

      // Replace movie at index immutably
      room.recommendations = room.recommendations.map((m, i) => (i === movieIndex ? newMovie : m));
      room.recommendationHistory.push(newMovie.title);
      room.rerollCounts[movieIndex] += 1;

      io.to(roomCode).emit('recommendations-ready', room.recommendations);
      io.to(roomCode).emit('room-update', room);
    } catch (err) {
      console.error('Error rerolling movie:', err);
      io.to(roomCode).emit('recommendations-error', 'Failed to reroll movie');
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});