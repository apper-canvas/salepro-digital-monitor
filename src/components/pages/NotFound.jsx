import React from 'react';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <ApperIcon name="AlertTriangle" className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl text-gray-600">Page not found</p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ApperIcon name="Home" className="h-5 w-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;