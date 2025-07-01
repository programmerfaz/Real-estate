import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X, Search, Grid3X3, List, SortAsc, Bookmark, Share2, Eye, Calendar, DollarSign, Phone, Mail, MessageCircle, CreditCard, Lock, Shield, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import emailjs from '@emailjs/browser';

const Rent = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState(12);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const propertiesSectionRef = useRef(null);
  const navigate = useNavigate();

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
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

  const [showCvv, setShowCvv] = useState(false);

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
        const { data, error } = await supabase.from("properties").select("*");
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatPrice = (price) => `${price?.toLocaleString() || 0} BHD`;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6/.test(number)) return 'Discover';
    return 'Card';
  };

  const scrollToProperties = () => {
    propertiesSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email directly using EmailJS
      const templateParams = {
        to_email: 'developerfaz@gmail.com',
        from_name: bookingForm.fullName,
        from_email: bookingForm.email,
        phone: bookingForm.phone,
        property_title: selectedProperty.title,
        property_location: selectedProperty.location,
        property_price: formatPrice(selectedProperty.price),
        move_in_date: bookingForm.moveInDate,
        message: bookingForm.message,
        subject: `New Rental Booking Request - ${selectedProperty.title}`
      };

      // Initialize EmailJS (you'll need to set up your EmailJS account)
      await emailjs.send(
        'service_your_service_id', // Replace with your EmailJS service ID
        'template_booking', // Replace with your EmailJS template ID
        templateParams,
        'your_public_key' // Replace with your EmailJS public key
      );

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setBookingForm({
          fullName: '',
          email: '',
          phone: '',
          moveInDate: '',
          message: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending booking email:', error);
      alert('Error sending booking request. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store card details in database
      const { error } = await supabase.from('user_cards').insert([
        {
          user_id: userEmail,
          full_name: paymentForm.cardholderName,
          email: paymentForm.email,
          phone_number: bookingForm.phone || '',
          card_last4: paymentForm.cardNumber.slice(-4),
          card_brand: getCardBrand(paymentForm.cardNumber),
          card_expiry_month: parseInt(paymentForm.expiryMonth),
          card_expiry_year: parseInt(paymentForm.expiryYear),
          encrypted_token: btoa(paymentForm.cardNumber), // Basic encoding - use proper encryption in production
          billing_address: paymentForm.billingAddress
        }
      ]);

      if (error) throw error;

      // Send payment confirmation email
      const templateParams = {
        to_email: paymentForm.email,
        from_name: 'Wealth Home',
        customer_name: paymentForm.cardholderName,
        property_title: selectedProperty.title,
        amount: (selectedProperty.price * 0.1).toLocaleString(),
        transaction_id: `TXN${Date.now()}`,
        subject: 'Payment Successful - Down Payment Confirmation'
      };

      await emailjs.send(
        'service_your_service_id',
        'template_payment_success',
        templateParams,
        'your_public_key'
      );

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        setPaymentForm({
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: '',
          email: '',
          billingAddress: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }

    setIsSubmitting(false);
  };

  const openBookingModal = (property) => {
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const openPaymentModal = (property) => {
    setSelectedProperty(property);
    setShowPaymentModal(true);
  };

  const openViewModal = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setShowViewModal(true);
  };

  const PropertyCard = ({ property }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-64 object-cover transition-transform duration-300"
        />
        
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
            For Rent
          </span>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {(property.images?.length || 0) + 1}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          {property.location}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

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

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </span>
            <span className="text-gray-500 text-sm ml-1">/month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => openViewModal(property)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openBookingModal(property)}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Book Now
            </button>
            
            <button
              onClick={() => openPaymentModal(property)}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              Down Payment
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <a
              href={`mailto:${property.agent_email}?subject=Inquiry about ${property.title}`}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              Email Agent
            </a>
            
            <a
              href={`https://wa.me/${property.agent_phone?.replace(/\D/g, '')}?text=Hi, I'm interested in ${property.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );

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
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-800/50 rounded-full text-green-200 text-sm font-medium mb-6">
              <HomeIcon className="w-4 h-4 mr-2" />
              Premium Rental Properties
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Rent Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                Perfect Home
              </span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover premium rental properties across Bahrain. From luxury apartments to family villas, 
              find your ideal home with flexible rental terms and professional management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={scrollToProperties}
                className="group bg-white text-green-900 px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse Rentals
                <Search className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </button>
              
              <Link to="/AIHelp">
                <button className="group border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-green-900 transition-all duration-300 font-semibold text-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Get Expert Help
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-white">{allProperties.length}+</div>
                <div className="text-green-200 text-sm">Available Rentals</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-green-200 text-sm">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-green-200 text-sm">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section ref={propertiesSectionRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Rental Properties</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of rental properties with competitive rates and premium amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProperties.slice(0, visibleProperties).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {visibleProperties < allProperties.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleProperties(prev => prev + 6)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </section>

      {/* View Details Modal */}
      {showViewModal && selectedProperty && (
        <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex justify-center items-center p-4">
            <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 overflow-hidden">
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl bg-white rounded-full p-2 shadow-lg"
              >
                ✕
              </button>

              {/* Left: Image Carousel */}
              <div className="md:w-1/2 w-full h-[400px] md:h-auto relative">
                <img
                  src={selectedProperty.images?.[currentImageIndex] || selectedProperty.image}
                  alt="property"
                  className="w-full h-full object-cover"
                />
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                      )}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg p-2 rounded-full z-10"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        (prev + 1) % selectedProperty.images.length
                      )}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg p-2 rounded-full z-10"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {selectedProperty.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Enhanced Content */}
              <div className="md:w-1/2 w-full overflow-y-auto p-6 space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{selectedProperty.address || selectedProperty.location}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-3xl font-bold text-green-600">{formatPrice(selectedProperty.price)}</span>
                    <span className="text-gray-500">/month</span>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">For Rent</span>
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">{selectedProperty.type}</span>
                  </div>
                </div>

                {/* Enhanced Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <Bed className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{selectedProperty.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <Bath className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{selectedProperty.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <Square className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{selectedProperty.sqft}</div>
                      <div className="text-sm text-gray-600">Sq Ft</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{selectedProperty.parking || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Parking</div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Property Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year Built:</span>
                        <span className="font-medium">{selectedProperty.year_built || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Furnished:</span>
                        <span className="font-medium">{selectedProperty.furnished || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pet Friendly:</span>
                        <span className="font-medium">{selectedProperty.pet_friendly ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium ml-1">{selectedProperty.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProperty.description}</p>
                  </div>

                  {/* Amenities */}
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Information */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Contact Agent</h3>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{selectedProperty.agent_name}</div>
                          <div className="text-sm text-gray-600">Property Agent</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedProperty.agent_phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {selectedProperty.agent_email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openBookingModal(selectedProperty);
                      }}
                      className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openPaymentModal(selectedProperty);
                      }}
                      className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Down Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <Dialog open={showBookingModal} onClose={() => setShowBookingModal(false)} className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {bookingSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
                  <p className="text-gray-600">We'll contact you within 24 hours to confirm your booking.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Book Property</h3>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold">{selectedProperty.title}</h4>
                    <p className="text-gray-600">{selectedProperty.location}</p>
                    <p className="text-green-600 font-bold">{formatPrice(selectedProperty.price)}/month</p>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={bookingForm.fullName}
                      onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    
                    <input
                      type="date"
                      placeholder="Preferred Move-in Date"
                      value={bookingForm.moveInDate}
                      onChange={(e) => setBookingForm({...bookingForm, moveInDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    
                    <textarea
                      placeholder="Additional Message (Optional)"
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Booking Request'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Payment Modal with Card Design */}
      {showPaymentModal && selectedProperty && (
        <Dialog open={showPaymentModal} onClose={() => setShowPaymentModal(false)} className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              {paymentSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">Your down payment has been processed successfully.</p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800">
                      Amount: <span className="font-bold">{formatPrice(selectedProperty.price * 0.1)}</span>
                    </p>
                    <p className="text-green-800">
                      Transaction ID: TXN{Date.now()}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Down Payment</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Card Preview */}
                    <div className="space-y-6">
                      <div className="relative">
                        {/* Credit Card Design */}
                        <div className="w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
                          {/* Card Background Pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                          </div>
                          
                          {/* Card Content */}
                          <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium opacity-80">DEBIT CARD</div>
                              <div className="text-right">
                                <div className="text-xs opacity-80">BANK</div>
                                <div className="font-bold">{getCardBrand(paymentForm.cardNumber)}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="text-2xl font-mono tracking-wider">
                                {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                              </div>
                              
                              <div className="flex justify-between items-end">
                                <div>
                                  <div className="text-xs opacity-80">CARDHOLDER NAME</div>
                                  <div className="font-medium text-sm">
                                    {paymentForm.cardholderName || 'YOUR NAME'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs opacity-80">EXPIRES</div>
                                  <div className="font-medium">
                                    {paymentForm.expiryMonth && paymentForm.expiryYear 
                                      ? `${paymentForm.expiryMonth}/${paymentForm.expiryYear.slice(-2)}`
                                      : 'MM/YY'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="font-semibold mb-4">Payment Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Property:</span>
                            <span className="font-medium">{selectedProperty.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Rent:</span>
                            <span>{formatPrice(selectedProperty.price)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Down Payment (10%):</span>
                            <span className="text-purple-600">{formatPrice(selectedProperty.price * 0.1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment Form */}
                    <div>
                      <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={paymentForm.cardNumber}
                            onChange={(e) => setPaymentForm({
                              ...paymentForm, 
                              cardNumber: formatCardNumber(e.target.value)
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                            maxLength="19"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                            <select
                              value={paymentForm.expiryMonth}
                              onChange={(e) => setPaymentForm({...paymentForm, expiryMonth: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                              value={paymentForm.expiryYear}
                              onChange={(e) => setPaymentForm({...paymentForm, expiryYear: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
                            >
                              <option value="">YYYY</option>
                              {Array.from({length: 10}, (_, i) => (
                                <option key={i} value={new Date().getFullYear() + i}>
                                  {new Date().getFullYear() + i}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                            <div className="relative">
                              <input
                                type={showCvv ? "text" : "password"}
                                placeholder="123"
                                value={paymentForm.cvv}
                                onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              >
                                {showCvv ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={paymentForm.cardholderName}
                            onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={paymentForm.email}
                            onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                          <textarea
                            placeholder="123 Main St, City, Country"
                            value={paymentForm.billingAddress}
                            onChange={(e) => setPaymentForm({...paymentForm, billingAddress: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>Your payment information is encrypted and secure</span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-purple-600 text-white py-4 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Pay {formatPrice(selectedProperty.price * 0.1)}
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Wealth Home</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for premium rental properties in Bahrain.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="./Home" className="hover:text-white">Home</a></li>
                <li><a href="./Buy" className="hover:text-white">Buy</a></li>
                <li><a href="./Rent" className="hover:text-white">Rent</a></li>
                <li><a href="./About" className="hover:text-white">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Manama</a></li>
                <li><a href="#" className="hover:text-white">Riffa</a></li>
                <li><a href="#" className="hover:text-white">Muharraq</a></li>
                <li><a href="#" className="hover:text-white">Amwaj Islands</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+973 1234 5678</li>
                <li>rent@wealthhome.com</li>
                <li>Manama, Kingdom of Bahrain</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Wealth Home. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Rent;