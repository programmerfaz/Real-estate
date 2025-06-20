import { useState, useEffect } from 'react'
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import Navbar from '../components/Navbar'
import PropertyCard from '../components/PropertyCard'

const Rent = () => {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  })

  // Sample rental properties data
  const sampleRentProperties = [
    {
      id: 101,
      title: 'Furnished Apartment in Juffair',
      location: 'Juffair, Bahrain',
      price: 450, // Monthly rent
      bedrooms: 1,
      bathrooms: 1,
      area: 80,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Fully furnished studio apartment with gym, pool, and parking. Perfect for professionals.'
    },
    {
      id: 102,
      title: 'Luxury 2BR in Seef District',
      location: 'Seef, Bahrain',
      price: 650,
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Modern 2-bedroom apartment with sea view, premium amenities, and mall access.'
    },
    {
      id: 103,
      title: 'Family Villa in Saar',
      location: 'Saar, Bahrain',
      price: 1200,
      bedrooms: 4,
      bathrooms: 3,
      area: 300,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Spacious family villa with garden, maid room, and garage in quiet neighborhood.'
    },
    {
      id: 104,
      title: 'Modern Townhouse in Amwaj',
      location: 'Amwaj Islands, Bahrain',
      price: 900,
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Beautiful townhouse with marina view, private parking, and beach access.'
    },
    {
      id: 105,
      title: 'Executive Apartment in Diplomatic Area',
      location: 'Diplomatic Area, Bahrain',
      price: 800,
      bedrooms: 2,
      bathrooms: 2,
      area: 140,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Premium apartment in business district with concierge service and city views.'
    },
    {
      id: 106,
      title: 'Cozy 1BR in Adliya',
      location: 'Adliya, Bahrain',
      price: 380,
      bedrooms: 1,
      bathrooms: 1,
      area: 70,
      type: 'For Rent',
      image_url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Charming apartment in cultural district, walking distance to restaurants and cafes.'
    }
  ]

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [properties, filters])

  const loadProperties = async () => {
    try {
      setLoading(true)
      // Generate new random properties on each refresh
      const shuffled = [...sampleRentProperties].sort(() => Math.random() - 0.5)
      const randomProperties = shuffled.slice(0, Math.floor(Math.random() * 3) + 4) // 4-6 properties
      
      // Add some variation to prices and details
      const variatedProperties = randomProperties.map(property => ({
        ...property,
        id: property.id + Math.floor(Math.random() * 1000),
        price: property.price + Math.floor(Math.random() * 200) - 100,
        area: property.area + Math.floor(Math.random() * 30) - 15
      }))
      
      setProperties(variatedProperties)
    } catch (error) {
      console.error('Error loading properties:', error)
      setProperties(sampleRentProperties)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...properties]

    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice))
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice))
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms))
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= parseInt(filters.bathrooms))
    }

    setFilteredProperties(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: ''
    })
  }

  const handleFavoriteToggle = async (propertyId) => {
    console.log('Toggle favorite for property:', propertyId)
    // Implement favorite functionality
  }

  // Custom PropertyCard for rental properties (shows monthly rent)
  const RentalPropertyCard = ({ property, onFavoriteToggle, isFavorite = false }) => {
    const formatPrice = (price) => {
      return `${price} BHD/month`
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Property Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              For Rent
            </span>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-gray-600 mb-3">
            <span className="text-sm">{property.location}</span>
          </div>

          {/* Property Features */}
          <div className="flex items-center justify-between text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm">{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm">{property.bathrooms} bath</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm">{property.area}m²</span>
              </div>
            </div>
          </div>

          {/* Property Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          {/* Action Button */}
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
            View Details
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900">Properties for Rent</h1>
              <p className="text-gray-600 mt-1">
                {filteredProperties.length} rental properties available in Bahrain
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    <option value="juffair">Juffair</option>
                    <option value="seef">Seef</option>
                    <option value="saar">Saar</option>
                    <option value="amwaj">Amwaj Islands</option>
                    <option value="diplomatic">Diplomatic Area</option>
                    <option value="adliya">Adliya</option>
                  </select>
                </div>

                {/* Monthly Rent Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (BHD)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min Rent"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max Rent"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Bathrooms
                  </label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
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
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rental properties found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProperties.map((property) => (
                  <RentalPropertyCard
                    key={property.id}
                    property={property}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rent