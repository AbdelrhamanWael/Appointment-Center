import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Trash2, Eye, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

// ✅ Add patient
export const addPatient = async (patientData) => {
  try {
    if (!patientData.name || !patientData.email || !patientData.phone) {
      throw new Error('Missing required fields');
    }
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      age: parseInt(patientData.age, 10) || 0,
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding patient:', error);
    return { success: false, error: error.message };
  }
};

// ✅ Get single patient
export const getPatientById = async (patientId) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'No such patient!' };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { success: false, error: error.message };
  }
};

// ✅ Update patient
export const updatePatient = async (patientId, patientData) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    await updateDoc(docRef, {
      ...patientData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating patient:', error);
    return { success: false, error: error.message };
  }
};

// ✅ Delete patient
export const deletePatient = async (patientId) => {
  try {
    await deleteDoc(doc(db, 'patients', patientId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting patient:', error);
    return { success: false, error: error.message };
  }
};

// Fetch doctors data
const fetchDoctors = async () => {
  try {
    const q = query(collection(db, 'doctors'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// ✅ Desktop Table Row
const TableRow = ({ patient, onInfo, onEdit, onDelete, doctors }) => {
  const created = patient.createdAt?.toDate
    ? patient.createdAt.toDate()
    : patient.createdAt
    ? new Date(patient.createdAt)
    : null;

  const assignedDoctor = patient.doctorId 
    ? doctors.find(d => d.id === patient.doctorId)?.name || 'Unassigned'
    : 'Unassigned';

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
        {patient.name || '—'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{patient.age ?? '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap">{patient.phone || '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap">{assignedDoctor}</td>
      <td className="px-4 py-3 whitespace-nowrap">{created ? created.toLocaleDateString() : '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <button onClick={() => onInfo(patient)} className="btn-icon text-blue-600" title="View">
            <Eye size={18} />
          </button>
          <button onClick={() => onEdit(patient)} className="btn-icon text-yellow-600" title="Edit">
            <Edit size={18} />
          </button>
          <button onClick={() => onDelete(patient.id)} className="btn-icon text-red-600" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ✅ Mobile Table Row
const MobileTableRow = ({ patient, onInfo, onEdit, onDelete, doctors }) => {
  const created = patient.createdAt?.toDate
    ? patient.createdAt.toDate()
    : patient.createdAt
    ? new Date(patient.createdAt)
    : null;

  const assignedDoctor = patient.doctorId 
    ? doctors.find(d => d.id === patient.doctorId)?.name || 'Unassigned'
    : 'Unassigned';

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-900 text-base">{patient.name || '—'}</div>
        <div className="flex space-x-2">
          <button onClick={() => onInfo(patient)} className="btn-icon text-blue-600">
            <Eye size={18} />
          </button>
          <button onClick={() => onEdit(patient)} className="btn-icon text-yellow-600">
            <Edit size={18} />
          </button>
          <button onClick={() => onDelete(patient.id)} className="btn-icon text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>Age: {patient.age ?? '—'}</div>
        <div>Phone: {patient.phone || '—'}</div>
        <div>Doctor: {assignedDoctor}</div>
        <div>Created: {created ? created.toLocaleDateString() : '—'}</div>
        <div className="col-span-2 truncate">Email: {patient.email || '—'}</div>
      </div>
    </div>
  );
};

// ✅ Main Component
export default function PatientsTable() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    
    // Fetch doctors data
    const loadDoctors = async () => {
      try {
        const doctorsData = await fetchDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    
    loadDoctors();
    
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const qRef = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPatients(rows);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleInfo = (patient) => {
    setSelectedPatient(patient);
    setShowInfoModal(true);
  };

  const handleEdit = (patient) => {
    navigate('/dashboard/add-patient', { state: { editing: true, patient } });
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const result = await deletePatient(patientId);
      if (result.success) toast.success('Patient deleted successfully!');
      else toast.error('Error deleting patient: ' + result.error);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? patients.filter((p) =>
          [p.name, p.email, p.phone].some((v) =>
            String(v || '').toLowerCase().includes(q)
          )
        )
      : patients;
  }, [patients, search]);

  if (loading)
    return <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">Loading patients...</div>;

  if (error)
    return <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">Failed to load patients: {error}</div>;

  return (
    <div className="px-2 sm:px-4">
      {/* 🔍 Search */}
      <div className="mb-4">
        <div className="relative w-full max-w-md mx-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="pl-9 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* 📋 Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Age', 'Phone', 'Doctor', 'Created', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length ? (
                filtered.map((p) => (
                  <TableRow 
                    key={p.id} 
                    patient={p} 
                    doctors={doctors}
                    onInfo={handleInfo} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-4">No patients found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-gray-200">
            {filtered.length ? (
              filtered.map((p) => (
                <MobileTableRow key={p.id} patient={p} onInfo={handleInfo} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No patients found</div>
            )}
          </div>
        </div>
      </div>

      {/* ℹ️ Info Modal */}
      {showInfoModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Patient Details</h3>
              <button onClick={() => setShowInfoModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm md:text-base">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><strong>Name:</strong> {selectedPatient.name || 'N/A'}</div>
                <div><strong>Age:</strong> {selectedPatient.age || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedPatient.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedPatient.phone || 'N/A'}</div>
                <div><strong>Gender:</strong> {selectedPatient.gender || 'N/A'}</div>
                <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'N/A'}</div>
                <div><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth || 'N/A'}</div>
                <div><strong>Address:</strong> {selectedPatient.address || 'N/A'}</div>
                <div><strong>Emergency Contact:</strong> {selectedPatient.emergencyContact || 'N/A'}</div>
                <div><strong>Emergency Phone:</strong> {selectedPatient.emergencyPhone || 'N/A'}</div>
                <div><strong>Reason for Visit:</strong> {selectedPatient.reason || 'N/A'}</div>
              </div>
              <div>
                <strong>Medical History:</strong>
                <p className="mt-1 text-gray-700">{selectedPatient.medicalHistory || 'N/A'}</p>
              </div>
              <div>
                <strong>Allergies:</strong>
                <p className="mt-1 text-gray-700">{selectedPatient.allergies || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


