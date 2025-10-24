
import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Calendar, FileText, Award, Briefcase, Image, ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addDoctor, updateDoctor } from '../../Components/dashboard/DoctorsTable';


export default function AddDoctorModal() {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = location.state?.editing;
    const editingDoctor = location.state?.doctor;
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        department: '',
        specialization: '',
        qualification: '',
        experience: '',
        licenseNumber: '',
        joiningDate: '',
        availableDays: [],
        consultationTime: '',
        consultationFee: '',
        biography: '',
        languages: '',
        awards: '',
        profileImage: '',
        active: true
    });

    const departments = [
        'Cardiology',
        'Pediatrics',
        'Dentistry',
        'Ophthalmology',
        'Neurology',
        'Orthopedics',
        'General Surgery',
        'Emergency Care',
        'Dermatology',
        'Psychiatry'
    ];

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        if (isEditing && editingDoctor) {
            setFormData({
                fullName: editingDoctor.name || '',
                email: editingDoctor.email || '',
                phone: editingDoctor.phone || '',
                dateOfBirth: editingDoctor.dateOfBirth || '',
                gender: editingDoctor.gender || '',
                department: editingDoctor.department || '',
                specialization: editingDoctor.specialization || '',
                qualification: editingDoctor.qualification || '',
                experience: editingDoctor.experience || '',
                licenseNumber: editingDoctor.licenseNumber || '',
                joiningDate: editingDoctor.joiningDate || '',
                availableDays: editingDoctor.availableDays || [],
                consultationTime: editingDoctor.consultationTime || '',
                consultationFee: editingDoctor.consultationFee || '',
                biography: editingDoctor.biography || '',
                languages: editingDoctor.languages || '',
                awards: editingDoctor.awards || '',
                profileImage: editingDoctor.profileImage || '',
                active: editingDoctor.active !== false
            });
        }
    }, [isEditing, editingDoctor]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleDayToggle = (day) => {
        const currentDays = formData.availableDays || [];
        if (currentDays.includes(day)) {
            setFormData({
                ...formData,
                availableDays: currentDays.filter(d => d !== day)
            });
        } else {
            setFormData({
                ...formData,
                availableDays: [...currentDays, day]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const doctorData = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                department: formData.department,
                specialization: formData.specialization,
                experience: formData.experience,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                qualification: formData.qualification,
                licenseNumber: formData.licenseNumber,
                joiningDate: formData.joiningDate,
                availableDays: formData.availableDays,
                consultationTime: formData.consultationTime,
                consultationFee: formData.consultationFee,
                biography: formData.biography,
                languages: formData.languages,
                awards: formData.awards,
                profileImage: formData.profileImage,
                active: formData.active
            };
            if (isEditing) {
                const res = await updateDoctor(editingDoctor.id, doctorData);
                if (!res.success) {
                    throw new Error(res.error);
                }
                toast.success('Doctor updated successfully!');
            } else {
                const res = await addDoctor(doctorData);
                if (!res.success) {
                    throw new Error(res.error);
                }
                toast.success('Doctor added successfully!');
            }
            navigate('/admin/doctors'); // Navigate to management page to see the list
        } catch (error) {
            console.error('Error saving doctor:', error);
            toast.error('Failed to save doctor: ' + error.message);
        }
    };

    const handleClose = () => {
        navigate('/admin/doctors');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleClose}
                        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Doctors
                    </button>

                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 rounded-2xl">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                                <User className="text-white" size={24} />
                            </div>
                            <h2 className="text-2xl font-semibold text-white">{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Personal Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <User className="text-purple-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Dr. John Smith"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="doctor@medcenter.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Award className="text-purple-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept, idx) => (
                                            <option key={idx} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        placeholder="e.g., Interventional Cardiology"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            placeholder="10"
                                            min="0"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number *</label>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        placeholder="MED-123456"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleChange}
                                        placeholder="MBBS, MD, etc."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Availability Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="text-purple-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Availability & Consultation</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {weekDays.map((day) => (
                                            <label key={day} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.availableDays.includes(day)}
                                                    onChange={() => handleDayToggle(day)}
                                                />
                                                <span>{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Time</label>
                                    <input
                                        type="text"
                                        name="consultationTime"
                                        value={formData.consultationTime}
                                        onChange={handleChange}
                                        placeholder="e.g., 10:00 AM - 2:00 PM"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (USD)</label>
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        placeholder="100"
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <FileText className="text-purple-600 mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Biography / About Doctor</label>
                                    <textarea
                                        name="biography"
                                        value={formData.biography}
                                        onChange={handleChange}
                                        placeholder="Brief description about the doctor, expertise, and approach to patient care..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                                        <input
                                            type="text"
                                            name="languages"
                                            value={formData.languages}
                                            onChange={handleChange}
                                            placeholder="English, Spanish, French"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                        />
                                    </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Awards</label>
                                    <input
                                        type="text"
                                        name="awards"
                                        value={formData.awards}
                                        onChange={handleChange}
                                        placeholder="e.g., Best Cardiologist 2022"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                                <div className="relative">
                                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="url"
                                        name="profileImage"
                                        value={formData.profileImage}
                                        onChange={handleChange}
                                        placeholder="https://example.com/doctor-image.jpg"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Doctor is active</span>
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                            >
                                {isEditing ? 'Update Doctor' : 'Add Doctor'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
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
