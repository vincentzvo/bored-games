import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './RankOff.css'

function RankOff() {
  const navigate = useNavigate()
  const { roomCode, category } = useParams()
  const [boxes, setBoxes] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  
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
      
      <div className="box-container">
        {boxes.map((box, index) => (
          <div key={box.id} className="box-wrapper">
            <div
              className="draggable-box"
              draggable
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
    </div>
  )
}

export default RankOff