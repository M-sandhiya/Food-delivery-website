import React, { createContext, useContext, useReducer, useEffect } from 'react';

const DeliveryContext = createContext();

const initialState = {
  isAuthenticated: false,
  partner: null,
  token: null,
  currentOrder: null,
  isLocationSharing: false,
  loading: false,
  error: null
};

const deliveryReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        partner: action.payload.partner,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...initialState
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'ACCEPT_ORDER':
      return {
        ...state,
        currentOrder: action.payload
      };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          status: action.payload
        }
      };
    case 'START_LOCATION_SHARING':
      return {
        ...state,
        isLocationSharing: true
      };
    case 'STOP_LOCATION_SHARING':
      return {
        ...state,
        isLocationSharing: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        partner: {
          ...state.partner,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export const DeliveryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(deliveryReducer, initialState);

  useEffect(() => {
    // Check for stored token and partner data on app load
    const token = localStorage.getItem('delivery_token');
    const partner = localStorage.getItem('delivery_partner');
    
    if (token && partner) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          partner: JSON.parse(partner)
        }
      });
    }
  }, []);

  const login = (token, partner) => {
    localStorage.setItem('delivery_token', token);
    localStorage.setItem('delivery_partner', JSON.stringify(partner));
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, partner }
    });
  };

  const logout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_partner');
    dispatch({ type: 'LOGOUT' });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const acceptOrder = (order) => {
    dispatch({ type: 'ACCEPT_ORDER', payload: order });
  };

  const updateOrderStatus = (status) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: status });
  };

  const startLocationSharing = () => {
    dispatch({ type: 'START_LOCATION_SHARING' });
  };

  const stopLocationSharing = () => {
    dispatch({ type: 'STOP_LOCATION_SHARING' });
  };

  const updateProfile = (profileData) => {
    const updatedPartner = { ...state.partner, ...profileData };
    localStorage.setItem('delivery_partner', JSON.stringify(updatedPartner));
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
  };

  return (
    <DeliveryContext.Provider value={{
      ...state,
      login,
      logout,
      setLoading,
      setError,
      acceptOrder,
      updateOrderStatus,
      startLocationSharing,
      stopLocationSharing,
      updateProfile
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};