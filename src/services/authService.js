import { supabase } from '../utils/supabaseClient';

const formatAuthError = (error) => {
  if (error.message.includes('request this after')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (error.message.includes('User already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  return error.message;
};

export const authService = {
  // Sign up new user
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in signUp:', error.message);
      return { 
        success: false, 
        error: formatAuthError(error)
      };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Get user profile after successful login
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', data.user.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              role: 'client',
              full_name: data.user.user_metadata?.full_name || '',
              email: data.user.email
            }
          ])
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      return { 
        success: true, 
        data: {
          user: data.user,
          profile
        }
      };
    } catch (error) {
      console.error('Error in signIn:', error.message);
      return { 
        success: false, 
        error: formatAuthError(error)
      };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in signOut:', error.message);
      return { 
        success: false, 
        error: formatAuthError(error)
      };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error.message);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error.message);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error.message);
      return { 
        success: false, 
        error: formatAuthError(error)
      };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in updatePassword:', error.message);
      return { 
        success: false, 
        error: formatAuthError(error)
      };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error.message);
      throw error;
    }
  }
}; 