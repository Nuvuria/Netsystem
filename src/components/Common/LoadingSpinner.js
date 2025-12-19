import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
