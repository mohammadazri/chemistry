import { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { FlaskConical, LayoutDashboard, LogIn } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LabPage from './pages/LabPage'
import ThemeToggle from './components/panels/ThemeToggle'
import { supabase } from './lib/supabase'
import { useUserStore } from './store/userStore'

function App() {
  const location = useLocation()
  const setSession = useUserStore((state) => state.setSession)

  // Listen for Supabase auth state changes (login, logout, token refresh, page reload)
  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession])

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans">
      {/* Premium Glassmorphic Navigation */}
      {location.pathname !== '/lab' && (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 border border-white/10 dark:border-white/5">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground tracking-tight">
                  HoloLab
                </span>
              </div>

              {/* Nav Links & Theme Toggle */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex gap-0.5 sm:gap-1 items-center bg-muted/50 p-1 sm:p-1.5 rounded-full border border-border/50 shadow-inner">
                  <Link
                    to="/"
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/' ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/dashboard' ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link
                    to="/lab"
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location.pathname === '/lab' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-sm border border-indigo-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span className="hidden sm:inline">Lab</span>
                  </Link>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
      )}

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
