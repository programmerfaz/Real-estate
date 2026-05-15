import React, { useEffect, useState } from 'react';
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X } from "lucide-react";
import { auth } from '../firebase';
import { DUMMY_SALE_PROPERTIES } from '../data/dummyProperties';
import { getFavouriteIds, toggleFavouriteId } from '../data/favouritesStorage';
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

        /* Supabase favourites table — replaced with localStorage (see favouritesStorage.js) */
        toggleFavouriteId(userEmail, propertyId);
        const ids = getFavouriteIds(userEmail);
        setFavouriteProperties(
            DUMMY_SALE_PROPERTIES.filter((p) => ids.includes(Number(p.id)))
        );
    };


    useEffect(() => {
        if (!userEmail) {
            setFavouriteProperties([]);
            return;
        }
        const ids = getFavouriteIds(userEmail);
        setFavouriteProperties(
            DUMMY_SALE_PROPERTIES.filter((p) => ids.includes(Number(p.id)))
        );
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
