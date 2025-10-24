import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, User, Calendar, Heart } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: User, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
  ];

  return (
    <aside className="fixed md:static inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart size={20} />
          </div>
          <span className="ml-3 text-lg font-bold whitespace-nowrap">MedCenter Admin</span>
        </div>
      </div>
      <nav className="flex-1 py-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-600' : ''
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}