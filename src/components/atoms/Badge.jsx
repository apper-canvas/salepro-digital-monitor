import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    error: "bg-error-100 text-error-800",
    primary: "bg-primary-100 text-primary-800",
    new: "bg-blue-100 text-blue-800",
    qualified: "bg-green-100 text-green-800",
    contacted: "bg-yellow-100 text-yellow-800",
    proposal: "bg-purple-100 text-purple-800",
    negotiation: "bg-orange-100 text-orange-800",
    closed: "bg-gray-100 text-gray-800",
    won: "bg-success-100 text-success-800",
    lost: "bg-error-100 text-error-800",
    paid: "bg-success-100 text-success-800",
    pending: "bg-warning-100 text-warning-800",
    overdue: "bg-error-100 text-error-800",
    draft: "bg-gray-100 text-gray-800"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;