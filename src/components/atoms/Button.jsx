import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    warning: "bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-400 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    error: "bg-error-500 text-white hover:bg-error-600 focus:ring-error-400 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;