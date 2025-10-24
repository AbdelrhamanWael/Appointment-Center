import React, { useState } from 'react';
import PatientsTable from '../../Components/dashboard/PatientsTable';
import Analytics from '../../components/dashboard/Analytics';
import { Plus } from 'lucide-react';
import AddPatientModal from '../dashboard/AddPatientModal';
import { useNavigate } from 'react-router-dom';

export default function PatientsPage() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleAddSuccess = () => {
    // Trigger refresh of patients table
    // You might need to pass this down to PatientsTable
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
        <button
          onClick={() => navigate('/dashboard/add-patient')}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus size={20} className="mr-2" />
          Add Patient
        </button>
      </div>
      <PatientsTable />
      <Analytics />
      
      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}