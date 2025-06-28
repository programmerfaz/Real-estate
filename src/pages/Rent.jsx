import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { MapPin, Bed, Bath, Square, Car, Star } from "lucide-react";

const formatPrice = (price) => `$${price.toLocaleString()}`;

const PropertyCard = ({ property, formatPrice }) => {
  if (!property) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl text-gray-900">{property.title}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{property.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="text-2xl font-bold text-blue-600 mb-4">
          {formatPrice(property.price)}
        </div>

        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-sm text-gray-700">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            {property.bedrooms}
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {property.bathrooms}
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            {property.sqft}
          </div>
          <div className="flex items-center">
            <Car className="w-4 h-4 mr-1" />
            {property.parking}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertiesGrid = ({ viewMode }) => {
  const [allProperties, setAllProperties] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState(25);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) {
        console.error("Error fetching properties:", error.message);
      } else {
        setAllProperties(data);
        console.log("Fetched properties:", data);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold my-4">
        {viewMode === "buy" ? "Buy Properties" : "Rent Properties"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProperties.slice(0, visibleProperties).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertiesGrid;
