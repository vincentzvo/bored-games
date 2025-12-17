import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import RankOff from './pages/RankOff'
import CategorySelect from './pages/CategorySelect'
import SelectGame from './pages/SelectGame'
import JoinRoomModal from './components/JoinRoomModal'

function HomePage() {
	const navigate = useNavigate()
	const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

	const generateRoomCode = () => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let code = ''
		for (let i = 0; i < 4; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		return code
	}

	const handleCreateRoom = async () => {
		const roomCode = generateRoomCode()
		
		// Create room on backend
		try {
			await fetch(`http://localhost:3001/api/room/${roomCode}/create`, {
				method: 'POST'
			})
		} catch (err) {
			console.error('Error creating room:', err)
		}
		
		navigate(`/room/${roomCode}`)
	}

	const handleJoinRoom = (roomCode) => {
		setIsJoinModalOpen(false)
		navigate(`/room/${roomCode}`)
	}

  return (
    <div className="App">
      <h1>Bored Games</h1>
      <div className="card">
        <button onClick={handleCreateRoom}>
        	Create Room
        </button>
        <button onClick={() => setIsJoinModalOpen(true)}>
        	Join Room
        </button>
      </div>
      
      <JoinRoomModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
      />
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
