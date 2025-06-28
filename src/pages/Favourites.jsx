import React, { useEffect, useState } from 'react';
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X } from "lucide-react";
import { supabase } from '../supabase';
import { auth } from '../firebase';
import PropertyCard from '../components/PropertyCard'; // adjust path if needed
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [favouriteProperties, setFavouriteProperties] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUserEmail(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user?.email) {
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });

        return () => unsubscribe();
    }, []);


    const toggleFavourite = async (propertyId) => {
        if (!userEmail) {
            alert("Please sign in to modify favourites.");
            return;
        }

        // Check if property is already in favourites
        const isAlreadyFavourite = favouriteProperties.some(p => p.id === propertyId);

        if (isAlreadyFavourite) {
            // Find the favourite record id in the favourites table (you'll need to fetch this or query)
            // Since your current fetch does not include favourites id, you must fetch it or delete by user_email + property_id

            const { error } = await supabase
                .from("favourites")
                .delete()
                .match({ user_email: userEmail, property_id: propertyId });

            if (error) {
                console.error("Error removing favourite:", error.message);
            } else {
                // Update UI state after deletion
                setFavouriteProperties(prev => prev.filter(p => p.id !== propertyId));
            }
        } else {
            // Add new favourite record
            const { error } = await supabase
                .from("favourites")
                .insert([{ user_email: userEmail, property_id: propertyId }]);

            if (error) {
                console.error("Error adding favourite:", error.message);
            } else {
                // Optionally refetch or add the property to favouriteProperties state
                // For simplicity, refetch all favourites:
                fetchFavouriteProperties();
            }
        }
    };


    useEffect(() => {
        const fetchFavouriteProperties = async () => {
            if (!userEmail) return;

            // Step 1: Get favourited property IDs
            const { data: favData, error: favError } = await supabase
                .from("favourites")
                .select("property_id")
                .eq("user_email", userEmail);

            if (favError) {
                console.error("Error fetching favourites:", favError.message);
                return;
            }

            const ids = favData.map((fav) => fav.property_id);

            // Step 2: Get property details by IDs
            if (ids.length > 0) {
                const { data: properties, error: propError } = await supabase
                    .from("properties")
                    .select("*")
                    .in("id", ids);

                if (propError) {
                    console.error("Error fetching properties:", propError.message);
                } else {
                    setFavouriteProperties(properties);
                }
            } else {
                setFavouriteProperties([]); // no favourites
            }
        };

        fetchFavouriteProperties();
    }, [userEmail]);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Wealth Home</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="./Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
                        </nav>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-gray-700 focus:outline-none"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Right section */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/Favourites">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    My Favourites
                                </button>
                            </Link>
                            {userEmail ? (
                                <>
                                    <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
                                    <LogOut
                                        onClick={handleLogout}
                                        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                    />
                                </>
                            ) : (
                                <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                            )}
                        </div>
                    </div>

                    {/* Mobile dropdown */}
                    {menuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 pt-4 pb-4 space-y-2">
                            <a href="./Home" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">About</a>
                            <Link to="/Favourites">
                                <div className="px-4">
                                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        My Favourites
                                    </button>
                                </div>
                            </Link>
                            {userEmail ? (
                                <div className="px-4 flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
                                    <LogOut
                                        onClick={handleLogout}
                                        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="px-4">
                                    <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Favourites Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">My Favourites</h1>

                {favouriteProperties.length === 0 ? (
                    <p className="text-gray-600">No favourite properties yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {favouriteProperties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                {...property}
                                isFavourite={true}
                                toggleFavourite={() => toggleFavourite(property.id)} // Disable toggle here if needed
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

};

export default Favorites;
