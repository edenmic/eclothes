import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createProfile } from '../lib/profileApi'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async ({ email, password, name }) => {
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error;
      
      // If signup was successful, create a profile for the user
      if (data?.user) {
        // Create initial profile with basic data
        const profileResult = await createProfile(data.user.id, {
          name: name || email.split('@')[0], // Use provided name or fallback to email username
          created_at: new Date(),
          updated_at: new Date()
        })
        
        if (!profileResult.success) {
          console.error('Failed to create user profile:', profileResult.error)
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error in signup process:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}