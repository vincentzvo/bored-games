const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 3001;

// Store active rooms and players
const rooms = new Map();

// Check if room exists endpoint
app.get('/api/room/:roomCode/exists', (req, res) => {
  const { roomCode } = req.params;
  const exists = rooms.has(roomCode);
  res.json({ exists });
});

// Create room endpoint
app.post('/api/room/:roomCode/create', (req, res) => {
  const { roomCode } = req.params;
  
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      code: roomCode,
      players: [],
      createdAt: new Date()
    });
    res.json({ success: true, room: rooms.get(roomCode) });
  } else {
    res.status(409).json({ success: false, message: 'Room already exists' });
  }
});

// Delete room endpoint
app.delete('/api/room/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  
  if (rooms.has(roomCode)) {
    rooms.delete(roomCode);
    res.json({ success: true, message: 'Room deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Room not found' });
  }
});

// Submit ranking endpoint
app.post('/api/room/:roomCode/submit-ranking', (req, res) => {
  const { roomCode } = req.params;
  const { playerId, ranking, phase } = req.body; // phase: 'original' or 'guess'
  
  if (!rooms.has(roomCode)) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  
  const room = rooms.get(roomCode);
  
  // Initialize submissions object if it doesn't exist
  if (!room.submissions) {
    room.submissions = {
      original: [],
      guess: []
    };
  }
  
  const submissionType = phase || 'original';
  const submissions = room.submissions[submissionType];
  
  console.log(`Before submission - Room ${roomCode}, Phase: ${submissionType}, Player: ${playerId}`);
  console.log(`Current submissions in this phase:`, submissions.map(s => s.playerId));
  
  // Check if player already submitted, update if so
  const existingIndex = submissions.findIndex(r => r.playerId === playerId);
  
  if (existingIndex >= 0) {
    console.log(`Player ${playerId} is updating their existing submission at index ${existingIndex}`);
    submissions[existingIndex] = {
      playerId,
      ranking,
      submittedAt: new Date()
    };
  } else {
    console.log(`Player ${playerId} is submitting for the first time`);
    submissions.push({
      playerId,
      ranking,
      submittedAt: new Date()
    });
  }
  
  console.log(`After submission - Total submissions: ${submissions.length}`);
  console.log(`All player IDs in this phase:`, submissions.map(s => s.playerId));
  
  // Check if both players submitted for this phase
  const bothSubmitted = submissions.length >= 2;
  
  console.log(`Room ${roomCode} - Phase: ${submissionType}, Submissions: ${submissions.length}, Both submitted: ${bothSubmitted}`);
  
  // Emit socket event if both submitted
  if (bothSubmitted) {
    console.log(`Emitting both-players-submitted event to room ${roomCode} for phase ${submissionType}`);
    io.to(roomCode).emit('both-players-submitted', { phase: submissionType });
  }
  
  res.json({ 
    success: true, 
    message: 'Ranking submitted',
    totalSubmissions: submissions.length,
    bothSubmitted
  });
});

// Get random images for a room/category (generates and stores them)
app.get('/api/room/:roomCode/images/:category', (req, res) => {
  const { roomCode, category } = req.params;
  const imagesDir = path.join(__dirname, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    return res.json([]);
  }
  
  // Check if room exists and already has images for this category
  if (rooms.has(roomCode)) {
    const room = rooms.get(roomCode);
    if (room.images && room.images.category === category) {
      // Return existing images
      return res.json(room.images.files);
    }
  }
  
  let allFiles = [];
  
  if (category === 'random') {
    // Get images from all subdirectories
    const subdirs = fs.readdirSync(imagesDir)
      .filter(item => fs.statSync(path.join(imagesDir, item)).isDirectory());
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(imagesDir, subdir);
      const files = fs.readdirSync(subdirPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => `/images/${subdir}/${file}`);
      allFiles = allFiles.concat(files);
    });
  } else {
    // Get images from specific category folder
    const categoryDir = path.join(imagesDir, category);
    
    if (!fs.existsSync(categoryDir)) {
      return res.json([]);
    }
    
    allFiles = fs.readdirSync(categoryDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/images/${category}/${file}`);
  }
  
  // Shuffle and pick 5 random images
  const shuffled = allFiles.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  
  // Store images in room
  if (rooms.has(roomCode)) {
    const room = rooms.get(roomCode);
    room.images = {
      category,
      files: selected
    };
  }
  
  res.json(selected);
});

// Old endpoint for backward compatibility
app.get('/api/random-images/:category', (req, res) => {
  const { category } = req.params;
  const imagesDir = path.join(__dirname, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    return res.json([]);
  }
  
  let allFiles = [];
  
  if (category === 'random') {
    // Get images from all subdirectories
    const subdirs = fs.readdirSync(imagesDir)
      .filter(item => fs.statSync(path.join(imagesDir, item)).isDirectory());
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(imagesDir, subdir);
      const files = fs.readdirSync(subdirPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => `/images/${subdir}/${file}`);
      allFiles = allFiles.concat(files);
    });
  } else {
    // Get images from specific category folder
    const categoryDir = path.join(imagesDir, category);
    
    if (!fs.existsSync(categoryDir)) {
      return res.json([]);
    }
    
    allFiles = fs.readdirSync(categoryDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/images/${category}/${file}`);
  }
  
  // Shuffle and pick 5 random images
  const shuffled = allFiles.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  
  res.json(selected);
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
    
    // Update room with player info
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      if (!room.players.includes(socket.id)) {
        room.players.push(socket.id);
      }
      
      // Notify all players in room about player count
      io.to(roomCode).emit('room-update', {
        playerCount: room.players.length
      });
    }
  });

  // Handle game selection
  socket.on('game-selected', ({ roomCode, gameId }) => {
    console.log(`Game ${gameId} selected in room ${roomCode}`);
    // Broadcast to all clients in the room
    io.to(roomCode).emit('navigate-to-game', { gameId });
  });

  // Handle category selection
  socket.on('category-selected', ({ roomCode, category }) => {
    console.log(`Category ${category} selected in room ${roomCode}`);
    // Broadcast to all clients in the room
    io.to(roomCode).emit('navigate-to-category', { category });
  });

  // Leave room
  socket.on('leave-room', (roomCode) => {
    socket.leave(roomCode);
    console.log(`Socket ${socket.id} left room ${roomCode}`);
    
    // Remove player from room
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      room.players = room.players.filter(id => id !== socket.id);
      
      // Notify remaining players
      io.to(roomCode).emit('room-update', {
        playerCount: room.players.length
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove from all rooms
    rooms.forEach((room, roomCode) => {
      if (room.players.includes(socket.id)) {
        room.players = room.players.filter(id => id !== socket.id);
        io.to(roomCode).emit('room-update', {
          playerCount: room.players.length
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
