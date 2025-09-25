import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Leads", href: "/leads", icon: "UserPlus" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Pipeline", href: "/pipeline", icon: "GitBranch" },
    { name: "Deals", href: "/deals", icon: "Handshake" },
    { name: "Invoices", href: "/invoices", icon: "FileText" },
    { name: "Activities", href: "/activities", icon: "Calendar" }
  ];

  const NavItem = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={isMobile ? onClose : undefined}
        className={cn(
          "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25"
            : "text-gray-700 hover:text-primary-600 hover:bg-primary-50 hover:scale-[1.02]"
        )}
      >
        <ApperIcon 
          name={item.icon} 
          className={cn(
            "mr-3 h-5 w-5 transition-colors duration-200",
            isActive ? "text-white" : "text-gray-500"
          )} 
        />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg shadow-lg">
                <ApperIcon name="BarChart3" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  SalePro
                </h1>
                <p className="text-xs text-gray-500">CRM Solution</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="px-3 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-3 rounded-lg border border-primary-200">
              <div className="flex items-center space-x-2">
                <div className="bg-success-500 p-1.5 rounded-full">
                  <ApperIcon name="CheckCircle" className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">All Systems Online</p>
                  <p className="text-xs text-gray-500">Version 2.1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-lg">
                    <ApperIcon name="BarChart3" className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">SalePro</h1>
                    <p className="text-xs text-primary-100">CRM Solution</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} isMobile />
                ))}
              </nav>

              {/* Mobile Footer */}
              <div className="p-3 border-t border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-3 rounded-lg border border-primary-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-success-500 p-1.5 rounded-full">
                      <ApperIcon name="CheckCircle" className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">All Systems Online</p>
                      <p className="text-xs text-gray-500">Version 2.1.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Sidebar;