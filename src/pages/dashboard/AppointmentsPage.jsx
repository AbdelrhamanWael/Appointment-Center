import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Eye, X, Search } from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, getUserRole } from '../../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [users, setUsers] = useState({});
  const [patients, setPatients] = useState({});
  const [doctors, setDoctors] = useState({});

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    async function loadRole() {
      if (user?.uid) {
        const r = await getUserRole(user.uid);
        setRole(r);
      } else {
        setRole(null);
      }
    }
    loadRole();
  }, [user]);

  // Fetch users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const data = {};
      snap.forEach((d) => (data[d.id] = d.data()));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // Fetch patients
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'patients'), (snap) => {
      const data = {};
      snap.forEach((d) => (data[d.id] = d.data()));
      setPatients(data);
    });
    return () => unsub();
  }, []);

  // Fetch doctors
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'Doctors'), (snap) => {
      const data = {};
      snap.forEach((d) => (data[d.id] = d.data()));
      setDoctors(data);
    });
    return () => unsub();
  }, []);

  // Fetch appointments
  useEffect(() => {
    setLoading(true);
    const ref = collection(db, 'appointments');
    let qRef = query(ref, orderBy('createdAt', 'desc'));
    if (role === 'doctor') qRef = query(ref, where('doctorId', '==', user?.uid));
    if (role === 'patient') qRef = query(ref, where('patientId', '==', user?.uid));

    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAppointments(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, role]);

  // Helpers
  const getPatientName = (id) =>
    patients[id]?.name || users[id]?.name || id || '—';
  const getDoctorName = (id) =>
    doctors[id]?.name || users[id]?.name || id || '—';

  const formatDate = (val) => {
    try {
      if (!val) return '—';
      if (val.toDate) return val.toDate().toLocaleString();
      const date = new Date(val);
      return isNaN(date) ? 'Invalid Date' : date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const handleInfo = (a) => {
    setSelectedAppointment(a);
    setShowInfoModal(true);
  };

  const handleEdit = (a) => {
    navigate('/dashboard/add-appointment', { state: { editing: true, appointment: a } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
        toast.success('Appointment deleted!');
      } catch (e) {
        toast.error(e.message);
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success('Status updated!');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) => {
      const patient = getPatientName(a.patientId);
      const doctor = getDoctorName(a.doctorId);
      const status = a.status || '';
      return [patient, doctor, status].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });
  }, [appointments, search, users, patients, doctors]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments..."
            className="pl-9 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Patient', 'Doctor', 'Date & Time', 'Status', 'Actions'].map(
                (head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  Loading appointments...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  No appointments found
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const status = a.status || 'pending';
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{getPatientName(a.patientId)}</td>
                    <td className="px-6 py-3">{getDoctorName(a.doctorId)}</td>
                    <td className="px-6 py-3">{formatDate(a.time)}</td>
                    <td className="px-6 py-3">
                      <select
                        value={status}
                        onChange={(e) =>
                          handleStatusUpdate(a.id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs rounded border-0 cursor-pointer ${
                          status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInfo(a)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center"
                        >
                          <Eye size={14} className="mr-1" /> Info
                        </button>
                        <button
                          onClick={() => handleEdit(a)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-4">
            Loading appointments...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No appointments found
          </p>
        ) : (
          filtered.map((a) => {
            const status = a.status || 'pending';
            return (
              <div
                key={a.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {getPatientName(a.patientId)}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Doctor:</strong> {getDoctorName(a.doctorId)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong> {formatDate(a.time)}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleInfo(a)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs flex items-center"
                  >
                    <Eye size={14} className="mr-1" /> Info
                  </button>
                  <button
                    onClick={() => handleEdit(a)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs flex items-center"
                  >
                    <Edit size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Appointment Details
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <p>
                <strong>Patient:</strong> {getPatientName(selectedAppointment.patientId)}
              </p>
              <p>
                <strong>Doctor:</strong> {getDoctorName(selectedAppointment.doctorId)}
              </p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {formatDate(selectedAppointment.time)}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    selectedAppointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : selectedAppointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedAppointment.status || 'pending'}
                </span>
              </p>
              {selectedAppointment.reason && (
                <p>
                  <strong>Reason:</strong> {selectedAppointment.reason}
                </p>
              )}
              {selectedAppointment.notes && (
                <p>
                  <strong>Notes:</strong> {selectedAppointment.notes}
                </p>
              )}
              <p className="text-gray-500">
                <strong>Created:</strong>{' '}
                {formatDate(selectedAppointment.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
