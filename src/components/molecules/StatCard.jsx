import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon, 
  iconBg = "bg-primary-100",
  iconColor = "text-primary-600",
  className = "" 
}) => {
  const changeColors = {
    positive: "text-success-600 bg-success-100",
    negative: "text-error-600 bg-error-100",
    neutral: "text-gray-600 bg-gray-100"
  };

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200", className)}>
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  changeColors[changeType]
                )}>
                  {changeType === "positive" && <ApperIcon name="TrendingUp" className="h-3 w-3 mr-1" />}
                  {changeType === "negative" && <ApperIcon name="TrendingDown" className="h-3 w-3 mr-1" />}
                  {change}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("p-3 rounded-full", iconBg)}>
              <ApperIcon name={icon} className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatCard;