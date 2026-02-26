import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LabPage from './pages/LabPage'
import './App.css'

function App() {
  return (
    <>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <Link to="/" className="hover:text-blue-300">Login</Link>
        <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
        <Link to="/lab" className="hover:text-blue-300">Lab</Link>
      </nav>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lab" element={<LabPage />} />
      </Routes>
    </>
  )
}

export default App
