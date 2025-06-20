// Modern hero section based on Figma design
import { useState } from 'react'
import SearchBar from '../ui/SearchBar'

const HeroSection = ({ onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Bahrain-specific hero images
  const heroImages = [
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1600'
  ]

  const handleSearch = (searchData) => {
    console.log('Hero search:', searchData)
    if (onSearch) {
      onSearch(searchData)
    }
  }

  return (
    <div className="relative h-[700px] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
      {/* Background Images Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Luxury property in Bahrain ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-700/90"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-center w-full">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                Wealth Home
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-4 font-light">
              Find out the best properties in Bahrain!!
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Discover luxury villas, modern apartments, and investment opportunities 
              in the Kingdom of Bahrain's most prestigious locations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1,200+</div>
              <div className="text-blue-200 text-sm">Properties Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">850+</div>
              <div className="text-blue-200 text-sm">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15+</div>
              <div className="text-blue-200 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">25+</div>
              <div className="text-blue-200 text-sm">Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSection