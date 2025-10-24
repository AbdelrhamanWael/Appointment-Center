import React, { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, Activity } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../Firebaseconfig';

function formatPercent(num) {
  if (!isFinite(num)) return '0%';
  const v = Math.round(num * 100);
  return `${v > 0 ? '+' : ''}${v}%`;
}

export default function Analytics() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const unsubs = [];

    try {
      unsubs.push(onSnapshot(collection(db, 'patients'), (snap) => {
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
      unsubs.push(onSnapshot(collection(db, 'appointments'), (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
      unsubs.push(onSnapshot(collection(db, 'doctors'), (snap) => {
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }));
    } catch (e) {
      setError(e.message || 'Failed to load analytics');
      setLoading(false);
    }

    return () => unsubs.forEach(u => u && u());
  }, []);

  // Compute growth vs previous 30 days
  const { totalPatients, growthPct, apptLast7, apptPrev7 } = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    const pts = patients;
    const total = pts.length;

    const last30Start = new Date(now.getTime() - 30 * dayMs);
    const prev30Start = new Date(now.getTime() - 60 * dayMs);

    const addedLast30 = pts.filter(p => (p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0)) >= last30Start).length;
    const addedPrev30 = pts.filter(p => {
      const d = (p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0));
      return d >= prev30Start && d < last30Start;
    }).length;

    const growth = addedPrev30 === 0 ? (addedLast30 > 0 ? 1 : 0) : (addedLast30 - addedPrev30) / addedPrev30;

    const last7Start = new Date(now.getTime() - 7 * dayMs);
    const prev7Start = new Date(now.getTime() - 14 * dayMs);

    const appts = appointments;
    const last7 = appts.filter(a => (a.time?.toDate ? a.time.toDate() : new Date(a.time || a.createdAt || 0)) >= last7Start).length;
    const prev7 = appts.filter(a => {
      const d = (a.time?.toDate ? a.time.toDate() : new Date(a.time || a.createdAt || 0));
      return d >= prev7Start && d < last7Start;
    }).length;

    return { totalPatients: total, growthPct: growth, apptLast7: last7, apptPrev7: prev7 };
  }, [patients, appointments]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics & Reports</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '…' : totalPatients}</p>
            </div>
            <Users className="text-blue-600" size={40} />
          </div>
          <p className="text-gray-600 text-sm">{loading ? '—' : `${formatPercent(growthPct)} vs prev 30d`}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Appointments (last 7d)</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '…' : apptLast7}</p>
            </div>
            <Calendar className="text-green-600" size={40} />
          </div>
          <p className="text-gray-600 text-sm">{loading ? '—' : `${apptPrev7} prev 7d`}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Active Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '…' : doctors.length}</p>
            </div>
            <Activity className="text-purple-600" size={40} />
          </div>
          <p className="text-gray-600 text-sm">Live doctor count</p>
        </div>
      </div>

      {/* Simple trend visualization without external chart lib */}
     
    </div>
  );
}

function MiniBars({ patients }) {
  // Group patients by week number (ISO week starting Monday)
  const weeks = useMemo(() => {
    const map = new Map();
    const toIsoWeek = (d) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      // Thursday in current week decides the year
      date.setDate(date.getDate() + 4 - (date.getDay() || 7));
      const yearStart = new Date(date.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
      return `${date.getFullYear()}-W${weekNo}`;
    };

    patients.forEach(p => {
      const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || 0);
      if (!isFinite(d.getTime())) return;
      const key = toIsoWeek(d);
      map.set(key, (map.get(key) || 0) + 1);
    });

    // Take last 8 weeks
    const entries = Array.from(map.entries()).sort();
    const last8 = entries.slice(-8);
    return last8;
  }, [patients]);

  const max = Math.max(1, ...weeks.map(([, v]) => v));

  return (
    <div className="flex items-end space-x-2 h-40">
      {weeks.length === 0 ? (
        <p className="text-gray-500">No recent patient activity</p>
      ) : weeks.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="bg-blue-500 w-6 rounded-t"
            style={{ height: `${(value / max) * 100}%` }}
            title={`${label}: ${value}`}
          />
          <span className="text-xs text-gray-500 mt-1">{label.split('-W')[1]}</span>
        </div>
      ))}
    </div>
  );
}