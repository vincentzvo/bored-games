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

// Get random images endpoint
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

// Store active rooms and players
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle socket events here
  // Example: joining a room, making moves, etc.
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
