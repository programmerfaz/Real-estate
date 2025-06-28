import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, Home as HomeIcon } from "lucide-react";
import SearchBar from '../components/SearchBar';
import PropertyCard from "../components/PropertyCard";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";


import { auth } from "../firebase";

const formatPrice = (price) => `$${price.toLocaleString()}`;

// const PropertyCard = ({ property, formatPrice }) => {
//     if (!property) return null;

//     return (
//         <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
//             <img
//                 src={property.image}
//                 alt={property.title}
//                 className="w-full h-56 object-cover"
//             />
//             <div className="p-6">
//                 <div className="flex items-center justify-between mb-2">
//                     <h3 className="font-bold text-xl text-gray-900">{property.title}</h3>
//                     <div className="flex items-center gap-1">
//                         <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                         <span className="text-sm text-gray-600">{property.rating}</span>
//                     </div>
//                 </div>

//                 <div className="flex items-center text-gray-600 mb-3">
//                     <MapPin className="w-4 h-4 mr-1" />
//                     <span className="text-sm">{property.location}</span>
//                 </div>

//                 <div className="text-2xl font-bold text-blue-600 mb-4">
//                     {formatPrice(property.price)}
//                 </div>

//                 <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-sm text-gray-700">
//                     <div className="flex items-center">
//                         <Bed className="w-4 h-4 mr-1" />
//                         {property.bedrooms}
//                     </div>
//                     <div className="flex items-center">
//                         <Bath className="w-4 h-4 mr-1" />
//                         {property.bathrooms}
//                     </div>
//                     <div className="flex items-center">
//                         <Square className="w-4 h-4 mr-1" />
//                         {property.sqft}
//                     </div>
//                     <div className="flex items-center">
//                         <Car className="w-4 h-4 mr-1" />
//                         {property.parking}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };



const Buy = ({ viewMode }) => {
    const [userEmail, setUserEmail] = useState(null);

    // Mock auth state for demonstration    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });
        return () => unsubscribe();
    }, []);
    const [allProperties, setAllProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(6);

    useEffect(() => {
        const fetchProperties = async () => {
            const { data, error } = await supabase.from("properties").select("*");
            if (error) {
                console.error("Error fetching properties:", error.message);
            } else {
                setAllProperties(data);
            }
        };

        fetchProperties();
    }, []);

    const handleLoadMore = () => {
        setVisibleProperties((prev) => prev + 6);
    };

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Wealth Home</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="./Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {userEmail ? (
                                <span className="text-sm text-gray-600">Welcome, {userEmail.split("@")[0]}</span>
                            ) : (
                                <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                            )}
                            <Link to="/Favourites">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    My Favourites
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold my-4">
                    {viewMode === "buy" ? "Buy Properties" : "Rent Properties"}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allProperties.slice(0, visibleProperties).map((property) => (
                        <PropertyCard
                            key={property.id}
                            {...property}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>

                {visibleProperties < allProperties.length && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleLoadMore}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Load More Properties
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default Buy;