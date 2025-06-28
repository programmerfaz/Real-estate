import React, { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

import { auth } from "../firebase";
import {
    Search,
    MapPin,
    Bed,
    Bath,
    Square,
    Car,
    Heart,
    Filter,
    Grid3X3,
    Map,
    Star,
    ChevronDown,
    X,
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    Home,
    Wifi,
    Dumbbell,
    Trees,
    Shield,
    Zap,
    Camera,
    Users,
    Home as HomeIcon
} from 'lucide-react';

const allProperties = [
    {
        id: 1,
        title: "Luxury Waterfront Villa",
        price: 450000,
        location: "Amwaj Islands, Bahrain",
        bedrooms: 5,
        bathrooms: 4,
        sqft: 4200,
        parking: 3,
        image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 4.9,
        featured: true,
        type: "Villa",
        yearBuilt: 2020,
        furnished: "Fully Furnished",
        petFriendly: true,
        description: "Stunning waterfront villa with panoramic sea views, private beach access, and resort-style amenities. This luxury property features an open-plan design with premium finishes throughout.",
        amenities: ["Private Beach", "Swimming Pool", "Gym", "Garden", "Garage", "Security", "Smart Home", "WiFi"],
        agent: {
            name: "Ahmed Al-Mahmood",
            phone: "+973 3333 4444",
            email: "ahmed@bahrainrealty.com"
        },
        coordinates: { lat: 26.2540, lng: 50.6660 }, // Amwaj Islands
        address: "Villa 123, Amwaj Islands, Muharraq Governorate, Bahrain"
    },
    {
        id: 2,
        title: "Modern Family Compound",
        price: 280000,
        location: "Riffa, Bahrain",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 3200,
        parking: 2,
        image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 4.7,
        featured: false,
        type: "Compound",
        yearBuilt: 2019,
        furnished: "Semi Furnished",
        petFriendly: true,
        description: "Spacious family compound in prestigious Riffa area with private garden, modern amenities, and excellent connectivity to schools and shopping centers.",
        amenities: ["Garden", "Parking", "Security", "Central AC", "Maid's Room", "Storage"],
        agent: {
            name: "Fatima Al-Zahra",
            phone: "+973 3555 6666",
            email: "fatima@gulfproperties.bh"
        },
        coordinates: { lat: 26.1300, lng: 50.5550 }, // Riffa
        address: "Block 123, Road 456, Riffa, Southern Governorate, Bahrain"
    },
    {
        id: 3,
        title: "Seef District Apartment",
        price: 180000,
        location: "Seef, Manama",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        parking: 1,
        image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 4.5,
        featured: true,
        type: "Apartment",
        yearBuilt: 2021,
        furnished: "Unfurnished",
        petFriendly: false,
        description: "Modern apartment in the heart of Seef district with stunning city views, close to malls, restaurants, and business centers. Perfect for professionals and small families.",
        amenities: ["Gym", "Swimming Pool", "Security", "Elevator", "Parking", "Central AC"],
        agent: {
            name: "Mohammed Al-Khalifa",
            phone: "+973 3777 8888",
            email: "mohammed@seefrealty.com"
        },
        coordinates: { lat: 26.2285, lng: 50.5440 }, // Seef
        address: "Tower 1, Building 789, Seef District, Capital Governorate, Bahrain"
    },
    {
        id: 4,
        title: "Juffair Executive Suite",
        price: 220000,
        location: "Juffair, Manama",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1400,
        parking: 1,
        image: "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 4.6,
        featured: false,
        type: "Apartment",
        yearBuilt: 2022,
        furnished: "Fully Furnished",
        petFriendly: false,
        description: "Executive suite in premium Juffair location with modern amenities, close to diplomatic area and international hotels. Ideal for executives and expatriates.",
        amenities: ["Concierge", "Gym", "Pool", "Security", "WiFi", "Parking"],
        agent: {
            name: "Sarah Al-Mannai",
            phone: "+973 3999 0000",
            email: "sarah@juffairproperties.bh"
        },
        coordinates: { lat: 26.2172, lng: 50.5890 }, // Juffair
        address: "Building 456, Road 789, Juffair, Capital Governorate, Bahrain"
    },
    {
        id: 5,
        title: "Budaiya Beachfront Villa",
        price: 520000,
        location: "Budaiya, Bahrain",
        bedrooms: 6,
        bathrooms: 5,
        sqft: 5000,
        parking: 4,
        image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 5.0,
        featured: true,
        type: "Villa",
        yearBuilt: 2018,
        furnished: "Semi Furnished",
        petFriendly: true,
        description: "Magnificent beachfront villa with private beach access, landscaped gardens, and luxury amenities. Perfect for large families seeking privacy and luxury by the sea.",
        amenities: ["Private Beach", "Garden", "Pool", "Gym", "Garage", "Security", "Maid's Room", "Driver's Room"],
        agent: {
            name: "Ali Al-Doseri",
            phone: "+973 3111 2222",
            email: "ali@budaiyavillas.com"
        },
        coordinates: { lat: 26.1500, lng: 50.4500 }, // Budaiya
        address: "Villa 789, Budaiya Highway, Northern Governorate, Bahrain"
    },
    {
        id: 6,
        title: "Saar Family Home",
        price: 320000,
        location: "Saar, Bahrain",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        parking: 2,
        image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800",
        images: [
            "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        rating: 4.4,
        featured: false,
        type: "Villa",
        yearBuilt: 2017,
        furnished: "Unfurnished",
        petFriendly: true,
        description: "Comfortable family home in quiet Saar neighborhood with garden, close to international schools and shopping centers. Great for families with children.",
        amenities: ["Garden", "Parking", "Central AC", "Storage", "Maid's Room"],
        agent: {
            name: "Noor Al-Baharna",
            phone: "+973 3444 5555",
            email: "noor@saarhomes.bh"
        },
        coordinates: { lat: 26.1833, lng: 50.4833 }, // Saar
        address: "House 321, Block 654, Saar, Northern Governorate, Bahrain"
    }
];


const Buy = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [visibleProperties, setVisibleProperties] = useState(25);
    const [filters, setFilters] = useState({
        location: '',
        priceMin: '',
        priceMax: '',
        bedrooms: '',
        propertyType: '',
        featured: false
    });
    const [favorites, setFavorites] = useState(new Set());

    const properties = allProperties.slice(0, visibleProperties);

    const propertiesToShow = allProperties.slice(0, visibleProperties);

    const loadMoreProperties = () => {
        setVisibleProperties(prev => Math.min(prev + 5, allProperties.length));
    };

    const toggleFavorite = (id) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavorites(newFavorites);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BH', {
            style: 'currency',
            currency: 'BHD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const PropertyCard = ({ property }) => (
        <div
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => setSelectedProperty(property)}
        >
            <div className="relative">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {property.featured && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Featured
                        </span>
                    )}
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        For Sale
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200"
                >
                    <Heart
                        className={`w-5 h-5 ${favorites.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                </button>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    View Details
                </div>
            </div>

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

                <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formatPrice(property.price)}
                </div>

                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center text-gray-600">
                        <Bed className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600">
                        <Bath className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600">
                        <Square className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{property.sqft}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-600">
                        <Car className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{property.parking}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const PropertyDetails = ({ property }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen py-8 px-4">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                            <div className="flex items-center text-gray-600 mt-2">
                                <MapPin className="w-5 h-5 mr-2" />
                                <span>{property.address}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedProperty(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
                        {/* Left Column - Images and Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Gallery */}
                            <div className="relative">
                                <img
                                    src={property.images[currentImageIndex]}
                                    alt={property.title}
                                    className="w-full h-96 object-cover rounded-2xl"
                                />
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {property.images.length}
                                </div>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors rotate-180"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="flex gap-4">
                                {property.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={image} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Property Details */}
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-4">Property Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                                        <div className="text-sm text-gray-600">Bedrooms</div>
                                    </div>
                                    <div className="text-center">
                                        <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                                        <div className="text-sm text-gray-600">Bathrooms</div>
                                    </div>
                                    <div className="text-center">
                                        <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{property.sqft}</div>
                                        <div className="text-sm text-gray-600">Square Feet</div>
                                    </div>
                                    <div className="text-center">
                                        <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{property.parking}</div>
                                        <div className="text-sm text-gray-600">Parking Spaces</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Description</h3>
                                <p className="text-gray-700 leading-relaxed">{property.description}</p>
                            </div>

                            {/* Features & Amenities */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Features & Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center text-gray-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 rounded-2xl p-6">
                                <div>
                                    <div className="text-sm text-gray-600">Year Built</div>
                                    <div className="font-semibold">{property.yearBuilt}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Furnished</div>
                                    <div className="font-semibold">{property.furnished}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Pet Friendly</div>
                                    <div className="font-semibold">{property.petFriendly ? 'Yes' : 'No'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Property Type</div>
                                    <div className="font-semibold">{property.type}</div>
                                </div>
                            </div>

                            {/* Google Map */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Location</h3>
                                <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center">
                                    <iframe
                                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.0!2d${property.coordinates.lng}!3d${property.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDE1JzEyLjAiTiA1MMKwMzInNDguMCJF!5e0!3m2!1sen!2sbh!4v1635000000000!5m2!1sen!2sbh`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, borderRadius: '1rem' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`Map of ${property.title}`}
                                    ></iframe>
                                </div>
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center text-blue-800">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        <span className="font-medium">{property.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Price and Contact */}
                        <div className="space-y-6">
                            {/* Price Card */}
                            <div className="bg-blue-50 rounded-2xl p-6 sticky top-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                    {formatPrice(property.price)}
                                </div>
                                <div className="flex items-center mb-4">
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-2">
                                        For Sale
                                    </span>
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                        <span className="text-sm text-gray-600">{property.rating}</span>
                                    </div>
                                </div>

                                {/* Contact Agent */}
                                <div className="border-t border-blue-200 pt-6">
                                    <h4 className="font-bold text-gray-900 mb-4">Contact Agent</h4>
                                    <div className="space-y-3 mb-6">
                                        <div className="font-semibold text-lg">{property.agent.name}</div>
                                        <div className="flex items-center text-gray-600">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <span>{property.agent.phone}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <span>{property.agent.email}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                                            <Phone className="w-5 h-5 mr-2" />
                                            Call Now
                                        </button>
                                        <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center">
                                            <Mail className="w-5 h-5 mr-2" />
                                            Send Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

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

    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
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
                                <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}


                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar & Controls */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                                <div className="relative flex-1 max-w-2xl">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search properties in Bahrain..."
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden flex items-center px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <Filter className="w-5 h-5 mr-2" />
                                        Filters
                                    </button>

                                    <div className="flex bg-gray-100 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                                                }`}
                                        >
                                            <Grid3X3 className="w-5 h-5 mr-2" />
                                            Grid
                                        </button>
                                        <button
                                            onClick={() => setViewMode('map')}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                                                }`}
                                        >
                                            <Map className="w-5 h-5 mr-2" />
                                            Map
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Showing {properties.length} of {allProperties.length} properties</span>
                                <select className="px-3 py-2 border border-gray-200 rounded-lg">
                                    <option>Sort by: Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Bedrooms</option>
                                </select>
                            </div>
                        </div>

                        {/* Properties Grid or Map View */}
                        {/* {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {propertiesToShow.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Map view showing Bahrain properties</p>
                                </div>
                            </div>
                        )} */}

                        {/* Load More */}
                        {visibleProperties < allProperties.length && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={loadMoreProperties}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Load More Properties ({allProperties.length - visibleProperties} remaining)
                                </button>
                            </div>
                        )}
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
                </div>
            </div>

            {/* Property Details Modal */}
            {selectedProperty && (
                <PropertyDetails property={selectedProperty} />
            )}
        </div>
    );
}


export default Buy;