import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllDoctors } from '../../Components/dashboard/DoctorsTable';

// Helper function to get initials from name
const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.split(' ');
    const first = parts[1]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  
};

// Helper function to get consistent color based on name
const getColorFromName = (name) => {
  const colors = ['bg-indigo-600', 'bg-cyan-600', 'bg-violet-600', 
                 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600'];
  const index = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;
  return colors[index];
};

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await getAllDoctors();
      if (res.success) {
        setDoctors(res.data);
      }
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expert Doctors</h2>
          <p className="text-gray-600">Meet our experienced medical professionals</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {doctors.length > 0 ? doctors.map((doctor) => {
            const initials = getInitials(doctor.name);
            const bgColor = getColorFromName(doctor.name);
            
            return (
              <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`${bgColor} h-64 flex items-center justify-center`}>
                  <span className="text-white text-6xl font-bold">{initials}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{doctor.name}</h3>
                  <p className="text-blue-600 mb-4">{doctor.specialization}</p>
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="w-full block bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          }) : (
            <p className="text-gray-600 text-center col-span-3">No doctors available at the moment.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default DoctorsPage;