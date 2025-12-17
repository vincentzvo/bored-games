import { useNavigate, useParams } from 'react-router-dom'
import './CategorySelect.css'

function CategorySelect() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  
  const categories = [
    { id: 'animals', name: 'Animals' },
    { id: 'food', name: 'Food' },
    { id: 'sports', name: 'Sports' },
    { id: 'movies', name: 'Movies' },
    { id: 'random', name: 'Random (All)' }
  ]
  
  const handleCategorySelect = (categoryId) => {
    navigate(`/room/${roomCode}/rank-off/${categoryId}`)
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
