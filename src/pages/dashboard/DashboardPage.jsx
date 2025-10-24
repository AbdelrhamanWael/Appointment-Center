import React, { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, Activity, TrendingUp, DollarSign, Stethoscope } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db, getUserRole } from '../../Firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ 
    patients: 0, 
    appointments: 0, 
    doctors: 0,
    activeDoctors: 0,
    revenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

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
  }, [user, role]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    // Streams for doctors, patients, appointments, and revenue
    setLoading(true);
    setError('');

    const unsubs = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Doctors count and active doctors
      unsubs.push(
        onSnapshot(collection(db, 'doctors'), (snap) => {
          console.log('Total doctors in system:', snap.size);
          
          const activeDocs = [];
          const inactiveDocs = [];
          
          snap.forEach(doc => {
            const data = doc.data();
            console.log('Doctor data:', { id: doc.id, status: data.status, lastActive: data.lastActive });
            
            // Consider a doctor active if they have status 'active' or 'approved'
            // We'll make lastActive check optional for now to see all doctors
            const isActiveStatus = data.status === 'active' || data.status === 'approved';
            const hasRecentActivity = data.lastActive && data.lastActive.toDate() >= thirtyDaysAgo;
            
            // Count as active if status is active/approved, regardless of lastActive for now
            if (isActiveStatus) {
              activeDocs.push(doc);
            } else {
              inactiveDocs.push(doc);
            }
          });
          
          console.log(`Active doctors: ${activeDocs.length}, Inactive: ${inactiveDocs.length}`);
          
          setCounts(c => ({
            ...c,
            doctors: snap.size,
            activeDoctors: activeDocs.length // Count all with active status for now
          }));
        }, (error) => {
          console.error('Error fetching doctors:', error);
          setError('Failed to load doctors data');
          setLoading(false);
        })
      );

      // Patients count
      unsubs.push(
        onSnapshot(collection(db, 'patients'), (snap) => {
          setCounts(c => ({ ...c, patients: snap.size }));
        })
      );

      // Appointments and revenue
      const apptRef = collection(db, 'appointments');
      let qAppt = apptRef; // default: all
      if (role === 'doctor') qAppt = query(apptRef, where('doctorId', '==', user?.uid));
      if (role === 'patient') qAppt = query(apptRef, where('patientId', '==', user?.uid));

      unsubs.push(
        onSnapshot(qAppt, (snap) => {
          let totalRevenue = 0;
          let pendingPayments = 0;
          
          snap.forEach(doc => {
            const data = doc.data();
            if (data.paid && data.fee) {
              totalRevenue += data.fee;
            } else if (data.fee) {
              pendingPayments += data.fee;
            }
          });

          setCounts(c => ({ 
            ...c, 
            appointments: snap.size,
            revenue: totalRevenue,
            pendingPayments: pendingPayments
          }));
          setLoading(false);
        }, (e) => {
          setError(e.message);
          setLoading(false);
        })
      );
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
      setLoading(false);
    }

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [user, role]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        {user?.displayName && (
          <p className="text-sm text-gray-600">
            Welcome back, <span className="font-medium text-gray-900">{user.displayName}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Patients */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Total Patients</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {loading ? '…' : counts.patients.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {counts.patients === 1 ? '1 patient' : `${counts.patients} patients`} registered
          </p>
        </div>

        {/* Doctors */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Medical Team</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {loading ? '…' : counts.doctors.toLocaleString()}
                </p>
                {!loading && counts.activeDoctors > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                    {Math.round((counts.activeDoctors / counts.doctors) * 100)}% Active
                  </span>
                )}
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (counts.activeDoctors / Math.max(1, counts.doctors)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg ml-4">
              <Users className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {counts.activeDoctors === 0 ? 'No active doctors' : 
             `${counts.activeDoctors} active • ${counts.doctors - counts.activeDoctors} inactive`}
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Revenue</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {loading ? '…' : `$${counts.revenue.toLocaleString()}`}
                </p>
                {!loading && counts.pendingPayments > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    ${counts.pendingPayments.toLocaleString()} Pending
                  </span>
                )}
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (counts.revenue / Math.max(1, counts.revenue + counts.pendingPayments)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg ml-4">
              <DollarSign className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {counts.pendingPayments > 0 
              ? `${Math.round((counts.revenue / (counts.revenue + counts.pendingPayments)) * 100)}% Collected` 
              : 'All payments collected'}
          </p>
        </div>
        {/* Appointments */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Appointments</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {loading ? '…' : counts.appointments.toLocaleString()}
              </p>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg ml-4">
              <Calendar className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {counts.appointments === 1 ? '1 appointment' : `${counts.appointments} appointments`} total
          </p>
        </div>

        
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to MedCenter Admin</h2>
        <p className="text-gray-600">Use the sidebar to navigate through different sections.</p>
      </div>
    </div>
  );
}