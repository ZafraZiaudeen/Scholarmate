import { Brain, Menu, Settings, BarChart3, TrendingUp, Play, Trophy, LayoutDashboard, FileText, Users, MessageSquare, Home, Contact } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser, UserButton } from "@clerk/clerk-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"

export default function Header() {
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const isAdmin = user?.publicMetadata?.role === 'admin'
  const isAdminPath = location.pathname.startsWith('/admin')

  const getPageTitle = () => {
    const path = location.pathname
    if (!user) {
      switch (path) {
        case '/':
          return 'Home'
        case '/sign-in':
          return 'Sign In'
        case '/sign-up':
          return 'Sign Up'
        default:
          return 'ScholarMate'
      }
    }
    
    if (isAdminPath) {
      if (path === '/admin' || path === '/admin/dashboard') return 'Admin Dashboard'
      if (path === '/admin/users') return 'User Management'
      if (path === '/admin/papers') return 'Papers Management'
      if (path === '/admin/contacts') return 'Contact Management'
      if (path === '/admin Videos') return 'Videos Management'
      if (path === '/admin/analytics') return 'Analytics'
      if (path === '/admin/settings') return 'Settings'
      return 'Admin Panel'
    }
    
    switch (path) {
      case '/dashboard':
        return 'Dashboard'
      case '/ai':
        return 'AI Tutor'
      case '/task':
        return 'Learning Tasks'
      case '/past-papers':
        return 'Past Papers'
      case '/videos':
        return 'Video Learning'
      case '/achievements':
        return 'Achievements'
      case '/contact':
        return 'Contact'
      default:
        return 'ScholarMate'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate(user ? (isAdmin && isAdminPath ? '/admin/dashboard' : '/dashboard') : '/')}
            >
              <Brain className="h-8 w-8 text-cyan-600" />
              <span className="text-xl font-bold text-slate-900">ScholarMate</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                {getPageTitle()}
              </Badge>
              {isAdmin && isAdminPath && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Admin
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Navigation and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                isAdminPath ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/dashboard')}
                      className="text-slate-600 hover:text-black"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/analytics')}
                      className="text-slate-600 hover:text-black"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/users')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/papers')}
                      className="text-slate-600 hover:text-black"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Papers
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/contacts')}
                      className="text-slate-600 hover:text-black"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacts
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/videos')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Videos
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/admin/settings')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/contact')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Contact className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-600 hover:text-black border-cyan-200"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Student Dashboard
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="text-slate-600 hover:text-black"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/ai')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Tutor
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/task')}
                      className="text-slate-600 hover:text-black"
                    >
                      Tasks
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/past-papers')}
                      className="text-slate-600 hover:text-black"
                    >
                      Papers
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/videos')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Videos
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/achievements')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Achievements
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/contact')}
                      className="text-slate-600 hover:text-black"
                    >
                      <Contact className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-slate-600 hover:text-black border-cyan-200"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                  </>
                )
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/')}
                    className="text-slate-600 hover:text-black"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/contact')}
                    className="text-slate-600 hover:text-black"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/sign-in')}
                    className="text-slate-600 hover:text-black border-cyan-200"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/sign-up')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                    Navigation
                  </div>
                  {user ? (
                    isAdminPath ? (
                      <>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/dashboard')
                            setShowMobileMenu(false)
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/analytics')
                            setShowMobileMenu(false)
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/users')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Users
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/papers')
                            setShowMobileMenu(false)
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Papers
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/contacts')
                            setShowMobileMenu(false)
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contacts
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/videos')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Videos
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/admin/settings')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/contact')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Contact className="h-4 w-4 mr-2" />
                          Contact Us
                        </button>
                        {isAdmin && (
                          <button
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              navigate('/dashboard')
                              setShowMobileMenu(false)
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Student Dashboard
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/dashboard')
                            setShowMobileMenu(false)
                          }}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/ai')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          AI Tutor
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            navigate('/task')
                            setShowMobileMenu(false)
                          }}
                        >
                          Tasks
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            navigate('/past-papers')
                            setShowMobileMenu(false)
                          }}
                        >
                          Past Papers
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/videos')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Video Learning
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/achievements')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Trophy className="h-4 w-4 mr-2" />
                          Achievements
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => {
                            navigate('/contact')
                            setShowMobileMenu(false)
                          }}
                        >
                          <Contact className="h-4 w-4 mr-2" />
                          Contact Us
                        </button>
                        {isAdmin && (
                          <button
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              navigate('/admin/dashboard')
                              setShowMobileMenu(false)
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </button>
                        )}
                      </>
                    )
                  ) : (
                    <>
                      <button
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          navigate('/')
                          setShowMobileMenu(false)
                        }}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </button>
                      <button
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          navigate('/contact')
                          setShowMobileMenu(false)
                        }}
                      >
                        <Contact className="h-4 w-4 mr-2" />
                        Contact Us
                      </button>
                      <button
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          navigate('/sign-in')
                          setShowMobileMenu(false)
                        }}
                      >
                        Login
                      </button>
                      <button
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          navigate('/sign-up')
                          setShowMobileMenu(false)
                        }}
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Button */}
            {user && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </div>
    </header>
  )
}