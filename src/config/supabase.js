// Supabase configuration and database services
import { createClient } from '@supabase/supabase-js'

// Supabase connection - these will be set when you connect to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Property service for database operations
export const propertyService = {
  /**
   * Get all properties with optional filters
   * @param {Object} filters - Filter options (type, minPrice, maxPrice, location)
   * @returns {Array} Array of properties
   */
  async getProperties(filters = {}) {
    let query = supabase.from('properties').select('*')
    
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Add new property to database
   * @param {Object} property - Property data
   * @returns {Object} Created property
   */
  async addProperty(property) {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
    
    if (error) throw error
    return data[0]
  },

  /**
   * Get user's favorite properties
   * @param {string} userId - User ID
   * @returns {Array} Array of favorite properties
   */
  async getFavorites(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        properties (*)
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  /**
   * Toggle favorite property for user
   * @param {string} userId - User ID
   * @param {number} propertyId - Property ID
   * @returns {boolean} True if added, false if removed
   */
  async toggleFavorite(userId, propertyId) {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id)
      if (error) throw error
      return false
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, property_id: propertyId }])
      if (error) throw error
      return true
    }
  }
}

// User service for profile management
export const userService = {
  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object} Updated profile
   */
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{ user_id: userId, ...profileData }])
      .select()
    
    if (error) throw error
    return data[0]
  }
}