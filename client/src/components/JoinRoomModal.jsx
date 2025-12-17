import { useState } from 'react'
import './JoinRoomModal.css'

function JoinRoomModal({ isOpen, onClose, onJoin }) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 4)
    setRoomCode(value)
    setError('')
  }

  const handleJoin = async () => {
    if (roomCode.length !== 4) {
      setError('Room code must be exactly 4 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:3001/api/room/${roomCode}/exists`)
      const data = await response.json()

      if (data.exists) {
        onJoin(roomCode)
        setRoomCode('')
      } else {
        setError('Room not found. Please check the code and try again.')
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && roomCode.length === 4) {
      handleJoin()
    }
  }

  const handleClose = () => {
    setRoomCode('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Room</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <label htmlFor="room-code-input">Enter Room Code</label>
          <input
            id="room-code-input"
            type="text"
            className="room-code-input"
            value={roomCode}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="XXXX"
            maxLength={4}
            autoFocus
          />
          <div className="room-code-hint">{roomCode.length}/4 characters</div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            className="join-button"
            onClick={handleJoin}
            disabled={roomCode.length !== 4 || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinRoomModal
