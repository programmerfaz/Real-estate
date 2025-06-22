import React from 'react';
import { Bed, Bath, MapPin, Heart, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropertyCard = ({
  title,
  location,
  price,
  beds,
  baths,
  area,
  imageUrl,
  type,
  featured = false
}) => {
  return (
    <Link to="/buy">
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105 cursor-pointer">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-64 object-cover transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              featured 
                ? 'bg-yellow-400 text-yellow-900' 
                : 'bg-blue-600 text-white'
            }`}>
              {featured ? 'Featured' : type}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
            <Camera className="w-3 h-3" />
            12
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            {location}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{beds} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{baths} Baths</span>
            </div>
            <div className="text-sm">
              {area} sq ft
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {price.toLocaleString()} BHD
              </span>
              <span className="text-gray-500 text-sm ml-1">/month</span>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
