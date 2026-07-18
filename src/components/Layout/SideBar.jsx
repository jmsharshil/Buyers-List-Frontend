import React, { useState } from 'react';
import { 
  Database, 
  Filter, 
  FileText, 
  Users,
  Home,
  LogOut
} from 'lucide-react';
import allAssets from '../../assets/assets';

const SideBar = ({ onNavigate, currentPath = '/dashboard' }) => {
  const menuItems = [
    {
      icon: Home,
      name: 'Dashboard',
      path: '/gpc-dashboard',
    },
    {
      icon: Filter,
      name: 'Screening',
      path: '/gpc-screening',
    },
    {
      icon: FileText,
      name: 'Results',
      path: '/gpc-results',
    },
    {
      icon: Users,
      name: 'Users',
      path: '/users',
    },
  ];

  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleLogout = () => {
    if (onNavigate) {
      onNavigate('/');
    }
  };

  return (
   <div className="fixed left-2 lg:left-4 top-1/2 transform -translate-y-1/2 w-14 lg:w-16 h-1/2 max-h-96 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center z-50 shadow-xl">
  <div className="absolute top-3 lg:top-4 p-1.5 lg:p-2">
    <div className="w-10 h-10 lg:w-8 lg:h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
      <img src={allAssets.Logo} alt="" />
    </div>
  </div>

  {/* Nav Items */}
  <nav className="flex flex-col space-y-4 lg:space-y-6">
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentPath === item.path;

      return (
        <div key={item.path} className="relative group">
          <button
            onClick={() => handleNavigation(item.path)}
            className={`p-2.5 lg:p-3 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105
              ${isActive
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400 ring-opacity-50'
                : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100 hover:shadow-md'
              }`}
          >
            <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
            {isActive && (
              <div className="absolute -right-0.5 lg:-right-1 -top-0.5 lg:-top-1 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-purple-400 rounded-full animate-pulse"></div>
            )}
          </button>

          {/* Tooltip */}
          <div className="absolute left-full ml-2 lg:ml-3 px-2 lg:px-3 py-1.5 lg:py-2 bg-white text-gray-800 text-xs lg:text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap top-1/2 transform -translate-y-1/2 scale-95 group-hover:scale-100 border border-gray-200">
            {item.name}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
          </div>
        </div>
      );
    })}
  </nav>

  {/* Logout */}
  <div className="absolute bottom-3 lg:bottom-4 group">
    <button
      onClick={handleLogout}
      className="p-2.5 lg:p-3 text-gray-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
    >
      <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
    </button>
    <div className="absolute left-full ml-2 lg:ml-3 px-2 lg:px-3 py-1.5 lg:py-2 bg-white text-gray-800 text-xs lg:text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap top-1/2 transform -translate-y-1/2 scale-95 group-hover:scale-100 border border-gray-200">
      Logout
      <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
    </div>
  </div>
</div>

  );
};

export default SideBar;