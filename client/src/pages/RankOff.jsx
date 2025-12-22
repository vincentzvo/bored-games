import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './RankOff.css'

function RankOff() {
  const navigate = useNavigate()
  const { roomCode, category } = useParams()
  const [boxes, setBoxes] = useState([])
  const initialBoxesRef = useRef([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState('original') // 'original' or 'guess'
  const [socket, setSocket] = useState(null)
  const [playerId] = useState(() => {
    // Generate unique player ID per session (not shared across tabs)
    let id = sessionStorage.getItem('playerId')
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('playerId', id)
    }
    console.log('Player ID:', id)
    return id
  })
  
  useEffect(() => {
    // Fetch random images from backend based on room and category
    // This ensures all players in the room get the same images
    fetch(`http://localhost:3001/api/room/${roomCode}/images/${category}`)
      .then(res => res.json())
      .then(images => {
        const boxData = images.map((imagePath, index) => ({
          id: index + 1,
          image: `http://localhost:3001${imagePath}`
        }));
        setBoxes(boxData);
        initialBoxesRef.current = boxData; // Store initial order in ref
      })
      .catch(err => console.error('Error fetching images:', err));
  }, [roomCode, category])
  
  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001')
    
    // Join the room
    newSocket.emit('join-room', roomCode)
    console.log('RankOff: Joined room', roomCode)
    
    // Listen for both players submitting
    newSocket.on('both-players-submitted', ({ phase: submittedPhase }) => {
      console.log('RankOff: Socket event received - both-players-submitted for phase:', submittedPhase)
      
      if (submittedPhase === 'original') {
        console.log('RankOff: Resetting to guess phase')
        // Use functional updates to avoid stale closures
        setPhase(() => 'guess')
        setSubmitted(() => false)
        setBoxes(() => [...initialBoxesRef.current])
      }
    })
    
    setSocket(newSocket)
    
    // Cleanup on unmount
    return () => {
      console.log('RankOff: Cleaning up socket')
      newSocket.emit('leave-room', roomCode)
      newSocket.disconnect()
    }
  }, [roomCode])
  
  const handleDragStart = (index) => {
    if (submitted) return
    setDraggedIndex(index)
  }
  
  const handleDragOver = (e) => {
    if (submitted) return
    e.preventDefault()
  }
  
  const handleDrop = (dropIndex) => {
    if (submitted || draggedIndex === null) return
    
    const newBoxes = [...boxes]
    const draggedBox = newBoxes[draggedIndex]
    newBoxes.splice(draggedIndex, 1)
    newBoxes.splice(dropIndex, 0, draggedBox)
    
    setBoxes(newBoxes)
    setDraggedIndex(null)
  }
  
  const handleSubmit = async () => {
    // Create ranking array with image IDs in order
    const ranking = boxes.map(box => box.image)
    const currentPhase = phase // Capture current phase
    
    try {
      const response = await fetch(`http://localhost:3001/api/room/${roomCode}/submit-ranking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId,
          ranking,
          phase: currentPhase // Send the phase we're submitting for
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Only set submitted if we're still in the same phase
        setPhase(p => {
          if (p === currentPhase) {
            setSubmitted(true)
            if (currentPhase === 'guess') {
              console.log('Guess submitted successfully')
            } else {
              console.log('Original ranking submitted successfully')
            }
          } else {
            console.log(`Submission response received for ${currentPhase} but already moved to ${p}, ignoring`)
          }
          return p
        })
      }
    } catch (err) {
      console.error('Error submitting ranking:', err)
    }
  }
  
  const getPhaseText = () => {
    if (phase === 'original') {
      return submitted ? 'Waiting for other player...' : 'Submit Your Ranking'
    } else {
      return submitted ? 'Guess Submitted ✓' : 'Submit Your Guess'
    }
  }
  
  const getInstructions = () => {
    if (phase === 'original') {
      return 'Rank these items from 1 (best) to 5 (worst)'
    } else {
      return 'Guess how the other player ranked these items'
    }
  }
  
  return (
    <div>
      <h1>Rank Off</h1>
      <p className="phase-instructions">{getInstructions()}</p>
      
      <div className="box-container">
        {boxes.map((box, index) => (
          <div key={box.id} className="box-wrapper">
            <div
              className={`draggable-box ${submitted ? 'disabled' : ''}`}
              draggable={!submitted}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <img src={box.image} alt={`Item ${index + 1}`} className="box-image" />
            </div>
            <div className="box-number">{index + 1}</div>
          </div>
        ))}
      </div>
      
      <div className="submit-container">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={submitted}
        >
          {getPhaseText()}
        </button>
      </div>
    </div>
  )
}

export default RankOff