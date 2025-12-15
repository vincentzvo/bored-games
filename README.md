# Bored Games

A multiplayer web-based game application built with React and Node.js.

## Project Structure

```
bored-games/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend with Socket.IO
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

## Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation (when needed)

### Backend
- **Express** - Web server framework
- **Socket.IO** - WebSocket library for real-time multiplayer
- **CORS** - Cross-origin resource sharing

## Features to Implement

The project is set up to support:
- Real-time multiplayer gameplay
- Room-based game sessions
- Player name entry (no authentication required)
- Turn-based game mechanics

## Development Notes

- The server uses Socket.IO for real-time bidirectional communication
- CORS is configured to allow the frontend to communicate with the backend
- The project structure separates client and server for easy deployment
- No user authentication - players just enter their name to play
