import React from 'react';
import { Plus } from 'lucide-react';

export default function ServicesManagementPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
        <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Add Service
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Services management content will be displayed here</p>
      </div>
    </div>
  );
}