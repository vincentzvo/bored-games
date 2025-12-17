import { useNavigate, useParams } from 'react-router-dom'
import './SelectGame.css'

function SelectGame() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  
  const games = [
    { id: 'rank-off', name: 'Rank Off' }
  ]
  
  const handleGameSelect = (gameId) => {
    if (gameId === 'rank-off') {
      navigate(`/room/${roomCode}/category-select`)
    }
  }
  
  return (
    <div className="select-game">
      <h1>Select a Game</h1>
      <div className="room-code-display">
        Room Code: <span className="room-code">{roomCode}</span>
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
      <button className="back-button" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  )
}

export default SelectGame
