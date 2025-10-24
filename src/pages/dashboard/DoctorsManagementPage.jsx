import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorsTable from '../../Components/dashboard/DoctorsTable';

export default function DoctorsManagementPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
        <button
          onClick={() => navigate('/dashboard/add-doctor')}
         className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Add Doctor
        </button>
      </div>
      <DoctorsTable />
    </div>
  );
}
