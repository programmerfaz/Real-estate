// Supabase configuration
import { createClient } from '@supabase/supabase-js'

// These will be set when you connect to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const propertyService = {
  // Get all properties with optional filters
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
    
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Add new property
  async addProperty(property) {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get user's favorite properties
  async getFavorites(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        properties (*)
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // Toggle favorite property
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