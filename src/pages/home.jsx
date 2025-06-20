// Redesigned home page with modern UI and Supabase integration
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Users, Award, MapPin, Star, ArrowRight } from 'lucide-react'
import { auth } from '../firebase'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/sections/HeroSection'
import PropertyCard from '../components/ui/PropertyCard'
import { propertyService } from '../config/supabase'
import { sampleSaleProperties, sampleRentalProperties, getRandomProperties } from '../data/sampleData'

const Home = () => {
  const [user, setUser] = useState(null)
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
    })

    // Load properties
    loadProperties()

    return () => unsubscribe()
  }, [])

  /**
   * Load properties from Supabase or use sample data as fallback
   */
  const loadProperties = async () => {
    try {
      setLoading(true)
      
      // Try to load from Supabase, fallback to sample data
      try {
        const [saleData, rentalData] = await Promise.all([
          propertyService.getProperties({ category: 'sale' }),
          propertyService.getProperties({ category: 'rent' })
        ])
        
        if (saleData.length > 0 || rentalData.length > 0) {
          setFeaturedProperties([...saleData, ...rentalData].slice(0, 8))
          setRecentProperties([...saleData, ...rentalData].slice(0, 6))
        } else {
          throw new Error('No data from Supabase')
        }
      } catch (error) {
        console.log('Using sample data:', error.message)
        // Use sample data with random variations
        const randomSale = getRandomProperties(sampleSaleProperties, 4)
        const randomRental = getRandomProperties(sampleRentalProperties, 4)
        setFeaturedProperties([...randomSale, ...randomRental])
        setRecentProperties(getRandomProperties([...sampleSaleProperties, ...sampleRentalProperties], 6))
      }
    } catch (error) {
      console.error('Error loading properties:', error)
      // Fallback to sample data
      const randomSale = getRandomProperties(sampleSaleProperties, 4)
      const randomRental = getRandomProperties(sampleRentalProperties, 4)
      setFeaturedProperties([...randomSale, ...randomRental])
      setRecentProperties(getRandomProperties([...sampleSaleProperties, ...sampleRentalProperties], 6))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle favorite toggle for properties
   * @param {number} propertyId - Property ID to toggle
   */
  const handleFavoriteToggle = async (propertyId) => {
    if (!user) {
      alert('Please sign in to add favorites')
      return
    }

    try {
      await propertyService.toggleFavorite(user.uid, propertyId)
      // Optionally refresh properties or update state
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  /**
   * Handle search from hero section
   * @param {Object} searchData - Search parameters
   */
  const handleHeroSearch = (searchData) => {
    console.log('Search initiated:', searchData)
    // Navigate to buy/rent page with search parameters
    // This could be implemented with URL parameters
  }

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProperties.length / 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredProperties.length / 4)) % Math.ceil(featuredProperties.length / 4))
  }

  // Statistics data
  const stats = [
    { icon: TrendingUp, label: 'Properties Sold', value: '1,200+', color: 'text-blue-600' },
    { icon: Users, label: 'Happy Clients', value: '850+', color: 'text-green-600' },
    { icon: Award, label: 'Years Experience', value: '15+', color: 'text-purple-600' },
    { icon: MapPin, label: 'Locations', value: '25+', color: 'text-orange-600' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection onSearch={handleHeroSearch} />

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of premium properties in Bahrain's most desirable locations
            </p>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Property Cards Carousel */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredProperties.length / 4) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProperties.slice(slideIndex * 4, (slideIndex + 1) * 4).map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            onFavoriteToggle={handleFavoriteToggle}
                            showRating={true}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {featuredProperties.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hover:shadow-2xl"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hover:shadow-2xl"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <a
              href="/buy"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-1">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Recently Added
              </h2>
              <p className="text-xl text-gray-600">
                Fresh properties just added to our collection
              </p>
            </div>
            <a
              href="/buy"
              className="hidden md:inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Trusted Real Estate Partner in Bahrain
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With over 15 years of experience in the Bahrain real estate market, Wealth Home has helped 
                thousands of families find their dream homes and investors discover profitable opportunities.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our team of expert agents provides personalized service, market insights, and comprehensive 
                support throughout your real estate journey.
              </p>
              
              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  'Expert market knowledge',
                  'Personalized property matching',
                  'Professional photography',
                  'Legal support and documentation',
                  '24/7 customer service'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Learn More About Us
              </button>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Real estate team in Bahrain"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">850+ Happy Clients</div>
                    <div className="text-sm text-gray-600">Trusted by families across Bahrain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">WH</span>
                </div>
                <span className="text-2xl font-bold">Wealth Home</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your trusted partner for real estate in Bahrain. Find, sell, or invest with confidence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/buy" className="hover:text-white transition-colors">Buy Properties</a></li>
                <li><a href="/rent" className="hover:text-white transition-colors">Rent Properties</a></li>
                <li><a href="/favorites" className="hover:text-white transition-colors">My Favorites</a></li>
                <li><a href="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Popular Locations</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Manama</li>
                <li>Riffa</li>
                <li>Juffair</li>
                <li>Amwaj Islands</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li>+973 1234 5678</li>
                <li>info@wealthhome.bh</li>
                <li>Manama, Kingdom of Bahrain</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Wealth Home. All rights reserved. Made with ❤️ in Bahrain.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home