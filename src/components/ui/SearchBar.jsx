// Modern search bar component with Bahrain-specific locations
import { useState } from 'react'
import { Search, MapPin, Home, DollarSign, Bed } from 'lucide-react'
import { bahrainLocations } from '../../data/sampleData'

const SearchBar = ({ onSearch, className = '' }) => {
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: ''
  })

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchData)
  }

  const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'House', 'Studio']
  const priceRanges = [
    'Under 100K BHD',
    '100K-200K BHD', 
    '200K-300K BHD',
    '300K-500K BHD',
    '500K+ BHD'
  ]
  const bedroomOptions = ['1', '2', '3', '4', '5+']

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 ${className}`}>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Location Dropdown */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
          <select
            value={searchData.location}
            onChange={(e) => setSearchData({...searchData, location: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value="">Select Location</option>
            {bahrainLocations.map(location => (
              <option key={location} value={location.toLowerCase()}>{location}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="relative">
          <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
          <select
            value={searchData.propertyType}
            onChange={(e) => setSearchData({...searchData, propertyType: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value="">Property Type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
          <select
            value={searchData.priceRange}
            onChange={(e) => setSearchData({...searchData, priceRange: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value="">Price Range</option>
            {priceRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div className="relative">
          <Bed className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
          <select
            value={searchData.bedrooms}
            onChange={(e) => setSearchData({...searchData, bedrooms: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white"
          >
            <option value="">Bedrooms</option>
            {bedroomOptions.map(bed => (
              <option key={bed} value={bed}>{bed} Bed{bed !== '1' ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  )
}

export default SearchBar