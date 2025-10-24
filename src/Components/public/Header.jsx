
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { signOutUser } from '../../Firebaseconfig';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      navigate('/');
    } else {
      console.error('Sign out failed');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">MedCenter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-gray-700 hover:text-blue-600 font-medium ${
                  location.pathname === item.path ? 'text-blue-600' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                <User size={18} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                Login
              </Link>
            )}
            <Link to="/book-appointment" >
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Book Appointment
              </button>
            </Link>
            
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left text-gray-700 hover:text-blue-600 font-medium"
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center justify-center space-x-2 border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                >
                  <User size={18} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 text-center font-medium"
                >
                  Login
                </Link>
              )}
              
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}