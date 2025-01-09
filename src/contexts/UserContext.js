import { createContext, useContext, useState } from 'react';
import { userDataService } from '../services/userDataService';
import { authService } from '../services/authService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [previousApplications, setPreviousApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAuthentication = async (email, isNewUser = false, userData = {}) => {
    try {
      if (isNewUser) {
        await userDataService.saveUserData(email, userData);
      } else {
        const userExists = await authService.checkUserExists(email);
        if (userExists) {
          const applications = await userDataService.getPreviousApplications(email);
          setPreviousApplications(applications);
        }
      }
      setUser({ email });
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const loadPreviousData = async (email) => {
    try {
      const applications = await userDataService.getPreviousApplications(email);
      return applications[0] || null;
    } catch (error) {
      console.error('Error loading previous data:', error);
      return null;
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user,
        previousApplications,
        handleAuthentication,
        loadPreviousData,
        loading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);