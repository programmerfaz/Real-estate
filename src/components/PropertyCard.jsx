import { useState } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Eye } from 'lucide-react'

const PropertyCard = ({ property, onFavoriteToggle, isFavorite = false }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  const handleFavoriteClick = async () => {
    setIsFavoriteLoading(true)
    try {
      await onFavoriteToggle(property.id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={property.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isFavoriteLoading}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {property.type || 'For Sale'}
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
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Property Features */}
        <div className="flex items-center justify-between text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.bedrooms || 3}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.bathrooms || 2}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.area || 150}m²</span>
            </div>
          </div>
        </div>

        {/* Property Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description || 'Beautiful property in prime location with modern amenities and excellent connectivity.'}
        </p>

        {/* Action Button */}
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  )
}

export default PropertyCard