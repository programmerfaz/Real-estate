import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import PropertyCard from '../components/PropertyCard'
import { propertyService } from '../config/supabase'
import { ChevronLeft, ChevronRight, TrendingUp, Users, Award, MapPin } from 'lucide-react'

const Home = () => {
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Sample properties data (will be replaced with Supabase data)
  const sampleProperties = [
    {
      id: 1,
      title: 'Luxury Villa in Riffa',
      location: 'Riffa, Bahrain',
      price: 250000,
      bedrooms: 4,
      bathrooms: 3,
      area: 300,
      type: 'For Sale',
      image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Stunning luxury villa with modern amenities and beautiful garden.'
    },
    {
      id: 2,
      title: 'Modern Apartment in Manama',
      location: 'Manama, Bahrain',
      price: 120000,
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      type: 'For Sale',
      image_url: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Contemporary apartment in the heart of Manama with city views.'
    },
    {
      id: 3,
      title: 'Beachfront Townhouse',
      location: 'Muharraq, Bahrain',
      price: 180000,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      type: 'For Sale',
      image_url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Beautiful townhouse with direct beach access and sea views.'
    },
    {
      id: 4,
      title: 'Family Home in Hamad Town',
      location: 'Hamad Town, Bahrain',
      price: 95000,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      type: 'For Sale',
      image_url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Perfect family home in quiet residential area with garden.'
    }
  ]

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    // Load properties
    loadProperties()

    return () => unsubscribe()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      // Try to load from Supabase, fallback to sample data
      try {
        const data = await propertyService.getProperties()
        setProperties(data.length > 0 ? data : sampleProperties)
      } catch (error) {
        console.log('Using sample data:', error.message)
        setProperties(sampleProperties)
      }
    } catch (error) {
      console.error('Error loading properties:', error)
      setProperties(sampleProperties)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (propertyId) => {
    if (!user) {
      alert('Please sign in to add favorites')
      return
    }

    try {
      await propertyService.toggleFavorite(user.uid, propertyId)
      // Refresh properties or update state
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(properties.length / 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(properties.length / 4)) % Math.ceil(properties.length / 4))
  }

  const stats = [
    { icon: TrendingUp, label: 'Properties Sold', value: '1,200+' },
    { icon: Users, label: 'Happy Clients', value: '850+' },
    { icon: Award, label: 'Years Experience', value: '15+' },
    { icon: MapPin, label: 'Locations', value: '25+' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties in Bahrain's most desirable locations
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
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
          ) : (
            <div className="relative">
              {/* Property Cards Carousel */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(properties.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {properties.slice(slideIndex * 4, (slideIndex + 1) * 4).map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            onFavoriteToggle={handleFavoriteToggle}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {properties.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Your Trusted Real Estate Partner in Bahrain
              </h2>
              <p className="text-gray-600 mb-6">
                With over 15 years of experience in the Bahrain real estate market, Wealth Home has helped 
                thousands of families find their dream homes and investors discover profitable opportunities.
              </p>
              <p className="text-gray-600 mb-8">
                Our team of expert agents provides personalized service, market insights, and comprehensive 
                support throughout your real estate journey.
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Learn More About Us
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Real estate team"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WH</span>
                </div>
                <span className="text-xl font-bold">Wealth Home</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for real estate in Bahrain. Find, sell, or invest with confidence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Buy Properties</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rent Properties</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sell Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Manama</li>
                <li>Riffa</li>
                <li>Muharraq</li>
                <li>Hamad Town</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+973 1234 5678</li>
                <li>info@wealthhome.bh</li>
                <li>Manama, Bahrain</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wealth Home. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home