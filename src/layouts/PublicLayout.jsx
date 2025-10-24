import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Components/public/Header';
import Footer from '../Components/public/Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}