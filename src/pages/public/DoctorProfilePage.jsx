import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Award, Briefcase, FileText, Clock, DollarSign, Globe, ArrowLeft } from 'lucide-react';
import { getDoctorById } from '../../Components/dashboard/DoctorsTable';

function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await getDoctorById(id);
        if (res.success) {
          setDoctor(res.data);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading doctor profile...</p>
        </div>
      </section>
    );
  }

  if (error || !doctor) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">{error || 'Doctor not found'}</p>
          <Link to="/doctors" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Doctors
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/doctors"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Doctors
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-16 w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <User size={64} className="text-white/80" />
              )}
            </div>
          </div>
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
            <p className="text-xl text-blue-600 mb-1">{doctor.specialization}</p>
            <p className="text-gray-600">{doctor.department}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">{doctor.dateOfBirth || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{doctor.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{doctor.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Globe size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-gray-900">{doctor.gender || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Award size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Qualification</p>
                <p className="text-gray-900">{doctor.qualification || 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <Briefcase size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience</p>
                  <p className="text-gray-900">{doctor.experience} years</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">License Number</p>
                <p className="text-gray-900">{doctor.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Joining Date</p>
                <p className="text-gray-900">{doctor.joiningDate || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Clock size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Availability & Consultation</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Days</p>
                <p className="text-gray-900">{doctor.availableDays?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Consultation Time</p>
                <p className="text-gray-900">{doctor.consultationTime || 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <DollarSign size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
                  <p className="text-gray-900">${doctor.consultationFee || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Doctor */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FileText size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">About Dr. {doctor.name}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Biography</p>
                <p className="text-gray-700">{doctor.biography || 'No biography available.'}</p>
              </div>
              <div className="flex items-center">
                <Globe size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Languages</p>
                  <p className="text-gray-900">{doctor.languages || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Awards</p>
                <p className="text-gray-900">{doctor.awards || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to={`/book-appointment?doctorId=${id}`}
            className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl text-center hover:bg-blue-700 transition-all font-semibold"
          >
            Book Appointment
          </Link>
          <Link
            to="/doctors"
            className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl text-center hover:bg-gray-50 transition-all font-semibold"
          >
            Back to Doctors
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DoctorProfilePage;
