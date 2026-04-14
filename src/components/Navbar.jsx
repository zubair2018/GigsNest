import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-syne font-extrabold text-lg tracking-tight">
          Gigs<span className="text-brand">Nest</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-2">
          {user && (
            <>
              <Link to="/my-jobs" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                My Posts
              </Link>
              <Link to="/saved" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                Saved
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/post')}
                className="btn-primary"
              >
                + Post Job
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-brand transition-all"
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                        {user.displayName?.[0]}
                      </div>
                  }
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg p-1 w-44 z-50">
                    <p className="px-3 py-2 text-xs text-gray-400 truncate">{user.displayName}</p>
                    <hr className="border-gray-100 my-1" />
                    <button
                      onClick={() => { logout(); setMenuOpen(false) }}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={handleSignIn} className="btn-primary flex items-center gap-2">
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Mobile: just sign in + post */}
        <div className="flex sm:hidden items-center gap-2">
          {user
            ? <button onClick={() => navigate('/post')} className="btn-primary text-xs px-3 py-1.5">+ Post</button>
            : <button onClick={handleSignIn} className="btn-primary text-xs px-3 py-1.5">Sign in</button>
          }
        </div>
      </div>
    </nav>
  )
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37.4 9.3C34 6.2 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9L37.4 9.3C34 6.2 29.2 4 24 4c-7.7 0-14.4 4.1-18.1 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-2.9-11.3-7H6.1C9.6 39.5 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.7 2.1-2 3.9-3.8 5.2l6.2 5.2C41.2 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}
