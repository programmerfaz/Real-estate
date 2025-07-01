import React, { useEffect, useState, useRef } from "react";
import { 
  MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, 
  Home as HomeIcon, Filter, X, Search, Grid3X3, List, Phone, Mail, MessageCircle,
  Calendar, Clock, User, CheckCircle, Send, Heart, Camera, Shield, Wifi, 
  Dumbbell, Car as CarIcon, Trees, Waves, Building2, ArrowRight, CreditCard,
  Lock, Eye, EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';
import PropertyCard from "../components/PropertyCard";

const Rent = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
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
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const propertiesSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        fetchFavourites(user.email);
      } else {
        setUserEmail(null);
        setFavourites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFavourites = async (email) => {
    try {
      const { data, error } = await supabase
        .from('favourites')
        .select('property_id')
        .eq('user_email', email);

      if (!error && data) {
        const ids = data.map((fav) => fav.property_id);
        setFavourites(ids);
      }
    } catch (error) {
      console.error('Error fetching favourites:', error);
    }
  };

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

  const toggleFavourite = async (propertyId) => {
    if (!userEmail) {
      alert("Please sign in to manage favourites.");
      return;
    }

    const isFavourite = favourites.includes(propertyId);

    try {
      if (isFavourite) {
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('user_email', userEmail)
          .eq('property_id', propertyId);

        if (!error) {
          setFavourites(favourites.filter((id) => id !== propertyId));
        }
      } else {
        const { error } = await supabase.from('favourites').insert([
          { user_email: userEmail, property_id: propertyId },
        ]);

        if (!error) {
          setFavourites([...favourites, propertyId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Send email to developerfaz@gmail.com
    const emailData = {
      to: 'developerfaz@gmail.com',
      subject: `New Booking Request - ${selectedProperty.title}`,
      body: `
        New booking request received:
        
        Property: ${selectedProperty.title}
        Location: ${selectedProperty.location}
        Price: ${formatPrice(selectedProperty.price)}/month
        
        Customer Details:
        Name: ${bookingForm.name}
        Email: ${bookingForm.email}
        Phone: ${bookingForm.phone}
        Preferred Date: ${bookingForm.preferredDate}
        Preferred Time: ${bookingForm.preferredTime}
        Message: ${bookingForm.message}
        
        Please contact the customer to confirm the booking.
      `
    };

    // Create mailto link
    const mailtoLink = `mailto:developerfaz@gmail.com?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(mailtoLink);

    setBookingSubmitted(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSubmitted(false);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
      });
    }, 2000);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Store card details in database
      const { data, error } = await supabase
        .from('user_cards')
        .insert([
          {
            user_id: userEmail, // Using email as user_id for now
            full_name: paymentForm.cardholderName,
            email: paymentForm.email,
            phone_number: '', // You might want to add this field
            card_last4: paymentForm.cardNumber.slice(-4),
            card_brand: getCardBrand(paymentForm.cardNumber),
            card_expiry_month: parseInt(paymentForm.expiryMonth),
            card_expiry_year: parseInt(paymentForm.expiryYear),
            encrypted_token: btoa(paymentForm.cardNumber), // Basic encoding - use proper encryption in production
            billing_address: paymentForm.billingAddress
          }
        ]);

      if (error) {
        console.error('Error storing payment details:', error);
        alert('Error processing payment. Please try again.');
        return;
      }

      // Send success email to user
      const successEmailData = {
        to: paymentForm.email,
        subject: 'Payment Successful - Wealth Home',
        body: `
          Dear ${paymentForm.cardholderName},
          
          Your payment has been processed successfully!
          
          Payment Details:
          Card ending in: ****${paymentForm.cardNumber.slice(-4)}
          Amount: Down payment for ${selectedProperty?.title || 'Property'}
          Date: ${new Date().toLocaleDateString()}
          
          Thank you for choosing Wealth Home.
          
          Best regards,
          Wealth Home Team
        `
      };

      const successMailtoLink = `mailto:${paymentForm.email}?subject=${encodeURIComponent(successEmailData.subject)}&body=${encodeURIComponent(successEmailData.body)}`;
      window.open(successMailtoLink);

      setPaymentSubmitted(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSubmitted(false);
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
  };

  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

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

  const openBookingModal = (property) => {
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const openPaymentModal = (property) => {
    setSelectedProperty(property);
    setShowPaymentModal(true);
  };

  const openPropertyModal = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const scrollToProperties = () => {
    propertiesSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const formatPrice = (price) => `${price?.toLocaleString() || 0} BHD`;

  const generateEmailLink = (property) => {
    const subject = `Inquiry about ${property.title}`;
    const body = `Hi,\n\nI'm interested in renting the property: ${property.title}\nLocation: ${property.location}\nPrice: ${formatPrice(property.price)}/month\n\nPlease provide more details.\n\nBest regards`;
    return `mailto:${property.agent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const generateWhatsAppLink = (property) => {
    const message = `Hi! I'm interested in renting ${property.title} in ${property.location}. Could you please provide more details?`;
    return `https://wa.me/${property.agent_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const featuredProperties = allProperties.filter(p => p.featured).slice(0, 6);
  const regularProperties = allProperties.filter(p => !p.featured).slice(0, 12);

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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-800/50 rounded-full text-blue-200 text-sm font-medium mb-6">
            <Building2 className="w-4 h-4 mr-2" />
            Premium Rental Properties
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              Rental Home
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover exceptional rental properties across Bahrain. From luxury apartments to family villas, 
            find your ideal home with flexible booking and direct agent contact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={scrollToProperties}
              className="group bg-white text-blue-900 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Rentals
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <Link to="/AIHelp">
              <button className="group border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-900 transition-all duration-300 font-semibold text-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Get AI Assistance
              </button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">{allProperties.length}+</div>
              <div className="text-blue-200 text-sm">Available Rentals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-blue-200 text-sm">Agent Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Instant</div>
              <div className="text-blue-200 text-sm">Booking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section ref={propertiesSectionRef} className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Rental Properties</h2>
              <p className="text-xl text-gray-600">Premium properties with instant booking available</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
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
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{property.rating || 4.5}</span>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => openBookingModal(property)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Book
                      </button>
                      
                      <button
                        onClick={() => openPropertyModal(property)}
                        className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={generateEmailLink(property)}
                        className="bg-green-600 text-white px-2 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                      
                      <a
                        href={generateWhatsAppLink(property)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 text-white px-2 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Chat
                      </a>

                      <button
                        onClick={() => openPaymentModal(property)}
                        className="bg-purple-600 text-white px-2 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" />
                        Pay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Rental Properties</h2>
            <p className="text-xl text-gray-600">Explore our complete collection of rental homes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {property.location}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-3 text-gray-600 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div>{property.sqft} sq ft</div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(property.price)}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">/mo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <button
                      onClick={() => openBookingModal(property)}
                      className="bg-blue-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      Book
                    </button>
                    
                    <button
                      onClick={() => openPropertyModal(property)}
                      className="bg-gray-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <a
                      href={generateEmailLink(property)}
                      className="bg-green-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                    
                    <a
                      href={generateWhatsAppLink(property)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </a>

                    <button
                      onClick={() => openPaymentModal(property)}
                      className="bg-purple-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <HomeIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties available</h3>
              <p className="text-gray-500">Check back later for new rental listings</p>
            </div>
          )}
        </div>
      </section>

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Property Details</h3>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <PropertyCard
                {...selectedProperty}
                isFavourite={favourites.includes(selectedProperty.id)}
                toggleFavourite={() => toggleFavourite(selectedProperty.id)}
                showViewButton={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Viewing</h3>
                  <p className="text-gray-600">{selectedProperty.title}</p>
                  <p className="text-sm text-gray-500">{selectedProperty.location}</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {!bookingSubmitted ? (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        required
                        value={bookingForm.preferredTime}
                        onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Message
                    </label>
                    <textarea
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific requirements or questions..."
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Property Details</h4>
                    <div className="text-sm text-blue-800">
                      <p><strong>Price:</strong> {formatPrice(selectedProperty.price)}/month</p>
                      <p><strong>Agent:</strong> {selectedProperty.agent_name}</p>
                      <p><strong>Contact:</strong> {selectedProperty.agent_phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Booking
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Your viewing request has been sent to the agent. They will contact you shortly to confirm the appointment.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                    <p><strong>Reference:</strong> BK{Date.now().toString().slice(-6)}</p>
                    <p><strong>Agent:</strong> {selectedProperty.agent_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Make Down Payment</h3>
                  <p className="text-gray-600">{selectedProperty.title}</p>
                  <p className="text-sm text-gray-500">Secure your rental with a down payment</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {!paymentSubmitted ? (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({...paymentForm, cardNumber: formatCardNumber(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Month *
                      </label>
                      <select
                        required
                        value={paymentForm.expiryMonth}
                        onChange={(e) => setPaymentForm({...paymentForm, expiryMonth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Year *
                      </label>
                      <select
                        required
                        value={paymentForm.expiryYear}
                        onChange={(e) => setPaymentForm({...paymentForm, expiryYear: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <div className="relative">
                        <input
                          type={showCvv ? "text" : "password"}
                          required
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="123"
                          maxLength={4}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardholderName}
                      onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={paymentForm.email}
                      onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Billing Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Address *
                    </label>
                    <textarea
                      required
                      value={paymentForm.billingAddress}
                      onChange={(e) => setPaymentForm({...paymentForm, billingAddress: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your billing address"
                    />
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Payment Summary</h4>
                    <div className="text-sm text-blue-800">
                      <p><strong>Property:</strong> {selectedProperty.title}</p>
                      <p><strong>Monthly Rent:</strong> {formatPrice(selectedProperty.price)}</p>
                      <p><strong>Down Payment:</strong> {formatPrice(Math.round(selectedProperty.price * 0.1))}</p>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Process Payment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-4">
                    Your down payment has been processed successfully. A confirmation email has been sent to your email address.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                    <p><strong>Transaction ID:</strong> TXN{Date.now().toString().slice(-8)}</p>
                    <p><strong>Amount:</strong> {formatPrice(Math.round(selectedProperty.price * 0.1))}</p>
                    <p><strong>Card:</strong> ****{paymentForm.cardNumber.slice(-4)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Rental Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with our agents instantly via email or WhatsApp, or book a viewing online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/AIHelp">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Get AI Assistance
              </button>
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Wealth Home</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for finding the perfect rental property in Bahrain.
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
              <h3 className="text-white font-semibold mb-4">Popular Areas</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Manama</a></li>
                <li><a href="#" className="hover:text-white">Riffa</a></li>
                <li><a href="#" className="hover:text-white">Amwaj Islands</a></li>
                <li><a href="#" className="hover:text-white">Seef</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+973 1234 5678</li>
                <li>rentals@wealthhome.com</li>
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