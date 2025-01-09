import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';

export const userDataService = {
  async saveUserData(email, data) {
    try {
      const userRef = doc(db, 'users', email);
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date(),
        email
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  async getUserData(email) {
    try {
      const userRef = doc(db, 'users', email);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  },

  async getPreviousApplications(email) {
    try {
      const applicationsRef = collection(db, 'loanApplications');
      const q = query(
        applicationsRef,
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting previous applications:', error);
      throw error;
    }
  }
}; 