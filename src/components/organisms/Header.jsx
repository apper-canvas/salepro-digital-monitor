import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, title }) => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="lg:ml-64 bg-white border-b border-gray-200 shadow-sm">
    <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <ApperIcon name="Menu" className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">Manage your business relationships</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                {isAuthenticated && user && <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center space-x-3">
                        <div
                            className="bg-gradient-to-r from-primary-50 to-blue-50 px-4 py-2 rounded-lg border border-primary-200">
                            <div className="flex items-center space-x-2">
                                <div className="bg-success-500 p-1 rounded-full">
                                    <ApperIcon name="CheckCircle" className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">System Status</span>
                                <span className="text-xs text-success-600 font-semibold">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.emailAddress}</p>
                        </div>
                        <div className="bg-primary-100 p-2 rounded-full">
                            <ApperIcon name="User" className="h-6 w-6 text-primary-600" />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-gray-900">
                            <ApperIcon name="LogOut" className="h-4 w-4 mr-2" />Logout
                                              </Button>
                    </div>
                </div>}
            </div>
        </div>
    </div>
</header>
  );
};

export default Header;