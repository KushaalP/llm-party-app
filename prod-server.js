import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

async function getMovieRecommendations() {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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
          
          const preferences = room.participants
            .filter(p => p.preferences.trim())
            .map(p => p.preferences);
          
          getMovieRecommendations(preferences)
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
  
  socket.on('regenerate-recommendations', async ({ roomCode, hostId }) => {
    const room = rooms.get(roomCode);
    if (room && room.host === hostId) {
      io.to(roomCode).emit('generating-recommendations');
      
      const preferences = room.participants
        .filter(p => p.preferences.trim())
        .map(p => p.preferences);
      
      try {
        const recommendations = await getMovieRecommendations(preferences);
        room.recommendations = recommendations;
        io.to(roomCode).emit('recommendations-ready', recommendations);
      } catch (error) {
        console.error('Error regenerating recommendations:', error);
        io.to(roomCode).emit('recommendations-error', 'Failed to regenerate recommendations');
      }
    }
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 MovieParty server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('Ready to party! 🍿');
});