import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './SelectGame.css'

function SelectGame() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const [socket, setSocket] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  
  const games = [
    { id: 'rank-off', name: 'Rank Off' }
  ]
  
  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)
    
    // Join the room
    newSocket.emit('join-room', roomCode)
    
    // Listen for game navigation events
    newSocket.on('navigate-to-game', ({ gameId }) => {
      if (gameId === 'rank-off') {
        navigate(`/room/${roomCode}/category-select`)
      }
    })
    
    // Listen for room updates
    newSocket.on('room-update', ({ playerCount }) => {
      setPlayerCount(playerCount)
    })
    
    // Cleanup on unmount
    return () => {
      newSocket.emit('leave-room', roomCode)
      newSocket.disconnect()
    }
  }, [roomCode, navigate])
  
  const handleGameSelect = (gameId) => {
    // Emit game selection to all players in room
    if (socket) {
      socket.emit('game-selected', { roomCode, gameId })
    }
  }
  
  const handleCloseRoom = async () => {
    if (socket) {
      socket.emit('leave-room', roomCode)
      socket.disconnect()
    }
    
    try {
      await fetch(`http://localhost:3001/api/room/${roomCode}`, {
        method: 'DELETE'
      })
    } catch (err) {
      console.error('Error deleting room:', err)
    }
    navigate('/')
  }
  
  return (
    <div className="select-game">
      <h1>Select a Game</h1>
      <div className="room-code-display">
        Room Code: <span className="room-code">{roomCode}</span>
        {playerCount > 0 && (
          <span className="player-count"> • {playerCount} player{playerCount !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="game-grid">
        {games.map(game => (
          <button
            key={game.id}
            className="game-button"
            onClick={() => handleGameSelect(game.id)}
          >
            {game.name}
          </button>
        ))}
      </div>
      <button className="back-button" onClick={handleCloseRoom}>
        Close Room
      </button>
    </div>
  )
}

export default SelectGame
