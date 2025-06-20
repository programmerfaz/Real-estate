// Enhanced property card component with modern design
import { useState } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Eye, Star } from 'lucide-react'

const PropertyCard = ({ property, onFavoriteToggle, isFavorite = false, showRating = false }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    setIsFavoriteLoading(true)
    try {
      await onFavoriteToggle(property.id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  /**
   * Format price based on property category (sale/rent)
   * @param {number} price - Property price
   * @param {string} category - Property category (sale/rent)
   * @returns {string} Formatted price string
   */
  const formatPrice = (price, category) => {
    const formattedPrice = new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(price))

    return category === 'rent' ? `${formattedPrice}/month` : formattedPrice
  }

  /**
   * Get property type badge color
   * @param {string} category - Property category
   * @returns {string} CSS classes for badge
   */
  const getBadgeColor = (category) => {
    return category === 'rent' 
      ? 'bg-green-600 text-white' 
      : 'bg-blue-600 text-white'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100">
      {/* Property Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image_url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={property.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Loading skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isFavoriteLoading}
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Property Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getBadgeColor(property.category)}`}>
            {property.category === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-lg font-bold">
            {formatPrice(property.price, property.category)}
          </span>
        </div>

        {/* Rating Badge (if enabled) */}
        {showRating && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium ml-1">4.8</span>
            </div>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium">{property.location}</span>
        </div>

        {/* Property Features */}
        <div className="flex items-center justify-between text-gray-600 mb-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1.5 text-gray-400" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1.5 text-gray-400" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1.5 text-gray-400" />
              <span className="text-sm font-medium">{property.area}m²</span>
            </div>
          </div>
        </div>

        {/* Property Description */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
          {property.description || 'Beautiful property in prime location with modern amenities and excellent connectivity.'}
        </p>

        {/* Features Tags */}
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  )
}

export default PropertyCard