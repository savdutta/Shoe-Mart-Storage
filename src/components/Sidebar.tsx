import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { NAVIGATION_ITEMS } from '../utils/constants';
import { PageType } from '../types';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 z-40 w-64 h-screen bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Retail Inventory</h1>
              <p className="text-xs text-gray-400">Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!item.placeholder) {
                  onPageChange(item.id as PageType);
                  onClose();
                }
              }}
              disabled={item.placeholder}
              className={`
                w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200
                ${currentPage === item.id 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : item.placeholder
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.placeholder && (
                <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-400">Store Manager</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white text-sm p-1 hover:bg-gray-700 rounded transition-colors"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;