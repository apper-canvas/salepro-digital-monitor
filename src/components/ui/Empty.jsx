import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by creating your first item.",
  icon = "Folder",
  action,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <ApperIcon name={icon} className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {action.icon && <ApperIcon name={action.icon} className="h-4 w-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

export default Empty;