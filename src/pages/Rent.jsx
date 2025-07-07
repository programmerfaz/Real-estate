import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X, Search, Grid3X3, List, Calendar, CreditCard, User, Mail, Phone, MapPinIcon, CheckCircle, ArrowRight, Camera, Eye } from "lucide-react";
import SearchBar from '../components/SearchBar';
import PropertyCard from "../components/PropertyCard";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase";
import { Dialog } from "@headlessui/react";

const Rent = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewType, setViewType] = useState('grid');
    const [isLoading, setIsLoading] = useState(false);

    // View Details modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Booking modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        moveInDate: '',
        message: ''
    });

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        email: '',
        billingAddress: ''
    });

    // Success message states
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

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
    const [visibleProperties, setVisibleProperties] = useState(12);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [customPriceRange, setCustomPriceRange] = useState({ min: 200, max: 2000 });
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
    const [selectedBathrooms, setSelectedBathrooms] = useState("Any");
    const [selectedYearBuilt, setSelectedYearBuilt] = useState("Any");
    const [furnishedValue, setFurnishedValue] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const navigate = useNavigate();

    const formatPrice = (price) => `${price.toLocaleString()} BHD`;

    // Enhanced property fetching with search and sort - Updated to use rentproperties table
    useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            let query = supabase.from("rentproperties").select("*");

            // Search functionality
            if (searchQuery.trim()) {
                query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            // Location filter
            if (selectedLocations.length > 0) {
                const orFilter = selectedLocations
                    .map((loc) => `location.ilike.%${loc}%`)
                    .join(",");
                query = query.or(orFilter);
            }

            // Price filter (adjusted for rental prices)
            if (selectedPriceRange) {
                if (selectedPriceRange === "below500") {
                    query = query.lt("price", 500);
                } else if (selectedPriceRange === "500-1500") {
                    query = query.gte("price", 500).lte("price", 1500);
                } else if (selectedPriceRange === "above1500") {
                    query = query.gt("price", 1500);
                } else if (selectedPriceRange === "custom") {
                    query = query.gte("price", customPriceRange.min).lte("price", customPriceRange.max);
                }
            }

            // Other filters
            if (selectedBedrooms !== "Any") {
                const minBedrooms = parseInt(selectedBedrooms);
                if (!isNaN(minBedrooms)) {
                    query = query.gte("bedrooms", minBedrooms);
                }
            }
            if (selectedBathrooms !== "Any") {
                const minBathrooms = parseInt(selectedBathrooms);
                if (!isNaN(minBathrooms)) {
                    query = query.gte("bathrooms", minBathrooms);
                }
            }
            if (selectedYearBuilt === "2020+") {
                query = query.gte("year_built", 2020);
            } else if (selectedYearBuilt === "Before 2020") {
                query = query.lt("year_built", 2020);
            } else if (selectedYearBuilt !== "Any") {
                const minYearBuilt = parseInt(selectedYearBuilt);
                if (!isNaN(minYearBuilt)) {
                    query = query.eq("year_built", minYearBuilt);
                }
            }

            if (furnishedValue) {
                query = query.ilike('furnished', `%${furnishedValue}%`);
            }

            if (selectedAmenities.length > 0) {
                query = query.contains("amenities", selectedAmenities);
            }

            // Sorting
            switch (sortBy) {
                case 'price-low':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-high':
                    query = query.order('price', { ascending: false });
                    break;
                case 'bedrooms':
                    query = query.order('bedrooms', { ascending: false });
                    break;
                case 'newest':
                default:
                    query = query.order('id', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching properties:", error.message);
            } else {
                setAllProperties(data);
            }
            setIsLoading(false);
        };

        fetchProperties();
    }, [selectedLocations, selectedPriceRange, customPriceRange, selectedBedrooms, selectedBathrooms, selectedYearBuilt, furnishedValue, selectedAmenities, searchQuery, sortBy]);

    const clearAllFilters = () => {
        setSelectedLocations([]);
        setSelectedPriceRange('');
        setCustomPriceRange({ min: 200, max: 2000 });
        setSelectedBedrooms('Any');
        setSelectedBathrooms('Any');
        setSelectedYearBuilt('Any');
        setFurnishedValue('');
        setSelectedAmenities([]);
        setSearchQuery('');
    };

    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleLoadMore = () => {
        setVisibleProperties((prev) => prev + 12);
    };

    const handleLocationChange = (e) => {
        const { value, checked } = e.target;
        setSelectedLocations((prev) =>
            checked ? [...prev, value] : prev.filter((loc) => loc !== value)
        );
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedLocations.length > 0) count++;
        if (selectedPriceRange) count++;
        if (selectedBedrooms !== "Any") count++;
        if (selectedBathrooms !== "Any") count++;
        if (selectedYearBuilt !== "Any") count++;
        if (furnishedValue) count++;
        if (selectedAmenities.length > 0) count++;
        if (searchQuery.trim()) count++;
        return count;
    };

    // Handle view details
    const handleViewDetails = (property) => {
        setSelectedPropertyForDetails(property);
        setCurrentImageIndex(0);
        setShowDetailsModal(true);
    };

    const openBookingModal = (property) => {
        setSelectedProperty(property);
        setShowBookingModal(true);
        setBookingForm({
            fullName: '',
            email: userEmail || '',
            phone: '',
            moveInDate: '',
            message: ''
        });
    };

    const openPaymentModal = (property) => {
        setSelectedProperty(property);
        setShowPaymentModal(true);
        setPaymentForm({
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            cardholderName: '',
            email: userEmail || '',
            billingAddress: ''
        });
    };

    // Handle booking
    const handleBookNow = (property) => {
        setSelectedProperty(property);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        // Show success message
        setSuccessMessage('Booking request submitted successfully! We will contact you soon.');
        setShowSuccessMessage(true);
        setShowBookingModal(false);
        setBookingForm({
            fullName: '',
            email: '',
            phone: '',
            moveInDate: '',
            message: ''
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 3000);
    };

    // Handle payment
    const handleMakePayment = (property) => {
        setSelectedProperty(property);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        // Show success message
        setSuccessMessage('Payment processed successfully! Your down payment has been confirmed.');
        setShowSuccessMessage(true);
        setShowPaymentModal(false);
        setPaymentForm({
            cardNumber: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            cardholderName: '',
            email: '',
            billingAddress: ''
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 3000);
    };

    const scrollToProperties = () => {
        const propertiesSection = document.getElementById('properties-section');
        if (propertiesSection) {
            propertiesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Wealth Home</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</Link>
                            <Link to="/Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</Link>
                            <Link to="/Rent" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Rent</Link>
                            <Link to="/AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</Link>
                            <Link to="/About" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>

                        </nav>

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-gray-700 focus:outline-none"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

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

                    {menuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 pt-4 pb-4 space-y-2">
                           <Link to="/Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</Link>
                            <Link to="/Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</Link>
                            <Link to="/Rent" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Rent</Link>
                            <Link to="/AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</Link>
                            <Link to="/About" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
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

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Find Your Perfect
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                            Rental Home
                        </span>
                    </h1>

                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Discover premium rental properties across Bahrain. From luxury apartments to family homes,
                        find your ideal rental today.
                    </p>

                    <button
                        onClick={scrollToProperties}
                        className="bg-white text-blue-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Browse Rentals
                    </button>
                </div>
            </section>

            {/* Enhanced Search Bar */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search rental properties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="bedrooms">Most Bedrooms</option>
                            </select>

                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setViewType('grid')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4 mr-1" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewType('list')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                        }`}
                                >
                                    <List className="w-4 h-4 mr-1" />
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-screen">
                {/* Enhanced Filter Sidebar */}
                <aside className={`w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out
                             lg:translate-x-0 lg:static lg:block
                             ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} 
                             fixed inset-y-0 left-0 z-50 lg:z-auto`}>
                    <div className="lg:hidden flex justify-end p-4">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Filters {getActiveFiltersCount() > 0 && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </h2>
                            <button
                                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors cursor-pointer"
                                onClick={clearAllFilters}
                            >
                                Clear all
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                            <div className="text-sm text-blue-600 mb-1">Rentals Found</div>
                            <div className="text-2xl font-bold text-blue-800">{allProperties.length}</div>
                            {allProperties.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                    Avg. Rent: {formatPrice(allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length)}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Location</h3>
                            <div className="space-y-2">
                                {["Amwaj Islands", "Riffa", "Manama", "Seef", "Juffair", "Budaiya", "Saar"].map((location) => (
                                    <label key={location} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={location}
                                            onChange={handleLocationChange}
                                            checked={selectedLocations.includes(location)}
                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-gray-700">{location}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Monthly Rent (BHD)</h3>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="below500"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "below500"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Below BHD 500</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="500-1500"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "500-1500"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">BHD 500 - BHD 1,500</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="above1500"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "above1500"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Above BHD 1,500</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="custom"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "custom"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Custom Range</span>
                                </label>
                            </div>

                            {selectedPriceRange === "custom" && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
                                        <label>Min: BHD {customPriceRange.min}</label>
                                        <label>Max: BHD {customPriceRange.max}</label>
                                    </div>

                                    <div className="relative h-8">
                                        <input
                                            type="range"
                                            min={0}
                                            max={2000}
                                            step={50}
                                            value={customPriceRange.min}
                                            onChange={(e) => {
                                                const value = Math.min(Number(e.target.value), customPriceRange.max - 50);
                                                setCustomPriceRange((prev) => ({
                                                    ...prev,
                                                    min: value,
                                                }));
                                            }}
                                            className="absolute w-full top-2 pointer-events-auto appearance-none h-3 bg-transparent"
                                            style={{ zIndex: 3 }}
                                        />

                                        <input
                                            type="range"
                                            min={0}
                                            max={2000}
                                            step={50}
                                            value={customPriceRange.max}
                                            onChange={(e) => {
                                                const value = Math.max(Number(e.target.value), customPriceRange.min + 50);
                                                setCustomPriceRange((prev) => ({
                                                    ...prev,
                                                    max: value,
                                                }));
                                            }}
                                            className="absolute w-full top-8 pointer-events-auto appearance-none h-3 bg-transparent"
                                            style={{ zIndex: 2 }}
                                        />

                                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 rounded"></div>

                                        <div
                                            className="absolute top-4 h-1 bg-blue-500 rounded"
                                            style={{
                                                left: `${(customPriceRange.min / 2000) * 100}%`,
                                                right: `${100 - (customPriceRange.max / 2000) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bedrooms */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Bedrooms</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedBedrooms}
                                onChange={(e) => setSelectedBedrooms(e.target.value)}
                            >
                                <option>Any</option>
                                <option>1+</option>
                                <option>2+</option>
                                <option>3+</option>
                                <option>4+</option>
                                <option>5+</option>
                            </select>
                        </div>

                        {/* Bathrooms */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Bathrooms</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedBathrooms}
                                onChange={(e) => setSelectedBathrooms(e.target.value)}
                            >
                                <option>Any</option>
                                <option>1+</option>
                                <option>2+</option>
                                <option>3+</option>
                                <option>4+</option>
                            </select>
                        </div>

                        {/* Year Built */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Year Built</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedYearBuilt}
                                onChange={(e) => setSelectedYearBuilt(e.target.value)}
                            >
                                <option>Any</option>
                                <option>2024</option>
                                <option>2023</option>
                                <option>2020+</option>
                                <option>Before 2020</option>
                            </select>
                        </div>

                        {/* Furnishing */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Furnishing</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={furnishedValue}
                                onChange={(e) => setFurnishedValue(e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="Unfurnished">Unfurnished</option>
                                <option value="Fully Furnished">Fully Furnished</option>
                                <option value="Furnished">Furnished</option>
                            </select>
                        </div>

                        {/* Amenities */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Private Beach", "Swimming Pool", "Gym", "Garage", "Garden", "Security", "WiFi", "Elevator", "Parking"].map((amenity) => {
                                    const isSelected = selectedAmenities.includes(amenity);
                                    return (
                                        <span
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-3 py-2 rounded-full text-sm cursor-pointer transition duration-200 border
                                    ${isSelected
                                                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                                }`}
                                        >
                                            {amenity}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                )}

                {/* Main Property Grid */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6" id="properties-section">
                        {/* Mobile filter button and results summary */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                    {getActiveFiltersCount() > 0 && (
                                        <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded-full">
                                            {getActiveFiltersCount()}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="text-sm text-gray-600">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        Searching...
                                    </div>
                                ) : (
                                    `Showing ${Math.min(visibleProperties, allProperties.length)} of ${allProperties.length} rental properties`
                                )}
                            </div>
                        </div>

                        {/* Properties Grid/List */}
                        {allProperties.length === 0 && !isLoading ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <HomeIcon className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No rental properties found</h3>
                                <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewType === 'grid'
                                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                                : "space-y-4"
                            }>
                                {allProperties.slice(0, visibleProperties).map((property) => (
                                    <div key={property.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105">
                                        {/* Image Section */}
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={property.image}
                                                alt={property.title}
                                                className="w-full h-64 object-cover transition-transform duration-300"
                                            />

                                            {/* Tag */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    For Rent
                                                </span>
                                            </div>

                                            {/* Image count */}
                                            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                                                <Camera className="w-3 h-3" />
                                                {property.images ? property.images.length + 1 : 1}
                                            </div>
                                        </div>

                                        {/* Details Section */}
                                        <div className="p-6">
                                            {/* Location */}
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                                <MapPin className="w-4 h-4" />
                                                {property.location}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                {property.title}
                                            </h3>

                                            {/* Property Features */}
                                            <div className="flex items-center gap-4 text-gray-600 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Bed className="w-4 h-4" />
                                                    <span className="text-sm">{property.bedrooms} Beds</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Bath className="w-4 h-4" />
                                                    <span className="text-sm">{property.bathrooms} Baths</span>
                                                </div>
                                                <div className="text-sm">{property.sqft} sq ft</div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {formatPrice(property.price)}
                                                    </span>
                                                    <span className="text-gray-500 text-sm ml-1">/month</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons - Improved alignment */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(property)}
                                                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm flex items-center justify-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleBookNow(property)}
                                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                                >
                                                    Book Now
                                                </button>
                                                <button
                                                    onClick={() => handleMakePayment(property)}
                                                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                                                >
                                                    Payment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {visibleProperties < allProperties.length && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 
                               transition-colors font-medium flex items-center gap-2"
                                >
                                    Load More Properties
                                    <span className="bg-blue-700 text-white text-sm px-2 py-1 rounded-full">
                                        +{Math.min(12, allProperties.length - visibleProperties)}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedPropertyForDetails && (
                <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 flex justify-center items-center p-4 overflow-y-auto">
                        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">

                            {/* Close Button */}
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Left: Image Carousel */}
                                <div className="md:w-1/2 w-full h-[300px] md:h-auto relative bg-gray-100 flex-shrink-0">
                                    {selectedPropertyForDetails.images && selectedPropertyForDetails.images.length > 0 ? (
                                        <>
                                            <img
                                                src={selectedPropertyForDetails.images[currentImageIndex]}
                                                alt="property"
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedPropertyForDetails.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => setCurrentImageIndex((prev) =>
                                                            prev === 0 ? selectedPropertyForDetails.images.length - 1 : prev - 1
                                                        )}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-50"
                                                    >
                                                        ←
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentImageIndex((prev) =>
                                                            (prev + 1) % selectedPropertyForDetails.images.length
                                                        )}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-50"
                                                    >
                                                        →
                                                    </button>
                                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                                                        {currentImageIndex + 1} / {selectedPropertyForDetails.images.length}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <img
                                            src={selectedPropertyForDetails.image}
                                            alt="property"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Right: Scrollable Content */}
                                <div className="md:w-1/2 w-full flex flex-col max-h-[95vh] overflow-hidden">
                                    {/* Fixed Header */}
                                    <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedPropertyForDetails.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {selectedPropertyForDetails.address || selectedPropertyForDetails.location}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatPrice(selectedPropertyForDetails.price)}/month
                                            </span>
                                            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                                                For Rent
                                            </span>
                                            <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                                                {selectedPropertyForDetails.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Features Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                                                <Bed className="w-5 h-5 text-blue-600" />
                                                <span>{selectedPropertyForDetails.bedrooms} Bedrooms</span>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                                                <Bath className="w-5 h-5 text-blue-600" />
                                                <span>{selectedPropertyForDetails.bathrooms} Bathrooms</span>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                                                <Square className="w-5 h-5 text-blue-600" />
                                                <span>{selectedPropertyForDetails.sqft} Sq Ft</span>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                                                <Car className="w-5 h-5 text-blue-600" />
                                                <span>{selectedPropertyForDetails.parking} Parking</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {selectedPropertyForDetails.description && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3">Description</h3>
                                                <p className="text-gray-600 leading-relaxed">{selectedPropertyForDetails.description}</p>
                                            </div>
                                        )}

                                        {/* Property Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPropertyForDetails.year_built && (
                                                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                                                    Built: {selectedPropertyForDetails.year_built}
                                                </span>
                                            )}
                                            {selectedPropertyForDetails.furnished && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                                                    {selectedPropertyForDetails.furnished}
                                                </span>
                                            )}
                                            {selectedPropertyForDetails.pet_friendly !== undefined && (
                                                <span className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full">
                                                    {selectedPropertyForDetails.pet_friendly ? 'Pet Friendly' : 'No Pets'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Amenities */}
                                        {selectedPropertyForDetails.amenities && selectedPropertyForDetails.amenities.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedPropertyForDetails.amenities.map((amenity, index) => (
                                                        <div key={index} className="flex items-center text-sm text-gray-600">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                            {amenity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Agent Info */}
                                        {selectedPropertyForDetails.agent_name && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h3 className="font-semibold text-lg mb-3">Contact Agent</h3>
                                                <div className="space-y-2">
                                                    <p className="text-gray-800 font-medium">{selectedPropertyForDetails.agent_name}</p>
                                                    {selectedPropertyForDetails.agent_phone && (
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Phone className="w-4 h-4 mr-2" />
                                                            {selectedPropertyForDetails.agent_phone}
                                                        </p>
                                                    )}
                                                    {selectedPropertyForDetails.agent_email && (
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            {selectedPropertyForDetails.agent_email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fixed Footer with Action Buttons */}
                                    <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    openBookingModal(selectedPropertyForDetails);
                                                }}
                                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                <Calendar className="w-5 h-5" />
                                                Book Now
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    openPaymentModal(selectedPropertyForDetails);
                                                }}
                                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                Make Payment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}


            {/* Booking Modal */}
            <Dialog open={showBookingModal} onClose={() => setShowBookingModal(false)} className="fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex justify-center items-center p-4">
                    <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-200">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-gray-900">Book Property</h3>
                            {selectedProperty && (
                                <>
                                    <p className="text-sm text-gray-500">{selectedProperty.title}</p>
                                    <p className="text-sm text-gray-500">{selectedProperty.location}</p>
                                    <p className="text-lg font-semibold text-blue-600 mt-1">
                                        {formatPrice(selectedProperty.price)}/month
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.fullName}
                                        onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={bookingForm.email}
                                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={bookingForm.phone}
                                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Move-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={bookingForm.moveInDate}
                                        onChange={(e) => setBookingForm({ ...bookingForm, moveInDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                    <textarea
                                        rows="3"
                                        value={bookingForm.message}
                                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                                        placeholder="Any special requirements or questions..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer with Submit Button */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBookingSubmit}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Submit Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)} className="fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex justify-center items-center p-4">
                    <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-200">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-gray-900">Make Down Payment</h3>
                            {selectedProperty && (
                                <>
                                    <p className="text-sm text-gray-500">{selectedProperty.title}</p>
                                    <p className="text-sm text-gray-500">{selectedProperty.location}</p>
                                    <p className="text-lg font-semibold text-green-600 mt-1">
                                        Down Payment: {formatPrice(selectedProperty.price * 0.1)}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Card Display */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="text-sm opacity-80">DEBIT CARD</div>
                                    <div className="w-8 h-6 bg-white/20 rounded"></div>
                                </div>
                                <div className="text-lg font-mono tracking-wider mb-4">
                                    {paymentForm.cardNumber || "•••• •••• •••• ••••"}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs opacity-80">CARDHOLDER NAME</div>
                                        <div className="font-semibold">
                                            {paymentForm.cardholderName || "YOUR NAME"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs opacity-80">EXPIRES</div>
                                        <div className="font-semibold">
                                            {paymentForm.expiryMonth && paymentForm.expiryYear
                                                ? `${paymentForm.expiryMonth}/${paymentForm.expiryYear}`
                                                : "MM/YY"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="19"
                                        value={paymentForm.cardNumber}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                                            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                                            setPaymentForm({ ...paymentForm, cardNumber: formattedValue });
                                        }}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                        <select
                                            required
                                            value={paymentForm.expiryMonth}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">MM</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <select
                                            required
                                            value={paymentForm.expiryYear}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">YY</option>
                                            {Array.from({ length: 10 }, (_, i) => (
                                                <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                                                    {String(new Date().getFullYear() + i).slice(-2)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength="3"
                                            value={paymentForm.cvv}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                                            placeholder="123"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={paymentForm.cardholderName}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value.toUpperCase() })}
                                        placeholder="JOHN DOE"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={paymentForm.email}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                                    <textarea
                                        required
                                        value={paymentForm.billingAddress}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, billingAddress: e.target.value })}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        placeholder="Enter your billing address"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer with Submit Button */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Process Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Rent;