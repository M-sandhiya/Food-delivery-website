import React from 'react';
import '../styles/loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loader;
