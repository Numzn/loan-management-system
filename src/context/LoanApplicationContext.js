import React, { createContext, useContext, useReducer } from 'react';

const LoanApplicationContext = createContext();

const initialState = {
  application: {
    applicationId: '',
    currentStep: 0,
    status: 'pending',
    documents: [],
    notifications: [],
    lastUpdated: null,
  },
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_APPLICATION':
      return {
        ...state,
        application: action.payload,
        loading: false,
      };
    case 'UPDATE_STATUS':
      return {
        ...state,
        application: {
          ...state.application,
          currentStep: action.payload.step,
          status: action.payload.status,
          lastUpdated: new Date().toISOString(),
        },
      };
    case 'UPDATE_DOCUMENTS':
      return {
        ...state,
        application: {
          ...state.application,
          documents: action.payload,
        },
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        application: {
          ...state.application,
          notifications: [action.payload, ...state.application.notifications],
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export const LoanApplicationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateApplicationStatus = (step, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { step, status } });
  };

  const updateDocuments = (documents) => {
    dispatch({ type: 'UPDATE_DOCUMENTS', payload: documents });
  };

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const value = {
    state,
    updateApplicationStatus,
    updateDocuments,
    addNotification,
  };

  return (
    <LoanApplicationContext.Provider value={value}>
      {children}
    </LoanApplicationContext.Provider>
  );
};

export const useLoanApplication = () => {
  const context = useContext(LoanApplicationContext);
  if (!context) {
    throw new Error('useLoanApplication must be used within a LoanApplicationProvider');
  }
  return context;
};

export default LoanApplicationContext; 