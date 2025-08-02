import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md ${
        hover ? 'hover:shadow-lg transition-shadow duration-200' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;