import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import RankOff from './pages/RankOff'

function HomePage() {
	const navigate = useNavigate()

  return (
    <div className="App">
      <h1>Bored Games</h1>
      <div className="card">
        <button onClick={() => navigate('/rankoff')}>
        	Rank Off
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
				<Route path="/rankoff" element={<RankOff />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
