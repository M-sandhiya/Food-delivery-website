import React, { createContext, useContext, useState, useEffect } from 'react';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(() => {
    const stored = localStorage.getItem('selectedRestaurant');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    } else {
      localStorage.removeItem('selectedRestaurant');
    }
  }, [restaurant]);

  return (
    <RestaurantContext.Provider value={{ restaurant, setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}; 