import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, FileText, Heart, Activity, ArrowLeft, UserCog } from 'lucide-react';
import { addPatient, updatePatient } from '../../Components/dashboard/PatientsTable';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../Firebaseconfig';

export default function AddPatientModal() {
    const navigate = useNavigate();
    const location = useLocation(); 
    const isEditing = location.state?.editing;
    const editingPatient = location.state?.patient;
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalHistory: '',
        allergies: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        doctorId: ''
    });
    
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const patientData = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                date: formData.appointmentDate,
                time: formData.appointmentTime,
                age: calculateAge(formData.dateOfBirth),
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                // Add additional fields
                address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
                emergencyContact: formData.emergencyContact,
                emergencyPhone: formData.emergencyPhone,
                medicalHistory: formData.medicalHistory,
                allergies: formData.allergies,
                reason: formData.reason,
                dateOfBirth: formData.dateOfBirth,
                doctorId: formData.doctorId
            };

            if (isEditing) {
                const result = await updatePatient(editingPatient.id, patientData);
                if (result.success) {
                    toast.success('Patient updated successfully!');
                    navigate('/admin/patients'); // Navigate back to patients list
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await addPatient(patientData);
                if (result.success) {
                    toast.success('Patient added successfully!');
                    navigate('/admin/patients'); // Navigate back to patients list
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.error('Failed to save patient: ' + error.message);
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Fetch doctors list
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const q = query(collection(db, 'doctors'));
                const querySnapshot = await getDocs(q);
                const doctorsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDoctors(doctorsList);
                setLoadingDoctors(false);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                toast.error('Failed to load doctors list');
                setLoadingDoctors(false);
            }
        };
        
        fetchDoctors();
    }, []);
    
    useEffect(() => {
        if (isEditing && editingPatient) {
            setFormData({
                fullName: editingPatient.name || '',
                email: editingPatient.email || '',
                phone: editingPatient.phone || '',
                dateOfBirth: editingPatient.dateOfBirth || '',
                gender: editingPatient.gender || '',
                bloodGroup: editingPatient.bloodGroup || '',
                address: editingPatient.address ? editingPatient.address.split(', ')[0] : '',
                city: editingPatient.address ? editingPatient.address.split(', ')[1] : '',
                state: editingPatient.address ? editingPatient.address.split(', ')[2].split(' ')[0] : '',
                zipCode: editingPatient.address ? editingPatient.address.split(', ')[2].split(' ')[1] : '',
                emergencyContact: editingPatient.emergencyContact || '',
                emergencyPhone: editingPatient.emergencyPhone || '',
                medicalHistory: editingPatient.medicalHistory || '',
                allergies: editingPatient.allergies || '',
                appointmentDate: editingPatient.date || '',
                appointmentTime: editingPatient.time || '',
                reason: editingPatient.reason || '',
                doctorId: editingPatient.doctorId || ''
            });
        }
    }, [isEditing, editingPatient]);

    const handleClose = () => {
        navigate('/admin/patients');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleClose}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Patients
                    </button>

                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-2xl">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                                <Heart className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl font-semibold text-white">{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Personal Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <User className="text-blue-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john.doe@example.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                            required
                                        >
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <MapPin className="text-blue-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Phone className="text-blue-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="text-blue-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                                    <textarea
                                        name="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                                        <input
                                            type="date"
                                            name="appointmentDate"
                                            value={formData.appointmentDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                                        <input
                                            type="time"
                                            name="appointmentTime"
                                            value={formData.appointmentTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 
                                         transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                            >
                                Add Patient
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-xl 
                                         hover:bg-gray-50 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
          
