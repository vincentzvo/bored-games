import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './RankOff.css'

function RankOff() {
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState([
    { id: 1, color: '#FF6B6B' },
    { id: 2, color: '#4ECDC4' },
    { id: 3, color: '#45B7D1' },
    { id: 4, color: '#FFA07A' },
    { id: 5, color: '#98D8C8' }
  ])
  const [draggedIndex, setDraggedIndex] = useState(null)
  
  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = (dropIndex) => {
    if (draggedIndex === null) return
    
    const newBoxes = [...boxes]
    const draggedBox = newBoxes[draggedIndex]
    newBoxes.splice(draggedIndex, 1)
    newBoxes.splice(dropIndex, 0, draggedBox)
    
    setBoxes(newBoxes)
    setDraggedIndex(null)
  }
  
  return (
    <div>
      <h1>Rank Off</h1>
      <div className="card">
        <button onClick={() => navigate('/')}>
        	Home
        </button>
      </div>
      
      <div className="box-container">
        {boxes.map((box, index) => (
          <div
            key={box.id}
            className="draggable-box"
            style={{ backgroundColor: box.color }}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RankOff