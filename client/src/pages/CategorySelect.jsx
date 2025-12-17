import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './CategorySelect.css'

function CategorySelect() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const [socket, setSocket] = useState(null)
  
  const categories = [
    { id: 'animals', name: 'Animals' },
    { id: 'food', name: 'Food' },
    { id: 'sports', name: 'Sports' },
    { id: 'movies', name: 'Movies' },
    { id: 'random', name: 'Random (All)' }
  ]
  
  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)
    
    // Join the room
    newSocket.emit('join-room', roomCode)
    
    // Listen for category navigation events
    newSocket.on('navigate-to-category', ({ category }) => {
      navigate(`/room/${roomCode}/rank-off/${category}`)
    })
    
    // Cleanup on unmount
    return () => {
      newSocket.emit('leave-room', roomCode)
      newSocket.disconnect()
    }
  }, [roomCode, navigate])
  
  const handleCategorySelect = (categoryId) => {
    // Emit category selection to all players in room
    if (socket) {
      socket.emit('category-selected', { roomCode, category: categoryId })
    }
  }
  
  return (
    <div className="category-select">
      <h1>Select a Category</h1>
      <div className="category-grid">
        {categories.map(category => (
          <button
            key={category.id}
            className="category-button"
            onClick={() => handleCategorySelect(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <button className="back-button" onClick={() => navigate(`/room/${roomCode}`)}>
        Back to Game Select
      </button>
    </div>
  )
}

export default CategorySelect
