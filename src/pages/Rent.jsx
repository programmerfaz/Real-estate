import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Filter, X, Home as HomeIcon, ArrowRight, MessageCircle, Building, Key, Shield, Eye, Calendar, Phone, Mail, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";

const Rent = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState(12);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: ''
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from("rentproperties").select("*");
        if (error) {
          console.error("Error fetching properties:", error.message);
        } else {
          setAllProperties(data || []);
        }
      } catch (error) {
        console.error("Error in fetchProperties:", error);
        setAllProperties([]);
      }
    };
    fetchProperties();
  }, []);

  const formatPrice = (price) => `${price} BHD/month`;

  const handleLoadMore = () => {
    setVisibleProperties((prev) => prev + 12);
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
      fullName: '',
      email: userEmail || '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      amount: property.price || ''
    });
  };

  const openDetailsModal = (property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
    setCurrentImageIndex(0);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Show success message
    alert('Booking successful! We will contact you soon to confirm your reservation.');
    setShowBookingModal(false);
    setBookingForm({
      fullName: '',
      email: '',
      phone: '',
      moveInDate: '',
      message: ''
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Show success message
    alert('Payment successful! Your down payment has been processed successfully.');
    setShowPaymentModal(false);
    setPaymentForm({
      fullName: '',
      email: '',
      phone: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      amount: ''
    });
  };

  const nextImage = () => {
    if (selectedProperty?.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Rent Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              Perfect Home
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover premium rental properties across Bahrain. From luxury apartments to family homes.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Rental Properties</h2>
            <p className="text-xl text-gray-600">Find your next home from our curated selection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProperties.slice(0, visibleProperties).map((property) => (
              <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      For Rent
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{property.title}</h3>

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

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </span>
                  </div>

                  {/* Action Buttons - Perfect 3-column grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openDetailsModal(property)}
                      className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openBookingModal(property)}
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Book
                    </button>
                    <button
                      onClick={() => openPaymentModal(property)}
                      className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleProperties < allProperties.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Property Details Modal */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Left: Image Carousel */}
              <div className="md:w-1/2 w-full h-[300px] md:h-full relative bg-gray-100">
                {selectedProperty?.images && selectedProperty.images.length > 0 ? (
                  <>
                    <img
                      src={selectedProperty.images[currentImageIndex]}
                      alt="property"
                      className="w-full h-full object-cover"
                    />
                    {selectedProperty.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-50"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-50"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                          {currentImageIndex + 1} / {selectedProperty.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No images available</span>
                  </div>
                )}
              </div>

              {/* Right: Scrollable Content */}
              <div className="md:w-1/2 w-full flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 border-b border-gray-200 bg-white">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProperty?.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedProperty?.address || selectedProperty?.location}
                  </p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-green-600">
                      {selectedProperty?.price} BHD/month
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                      For Rent
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                      {selectedProperty?.type}
                    </span>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                      <Bed className="w-5 h-5 text-blue-600" />
                      <span>{selectedProperty?.bedrooms} Bedrooms</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                      <Bath className="w-5 h-5 text-blue-600" />
                      <span>{selectedProperty?.bathrooms} Bathrooms</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                      <Square className="w-5 h-5 text-blue-600" />
                      <span>{selectedProperty?.sqft} Sq Ft</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <span>{selectedProperty?.parking} Parking</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProperty?.description && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedProperty.description}</p>
                    </div>
                  )}

                  {/* Property Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty?.year_built && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                        Built: {selectedProperty.year_built}
                      </span>
                    )}
                    {selectedProperty?.furnished && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                        {selectedProperty.furnished}
                      </span>
                    )}
                    {selectedProperty?.pet_friendly !== undefined && (
                      <span className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full">
                        {selectedProperty.pet_friendly ? 'Pet Friendly' : 'No Pets'}
                      </span>
                    )}
                  </div>

                  {/* Amenities */}
                  {selectedProperty?.amenities && selectedProperty.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Info */}
                  {selectedProperty?.agent_name && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-lg mb-3">Contact Agent</h3>
                      <div className="space-y-2">
                        <p className="text-gray-800 font-medium">{selectedProperty.agent_name}</p>
                        {selectedProperty.agent_phone && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {selectedProperty.agent_phone}
                          </p>
                        )}
                        {selectedProperty.agent_email && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {selectedProperty.agent_email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer with Action Buttons */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openBookingModal(selectedProperty);
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Now
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openPaymentModal(selectedProperty);
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
              <h3 className="text-xl font-bold text-gray-900">{selectedProperty?.title}</h3>
              <p className="text-sm text-gray-500">{selectedProperty?.location}</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">
                {selectedProperty?.price} BHD/month
              </p>
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
                    onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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
                    placeholder="Any special requirements or questions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Fixed Footer with Submit Button */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleBookingSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
              <p className="text-sm text-gray-500">{selectedProperty?.title}</p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                Amount: {selectedProperty?.price} BHD
              </p>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.fullName}
                    onChange={(e) => setPaymentForm({...paymentForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={paymentForm.email}
                    onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={paymentForm.phone}
                    onChange={(e) => setPaymentForm({...paymentForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BHD)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Fixed Footer with Submit Button */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handlePaymentSubmit}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Rent;