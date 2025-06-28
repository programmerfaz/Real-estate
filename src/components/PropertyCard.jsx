import React, { useState } from 'react';
import {
  Bed, Bath, MapPin, Heart, Camera, Star, Phone, Mail, Car,
} from 'lucide-react';
import { Dialog } from '@headlessui/react'; // install with `npm install @headlessui/react`

const PropertyCard = ({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  sqft,
  parking,
  image,
  images = [],
  rating,
  featured,
  type,
  year_built,
  furnished,
  pet_friendly,
  description,
  amenities = [],
  agent_name,
  agent_phone,
  agent_email,
  address,
  showViewButton = true, // New prop to control button visibility
  isFavourite,
  toggleFavourite,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatPrice = (val) => `${val.toLocaleString()} BHD`;
  // const [isFavorited, setIsFavorited] = useState(false);

  return (
    <>
      {/* Summary Card */}
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105 cursor-pointer">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-64 object-cover transition-transform duration-300"
          />

          {/* Tag (Featured or Type) */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${featured
                ? "bg-yellow-400 text-yellow-900"
                : "bg-blue-600 text-white"
                }`}
            >
              {featured ? "Featured" : type}
            </span>
          </div>

          {/* Favorite Icon (Heart) */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering view modal
                toggleFavourite();
              }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isFavourite ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
              />
            </button>
          </div>


          {/* Image count */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {images.length + 1}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            {location}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Property Features */}
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{bathrooms} Baths</span>
            </div>
            <div className="text-sm">{sqft} sq ft</div>
          </div>

          {/* Price + Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              <span className="text-gray-500 text-sm ml-1">/month</span>
            </div>
            {showViewButton &&
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Details
              </button>
            }
          </div>
        </div>
      </div>

      {/* Full Page Modal */}
      {showModal && (
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          {/* Centered Modal Container */}
          <div className="fixed inset-0 flex justify-center items-center p-4">
            <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 overflow-hidden">

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>

              {/* Left: Image Carousel */}
              <div className="md:w-1/2 w-full h-[400px] relative">
                <img
                  src={images[currentIndex]}
                  alt="property"
                  className="w-full h-full object-cover rounded-l-3xl"
                />
                {/* Arrows */}
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white shadow p-1 rounded-full z-10"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white shadow p-1 rounded-full z-10"
                >
                  →
                </button>
                <div className="absolute bottom-2 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>

              {/* Right: Content */}
              <div className="md:w-1/2 w-full overflow-y-auto p-5 space-y-4">
                {/* Title & Address */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                  <p className="text-sm text-gray-500 mt-1">📍 {address}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-bold text-gray-800">${price.toLocaleString()}</span>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">For Sale</span>
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">{type}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">🛏️ {bedrooms} Bedrooms</div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">🛁 {bathrooms} Bathrooms</div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">📐 {sqft} Sq Ft</div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">🚗 {parking} Parking</div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Year: {year_built}</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{furnished}</span>
                  <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">
                    {pet_friendly ? 'Pet Friendly' : 'No Pets'}
                  </span>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold">Amenities</h3>
                  <ul className="grid grid-cols-2 gap-x-4 text-sm text-gray-600 list-disc list-inside">
                    {amenities.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Agent Info */}
                <div className="border-t pt-3">
                  <p className="text-gray-800 font-semibold">Agent: {agent_name}</p>
                  <p className="text-sm text-gray-600">📞 {agent_phone}</p>
                  <p className="text-sm text-gray-600">✉️ {agent_email}</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}



    </>
  );
};

export default PropertyCard;
