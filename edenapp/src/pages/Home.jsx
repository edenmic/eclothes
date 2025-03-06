import { Link } from 'react-router-dom'
import { ShoppingBag, PlusCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to EdenApp</h1>
        <p>Your marketplace for sustainable second-hand shopping</p>
        <div className="cta-buttons">
          <Link to="/items" className="btn btn-primary">
            <ShoppingBag /> Browse Items
          </Link>
          {user && (
            <Link to="/create-listing" className="btn btn-secondary">
              <PlusCircle /> List an Item
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}