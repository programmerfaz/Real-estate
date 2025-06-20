import { useState } from 'react'
import { Search, MapPin, Home, DollarSign } from 'lucide-react'

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: ''
  })

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Search data:', searchData)
    // Implement search functionality
  }

  const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Commercial']
  const priceRanges = ['Under 100K BHD', '100K-200K BHD', '200K-500K BHD', '500K+ BHD']
  const bedroomOptions = ['1', '2', '3', '4', '5+']

  return (
    <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Luxury home in Bahrain"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to Wealth Home
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Find out the best properties in Bahrain!!
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={searchData.location}
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  <option value="manama">Manama</option>
                  <option value="riffa">Riffa</option>
                  <option value="muharraq">Muharraq</option>
                  <option value="hamad-town">Hamad Town</option>
                  <option value="isa-town">Isa Town</option>
                  <option value="sitra">Sitra</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="relative">
                <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={searchData.propertyType}
                  onChange={(e) => setSearchData({...searchData, propertyType: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Property Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={searchData.priceRange}
                  onChange={(e) => setSearchData({...searchData, priceRange: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Price Range</option>
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection