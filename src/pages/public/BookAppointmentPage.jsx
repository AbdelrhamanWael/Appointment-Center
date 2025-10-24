import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Added icons for new fields: Droplet, MapPin, PhoneCall, Stethoscope, BriefcaseMedical
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Heart, LogIn, Droplet, MapPin, PhoneCall, Stethoscope, BriefcaseMedical } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { getUserData, createAppointment } from '../../Firebaseconfig';
import { addPatient } from '../../Components/dashboard/PatientsTable';
import { getAllDoctors } from '../../Components/dashboard/DoctorsTable';

export default function BookAppointmentPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 1. UPDATED STATE: Includes all fields from the image
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        gender: '',
        bloodGroup: '',

        // Address Information
        address: '',
        city: '',
        state: '',
        zipCode: '',

        // Emergency Contact
        contactName: '',
        contactPhone: '',

        // Medical Information
        medicalHistory: '',
        allergies: '',

        // Appointment Details (mapped to old keys 'date', 'time', 'message' for backend compatibility)
        appointmentDate: '',
        appointmentTime: '',
        department: '',
        doctor: '',
        reasonForVisit: '',
        fee: '', // Add fee field
        paid: false, // Track payment status

        // Compatibility keys (used by existing createAppointment function)
        date: '',
        time: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);

    // Department fees constant
    const departmentFees = {
        'Cardiology': 150,
        'Pediatrics': 120,
        'Dentistry': 100,
        'Ophthalmology': 130,
        'Neurology': 160,
        'Orthopedics': 140,
        'General Surgery': 200,
        'Emergency Care': 250,
        'Dermatology': 110,
        'Psychiatry': 125
    };

    // Populate user-specific fields on load and fetch doctors
    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        setFormData(prev => ({
                            ...prev,
                            fullName: userData.fullName || '',
                            email: userData.email || '',
                            phone: userData.phone || ''
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }

            // Fetch doctors from Firebase
            try {
                const doctorsResult = await getAllDoctors();
                if (doctorsResult.success) {
                    // Filter to show only active doctors
                    const activeDoctors = doctorsResult.data.filter(doctor => doctor.active !== false);
                    setAvailableDoctors(activeDoctors);
                    // Extract unique departments from active doctors
                    const uniqueDepartments = [...new Set(activeDoctors.map(doctor => doctor.department).filter(Boolean))];
                    setAvailableDepartments(uniqueDepartments);
                } else {
                    console.error("Error fetching doctors:", doctorsResult.error);
                }
            } catch (error) {
                console.error("Error loading doctors:", error);
            }
        };

        loadData();
    }, [user]);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    // Handles changes for all input fields and updates compatibility keys
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => {
            const newFormData = {
                ...prevFormData,
                [name]: value
            };

            // Map new field names to old backend compatibility keys
            if (name === 'appointmentDate') {
                newFormData.date = value;
            } else if (name === 'appointmentTime') {
                newFormData.time = value;
            } else if (name === 'reasonForVisit') {
                newFormData.message = value;
            }

            // Handle department change
            if (name === 'department') {
                newFormData.doctor = ''; // Reset doctor selection
                // Set fee based on selected department
                if (value && departmentFees[value]) {
                    newFormData.fee = departmentFees[value].toFixed(2);
                }
            }

            return newFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        
        // 2. CONSOLIDATE DATA: Assemble all new and old data fields
        const appointmentData = {
            // Personal
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            
            // Address
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,

            // Emergency Contact
            contactName: formData.contactName,
            contactPhone: formData.contactPhone,

            // Medical
            medicalHistory: formData.medicalHistory,
            allergies: formData.allergies,

            // Appointment Details (using compatibility keys for backend functions)
            date: formData.date || formData.appointmentDate,
            time: formData.time || formData.appointmentTime,
            department: formData.department,
            doctor: formData.doctor,
            message: formData.message || formData.reasonForVisit,
            fee: formData.fee || 50, // Default fee if not provided
            paid: formData.paid || false
        };
        
        // Basic appointment field validation
        if (!appointmentData.date || !appointmentData.time || !appointmentData.department || !appointmentData.doctor) {
             toast.error('Please complete all required appointment details.');
             setLoading(false);
             return;
        }

        const result = await createAppointment(appointmentData, user.uid);
        if (result.success) {
            const patientData = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.message || 'Appointment booking'
            };
            await addPatient(patientData);
            
            toast.success('Appointment booked successfully! Full intake form recorded.');
            
            // Reset form fields that aren't pre-filled user data
            setFormData(prev => ({
                // Reset fields (keeping them as empty strings will allow useEffect to repopulate on next load if needed)
        fullName: '', dateOfBirth: '', email: '', phone: '', gender: '', bloodGroup: '',
        address: '', city: '', state: '', zipCode: '',
        contactName: '', contactPhone: '',
        medicalHistory: '', allergies: '',
        appointmentDate: '', appointmentTime: '', reasonForVisit: '',
        department: '', doctor: '', message: '', date: '', time: '',
        fee: '', paid: false
            }));
        } else {
            toast.error('Failed to book appointment. Please try again.');
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                        <LogIn className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
                    <p className="text-gray-600 mb-8">You need to be logged in to book an appointment.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        <LogIn className="mr-2" size={20} />
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <Calendar size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Patient Intake & Appointment</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Schedule your visit and complete your medical details prior to your arrival.
                    </p>
                </div>
            </section>

            {/* Appointment Form Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <Heart className="mr-3" size={28} />
                                Intake Form Details
                            </h2>
                            <p className="text-blue-100 mt-2">Please fill in your information for your record and appointment.</p>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            
                            {/* 3. JSX SECTION: Personal Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <User className="mr-2 text-blue-600" size={20} /> Personal Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Full Name - **ENABLED FOR EDIT** */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                        </div>
                                    </div>
                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                        </div>
                                    </div>
                                    {/* Email - **ENABLED FOR EDIT** */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                        </div>
                                    </div>
                                    {/* Phone - **ENABLED FOR EDIT** */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                        </div>
                                    </div>
                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none" required>
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer Not To Say">Prefer Not To Say</option>
                                        </select>
                                    </div>
                                    {/* Blood Group */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group *</label>
                                        <div className="relative">
                                            <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none" required>
                                                <option value="" disabled>Select Blood Group</option>
                                                {bloodGroups.map((group, idx) => (
                                                    <option key={idx} value={group}>{group}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. JSX SECTION: Address Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <MapPin className="mr-2 text-blue-600" size={20} /> Address Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address, Apt/Suite" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                                    </div>
                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                                    </div>
                                    {/* ZIP Code */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="ZIP Code" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. JSX SECTION: Emergency Contact */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <PhoneCall className="mr-2 text-blue-600" size={20} /> Emergency Contact
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Contact Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Emergency Contact Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                    </div>
                                    {/* Contact Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone *</label>
                                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="Contact Phone Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                    </div>
                                </div>
                            </div>

                            {/* 3. JSX SECTION: Medical Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <Stethoscope className="mr-2 text-blue-600" size={20} /> Medical Information
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Medical History */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                                        <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows="3" placeholder="List any chronic conditions, past surgeries, or significant illnesses." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"></textarea>
                                    </div>
                                    {/* Allergies */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="3" placeholder="List any known allergies (medications, food, environmental)." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 3. JSX SECTION: Appointment Details (using fields from the image) */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                                    <BriefcaseMedical className="mr-2 text-blue-600" size={20} /> Appointment Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Appointment Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required />
                                        </div>
                                    </div>

                                    {/* Appointment Time */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time *</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none" required>
                                                <option value="">Select time slot</option>
                                                {timeSlots.map((slot, idx) => (
                                                    <option key={idx} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Department */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                                        <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required>
                                            <option value="">Select department</option>
                                            {availableDepartments.map((dept, idx) => (
                                                <option key={idx} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Doctor */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Doctor *</label>
                                        <select name="doctor" value={formData.doctor} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" required disabled={!formData.department}>
                                            <option value="">
                                                {formData.department ? 'Select doctor' : 'Select department first'}
                                            </option>
                                            {formData.department && availableDoctors.filter(doctor => doctor.department === formData.department).map((doctor, idx) => (
                                                <option key={idx} value={doctor.name}>{doctor.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Reason for Visit */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit *</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                                            <textarea name="reasonForVisit" value={formData.reasonForVisit} onChange={handleChange} placeholder="Please describe your symptoms or reason for visit..." rows="4" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none" required></textarea>
                                        </div>
                                    </div>

                                    {/* Fee */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input 
                                                type="text"
                                                name="fee"
                                                value={formData.fee || 'Select department'}
                                                readOnly
                                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                            />
                                            {formData.department && (
                                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                                    {formData.department} Fee
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                                        <div className="flex items-center h-[52px] px-4 border border-gray-300 rounded-lg bg-gray-50">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${formData.paid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <span className="text-sm font-medium">
                                                    {formData.paid ? 'Paid' : 'Pending Payment'}
                                                </span>
                                            </div>
                                            {!formData.paid && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, paid: true }))}
                                                    className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Mark as Paid
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Important Notice */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Important Information:</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Please arrive 15 minutes before your appointment time</li>
                                    <li>• Bring your insurance card and photo ID</li>
                                    <li>• You will receive a confirmation email within 24 hours</li>
                                    <li>• For emergency cases, please call 911 or visit the ER</li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? 'Booking...' : 'Book Appointment'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        // Reset fields (keeping them as empty strings will allow useEffect to repopulate on next load if needed)
                                        fullName: '', dateOfBirth: '', email: '', phone: '', gender: '', bloodGroup: '',
                                        address: '', city: '', state: '', zipCode: '',
                                        contactName: '', contactPhone: '',
                                        medicalHistory: '', allergies: '',
                                        appointmentDate: '', appointmentTime: '', reasonForVisit: '',
                                        department: '', doctor: '', message: '', date: '', time: '' 
                                    })}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Contact Info (Remains the same) */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                <Phone className="text-blue-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600">+1 (555) 123-4567</p>
                            <p className="text-sm text-gray-500 mt-1">Mon-Fri: 8AM-8PM</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                                <Mail className="text-green-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600">appointments@medcenter.com</p>
                            <p className="text-sm text-gray-500 mt-1">24/7 Support</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                                <Calendar className="text-purple-600" size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Walk-In</h3>
                            <p className="text-gray-600">Available Daily</p>
                            <p className="text-sm text-gray-500 mt-1">8AM - 10PM</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}