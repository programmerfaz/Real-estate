import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import PropertyCard from '../components/PropertyCard'
import { auth } from '../firebase'
import { propertyService } from '../config/supabase'

const Favorites = () => {
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  // Sample favorite properties
  const sampleFavorites = [
    {
      id: 1,
      title: 'Luxury Villa in Riffa Views',
      location: 'Riffa, Bahrain',
      price: 350000,
      bedrooms: 5,
      bathrooms: 4,
      area: 400,
      type: 'For Sale',
      image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Stunning luxury villa with private pool, garden, and modern amenities.',
      saved_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Modern Apartment in Seef',
      location: 'Seef, Bahrain',
      price: 650,
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Contemporary apartment with sea view and premium amenities.',
      saved_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ]

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        loadFavorites(user.uid)
      } else {
        setFavorites([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const loadFavorites = async (userId) => {
    try {
      setLoading(true)
      // Try to load from Supabase, fallback to sample data
      try {
        const data = await propertyService.getFavorites(userId)
        setFavorites(data.length > 0 ? data.map(item => item.properties) : sampleFavorites)
      } catch (error) {
        console.log('Using sample favorites:', error.message)
        setFavorites(sampleFavorites)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      setFavorites(sampleFavorites)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (propertyId) => {
    if (!user) return

    try {
      await propertyService.toggleFavorite(user.uid, propertyId)
      setFavorites(prev => prev.filter(property => property.id !== propertyId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      setFavorites([])
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view favorites</h2>
            <p className="text-gray-600 mb-8">
              Create an account or sign in to save your favorite properties
            </p>
            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                My Favorites
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            
            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Heart className="h-24 w-24 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring properties and save your favorites by clicking the heart icon on any property card.
            </p>
            <div className="space-x-4">
              <a
                href="/buy"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Browse Properties for Sale
              </a>
              <a
                href="/rent"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Browse Rental Properties
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard
                  property={property}
                  onFavoriteToggle={handleRemoveFavorite}
                  isFavorite={true}
                />
                
                {/* Saved date */}
                {property.saved_at && (
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs text-gray-600">
                      Saved {formatDate(property.saved_at)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites