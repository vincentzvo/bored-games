import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import RankOff from './pages/RankOff'
import CategorySelect from './pages/CategorySelect'
import SelectGame from './pages/SelectGame'

function HomePage() {
	const navigate = useNavigate()

	const generateRoomCode = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let code = ''
		for (let i = 0; i < 4; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		return code
	}

	const handleCreateRoom = () => {
		const roomCode = generateRoomCode()
		navigate(`/room/${roomCode}`)
	}

  return (
    <div className="App">
      <h1>Bored Games</h1>
      <div className="card">
        <button onClick={handleCreateRoom}>
        	Create Room
        </button>
      </div>
    </div>
  )
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/room/:roomCode" element={<SelectGame />} />
				<Route path="/room/:roomCode/category-select" element={<CategorySelect />} />
				<Route path="/room/:roomCode/rank-off/:category" element={<RankOff />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
