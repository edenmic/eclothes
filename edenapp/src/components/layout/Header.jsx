import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, User, ShoppingBag, PlusCircle } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">EdenApp</Link>
      </div>
      
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/items">Browse</Link>
        {user && <Link to="/create-listing"><PlusCircle /> List Item</Link>}
      </nav>

      <div className="auth-nav">
        {user ? (
          <>
            <Link to="/profile"><User /> Profile</Link>
            <button onClick={signOut} className="btn-logout">
              <LogOut /> Sign Out
            </button>
          </>
        ) : (
          <Link to="/auth">Sign In</Link>
        )}
      </div>
    </header>
  )
}