// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 8 }) => (
  <div className={`inline-block h-${size} w-${size} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`} />
);

export default LoadingSpinner;