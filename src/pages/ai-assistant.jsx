import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Home, DollarSign, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'

const AIAssistant = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Sample AI responses for real estate queries
  const aiResponses = {
    greeting: [
      "Hello! I'm your AI real estate assistant. How can I help you find the perfect property in Bahrain today?",
      "Hi there! I'm here to help you with all your real estate needs in Bahrain. What are you looking for?",
      "Welcome! I can help you buy, rent, or get information about properties in Bahrain. What would you like to know?"
    ],
    buy: [
      "I'd be happy to help you find properties for sale! What's your budget range and preferred location in Bahrain?",
      "Great choice! Bahrain has excellent investment opportunities. Are you looking for residential or commercial properties?",
      "Let me help you find the perfect property to buy. What type of property interests you - villa, apartment, or townhouse?"
    ],
    rent: [
      "Looking for a rental property? I can help! What's your monthly budget and how many bedrooms do you need?",
      "Rental properties in Bahrain offer great flexibility. Are you looking for furnished or unfurnished options?",
      "I can suggest some excellent rental properties. Which area of Bahrain would you prefer to live in?"
    ],
    location: [
      "Bahrain has many great neighborhoods! Riffa is perfect for families, Juffair is great for professionals, and Seef offers excellent shopping and dining.",
      "Popular areas include Manama (business district), Amwaj Islands (luxury waterfront), and Saar (quiet residential). What lifestyle are you looking for?",
      "Each area in Bahrain has its unique charm. Diplomatic Area is central, Muharraq has cultural heritage, and Hamad Town offers affordable family homes."
    ],
    price: [
      "Property prices in Bahrain vary by location and type. Apartments start from 80,000 BHD, while luxury villas can go up to 500,000 BHD or more.",
      "For rentals, you can find apartments from 300 BHD/month and villas from 800 BHD/month, depending on location and amenities.",
      "The market is quite competitive. I recommend viewing multiple properties and considering factors like location, amenities, and future development plans."
    ],
    investment: [
      "Bahrain's real estate market offers excellent investment opportunities with steady rental yields and capital appreciation potential.",
      "Consider factors like location, infrastructure development, and rental demand when investing. Areas near business districts typically perform well.",
      "I can help you analyze potential returns and suggest properties that align with your investment goals and risk tolerance."
    ],
    default: [
      "That's an interesting question! Could you provide more details so I can give you the most helpful information?",
      "I'm here to help with real estate in Bahrain. Feel free to ask about buying, renting, locations, prices, or investment opportunities!",
      "Let me know what specific aspect of real estate you'd like to explore, and I'll provide detailed information."
    ]
  }

  const quickActions = [
    { icon: Home, text: "Find properties for sale", category: "buy" },
    { icon: MapPin, text: "Best neighborhoods in Bahrain", category: "location" },
    { icon: DollarSign, text: "Property prices and market trends", category: "price" },
    { icon: Sparkles, text: "Investment opportunities", category: "investment" }
  ]

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI real estate assistant for Bahrain. I can help you find properties to buy or rent, provide market insights, and answer any questions about real estate in Bahrain. How can I assist you today?",
        timestamp: new Date()
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)]
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('sale')) {
      return aiResponses.buy[Math.floor(Math.random() * aiResponses.buy.length)]
    } else if (lowerMessage.includes('rent') || lowerMessage.includes('rental') || lowerMessage.includes('lease')) {
      return aiResponses.rent[Math.floor(Math.random() * aiResponses.rent.length)]
    } else if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('neighborhood') || lowerMessage.includes('where')) {
      return aiResponses.location[Math.floor(Math.random() * aiResponses.location.length)]
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('expensive')) {
      return aiResponses.price[Math.floor(Math.random() * aiResponses.price.length)]
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('investment') || lowerMessage.includes('return') || lowerMessage.includes('profit')) {
      return aiResponses.investment[Math.floor(Math.random() * aiResponses.investment.length)]
    } else {
      return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)]
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3 seconds delay
  }

  const handleQuickAction = (category) => {
    const responses = aiResponses[category]
    const response = responses[Math.floor(Math.random() * responses.length)]
    
    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Real Estate Assistant</h1>
          <p className="text-gray-600">
            Get instant help with property searches, market insights, and real estate advice for Bahrain
          </p>
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.category)}
                  className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <action.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about real estate in Bahrain..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="1"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-gray-600 text-sm">Get personalized property suggestions based on your preferences and budget.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Local Expertise</h3>
            <p className="text-gray-600 text-sm">Access detailed information about Bahrain's neighborhoods and market trends.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Investment Insights</h3>
            <p className="text-gray-600 text-sm">Get expert advice on property investments and market opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant