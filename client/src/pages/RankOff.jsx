import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './RankOff.css'

function RankOff() {
  const navigate = useNavigate()
  const { roomCode, category } = useParams()
  const [boxes, setBoxes] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [playerId] = useState(() => {
    // Generate unique player ID if not exists
    let id = localStorage.getItem('playerId')
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('playerId', id)
    }
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
      })
      .catch(err => console.error('Error fetching images:', err));
  }, [roomCode, category])
  
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
    
    try {
      const response = await fetch(`http://localhost:3001/api/room/${roomCode}/submit-ranking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId,
          ranking
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
        console.log('Ranking submitted successfully')
      }
    } catch (err) {
      console.error('Error submitting ranking:', err)
    }
  }
  
  return (
    <div>
      <h1>Rank Off</h1>
      
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
          {submitted ? 'Submitted ✓' : 'Submit Ranking'}
        </button>
      </div>
    </div>
  )
}

export default RankOff