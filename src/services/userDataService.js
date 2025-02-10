import { supabase } from '../utils/supabaseClient';

export const userDataService = {
  async saveUserData(email, data) {
    try {
      const { data: result, error } = await supabase
        .from('users')
        .upsert([{
          email,
          ...data,
          updated_at: new Date()
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  async getUserData(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  async getPreviousApplications(email) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting previous applications:', error);
      throw error;
    }
  }
}; 