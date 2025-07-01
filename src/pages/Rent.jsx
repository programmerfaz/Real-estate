import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X, Search, Grid3X3, List, SortAsc, Bookmark, Share2, Eye, Calendar, DollarSign, Phone, Mail, MessageCircle, CreditCard, Check } from "lucide-react";
import SearchBar from '../components/SearchBar';
import PropertyCard from "../components/PropertyCard";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";

const Rent = ({ viewMode }) => {
    const [userEmail, setUserEmail] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewType, setViewType] = useState('grid');
    const [isLoading, setIsLoading] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Booking form state
    const [bookingForm, setBookingForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        moveInDate: ''
    });

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        email: '',
        billingAddress: ''
    });

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const [allProperties, setAllProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(12);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [customPriceRange, setCustomPriceRange] = useState({ min: 20000, max: 200000 });
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
    const [selectedBathrooms, setSelectedBathrooms] = useState("Any");
    const [selectedYearBuilt, setSelectedYearBuilt] = useState("Any");
    const [furnishedValue, setFurnishedValue] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const navigate = useNavigate();

    // Enhanced property fetching with search and sort
    useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            let query = supabase.from("properties").select("*");

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

            // Price filter
            if (selectedPriceRange) {
                if (selectedPriceRange === "below50k") {
                    query = query.lt("price", 50000);
                } else if (selectedPriceRange === "50k-150k") {
                    query = query.gte("price", 50000).lte("price", 150000);
                } else if (selectedPriceRange === "above150k") {
                    query = query.gt("price", 150000);
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
        setCustomPriceRange({ min: 20000, max: 200000 });
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

    const formatPrice = (price) => `${price.toLocaleString()} BHD`;

    const handleBookNow = (property) => {
        setSelectedProperty(property);
        setShowBookingModal(true);
    };

    const handleMakePayment = (property) => {
        setSelectedProperty(property);
        setShowPaymentModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Store booking in database
            const { error } = await supabase.from('bookings').insert([
                {
                    property_id: selectedProperty.id,
                    user_name: bookingForm.name,
                    user_email: bookingForm.email,
                    user_phone: bookingForm.phone,
                    message: bookingForm.message,
                    move_in_date: bookingForm.moveInDate,
                    property_title: selectedProperty.title,
                    created_at: new Date().toISOString()
                }
            ]);

            if (error) {
                console.error('Error saving booking:', error);
                alert('Error saving booking. Please try again.');
                return;
            }

            // Show success message
            setSuccessMessage('Booking request submitted successfully! We will contact you soon.');
            setShowSuccessMessage(true);
            setShowBookingModal(false);
            setBookingForm({ name: '', email: '', phone: '', message: '', moveInDate: '' });

            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Store payment details in database
            const { error } = await supabase.from('user_cards').insert([
                {
                    full_name: paymentForm.cardholderName,
                    email: paymentForm.email,
                    phone_number: '', // You might want to add this field to the form
                    card_last4: paymentForm.cardNumber.slice(-4),
                    card_brand: getCardBrand(paymentForm.cardNumber),
                    card_expiry_month: parseInt(paymentForm.expiryMonth),
                    card_expiry_year: parseInt(paymentForm.expiryYear),
                    encrypted_token: btoa(paymentForm.cardNumber), // Basic encoding - in production use proper encryption
                    billing_address: paymentForm.billingAddress,
                    created_at: new Date().toISOString()
                }
            ]);

            if (error) {
                console.error('Error saving payment:', error);
                alert('Error processing payment. Please try again.');
                return;
            }

            // Show success message
            setSuccessMessage('Payment processed successfully! Thank you for your payment.');
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

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const getCardBrand = (cardNumber) => {
        const firstDigit = cardNumber.charAt(0);
        if (firstDigit === '4') return 'Visa';
        if (firstDigit === '5') return 'Mastercard';
        if (firstDigit === '3') return 'American Express';
        return 'Unknown';
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
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
                    <Check className="w-5 h-5 mr-2" />
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
                            <a href="./Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Rent</a>
                            <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
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
                            <a href="./Home" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="block px-4 text-blue-600 font-medium">Rent</a>
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

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Find Your Perfect
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                                Rental Home
                            </span>
                        </h1>
                        
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Discover premium rental properties across Bahrain. From luxury apartments to family homes, 
                            find your ideal rental with flexible terms and professional service.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button 
                                onClick={scrollToProperties}
                                className="group bg-white text-blue-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Browse Rentals
                                <Search className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <button className="group border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-900 transition-all duration-300 font-semibold text-lg flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Contact Agent
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center max-w-md mx-auto">
                            <div>
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-blue-200 text-sm">Rental Properties</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-blue-200 text-sm">Support</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">100%</div>
                                <div className="text-blue-200 text-sm">Verified</div>
                            </div>
                        </div>
                    </div>
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
                                placeholder="Search rental properties by location, type, or features..."
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
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                        viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4 mr-1" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewType('list')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                        viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
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
                            <div className="text-sm text-blue-600 mb-1">Properties Found</div>
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
                                        value="below50k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "below50k"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Below BHD 500</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="50k-150k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "50k-150k"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">BHD 500 - BHD 1,500</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="above150k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "above150k"}
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
                                        <label>Min: BHD {customPriceRange.min.toLocaleString()}</label>
                                        <label>Max: BHD {customPriceRange.max.toLocaleString()}</label>
                                    </div>

                                    <div className="relative h-8">
                                        <input
                                            type="range"
                                            min={0}
                                            max={5000}
                                            step={100}
                                            value={customPriceRange.min}
                                            onChange={(e) => {
                                                const value = Math.min(Number(e.target.value), customPriceRange.max - 100);
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
                                            max={5000}
                                            step={100}
                                            value={customPriceRange.max}
                                            onChange={(e) => {
                                                const value = Math.max(Number(e.target.value), customPriceRange.min + 100);
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
                                                left: `${(customPriceRange.min / 5000) * 100}%`,
                                                right: `${100 - (customPriceRange.max / 5000) * 100}%`,
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
                                    <div key={property.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105">
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
                                                {property.images?.length + 1 || 1}
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
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
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

                                            {/* Price + Buttons */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {formatPrice(property.price)}
                                                    </span>
                                                    <span className="text-gray-500 text-sm ml-1">/month</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <PropertyCard
                                                    {...property}
                                                    formatPrice={formatPrice}
                                                    showViewButton={true}
                                                    isFavourite={false}
                                                    toggleFavourite={() => {}}
                                                />
                                            </div>

                                            {/* Contact Buttons */}
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleBookNow(property)}
                                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Book Now
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleMakePayment(property)}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Make Payment
                                                </button>
                                            </div>

                                            {/* Contact Options */}
                                            <div className="flex gap-2 mt-3">
                                                <a
                                                    href={`mailto:${property.agent_email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in this property: ${property.title} located at ${property.location}. Please provide more details.`}
                                                    className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Email Agent
                                                </a>
                                                
                                                <a
                                                    href={`https://wa.me/${property.agent_phone?.replace(/\D/g, '')}?text=Hi, I'm interested in the property: ${property.title}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    WhatsApp
                                                </a>
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

            {/* Booking Modal */}
            <Dialog open={showBookingModal} onClose={() => setShowBookingModal(false)} className="fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Book Property</h3>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedProperty && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900">{selectedProperty.title}</h4>
                                <p className="text-sm text-gray-600">{selectedProperty.location}</p>
                                <p className="text-blue-600 font-semibold">{formatPrice(selectedProperty.price)}/month</p>
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={bookingForm.name}
                                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={bookingForm.email}
                                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={bookingForm.phone}
                                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Move-in Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingForm.moveInDate}
                                    onChange={(e) => setBookingForm({...bookingForm, moveInDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={bookingForm.message}
                                    onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any specific requirements or questions..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Submit Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)} className="fixed inset-0 z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedProperty && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900">{selectedProperty.title}</h4>
                                <p className="text-sm text-gray-600">{selectedProperty.location}</p>
                                <p className="text-blue-600 font-semibold text-lg">{formatPrice(selectedProperty.price)}/month</p>
                            </div>
                        )}

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            {/* Card Visual */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded"></div>
                                <div className="absolute bottom-4 left-4 w-8 h-6 bg-white/30 rounded"></div>
                                
                                <div className="mb-4">
                                    <div className="text-xs opacity-75 mb-1">CARD NUMBER</div>
                                    <div className="text-lg font-mono tracking-wider">
                                        {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs opacity-75 mb-1">CARDHOLDER NAME</div>
                                        <div className="text-sm font-medium">
                                            {paymentForm.cardholderName || 'YOUR NAME'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs opacity-75 mb-1">EXPIRES</div>
                                        <div className="text-sm font-mono">
                                            {paymentForm.expiryMonth && paymentForm.expiryYear 
                                                ? `${paymentForm.expiryMonth}/${paymentForm.expiryYear}` 
                                                : 'MM/YY'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="19"
                                    value={paymentForm.cardNumber}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '');
                                        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                        setPaymentForm({...paymentForm, cardNumber: value});
                                    }}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select
                                        required
                                        value={paymentForm.expiryMonth}
                                        onChange={(e) => setPaymentForm({...paymentForm, expiryMonth: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">MM</option>
                                        {Array.from({length: 12}, (_, i) => (
                                            <option key={i+1} value={String(i+1).padStart(2, '0')}>
                                                {String(i+1).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <select
                                        required
                                        value={paymentForm.expiryYear}
                                        onChange={(e) => setPaymentForm({...paymentForm, expiryYear: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">YY</option>
                                        {Array.from({length: 10}, (_, i) => (
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
                                        maxLength="4"
                                        value={paymentForm.cvv}
                                        onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '')})}
                                        placeholder="123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={paymentForm.cardholderName}
                                    onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value.toUpperCase()})}
                                    placeholder="JOHN DOE"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={paymentForm.email}
                                    onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={paymentForm.billingAddress}
                                    onChange={(e) => setPaymentForm({...paymentForm, billingAddress: e.target.value})}
                                    placeholder="Enter your billing address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Process Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Rent;