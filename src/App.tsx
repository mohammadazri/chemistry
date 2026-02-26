import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { FlaskConical, LayoutDashboard, LogIn } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LabPage from './pages/LabPage'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Premium Glassmorphic Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0f1a]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 border border-white/10">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                HoloLab
              </span>
            </div>

            {/* Nav Links */}
            <div className="flex gap-1 items-center bg-white/5 p-1.5 rounded-full border border-white/10 shadow-inner">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/lab"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/lab' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Lab</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col relative">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lab" element={<LabPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
