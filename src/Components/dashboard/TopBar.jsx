import React from 'react';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';

export default function TopBar({ onMenuClick, isMobile }) {
  return (
    <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-8">
      <div className="flex items-center justify-between">
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        )}
        
        <div className={`${isMobile ? 'flex-1 ml-4' : 'flex-1 max-w-md'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search patients, doctors, appointments..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm md:text-base"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6 ml-2 md:ml-6">
          <button className="relative p-1.5 rounded-full hover:bg-gray-100">
            <Bell size={22} className="text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
              3
            </span>
          </button>
          <div className="hidden md:flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1 pr-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900 text-sm">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <ChevronDown size={16} className="text-gray-600 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}