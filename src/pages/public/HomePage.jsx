import React, { useState, useEffect } from 'react'
import { Menu, X, Bell, Search, ChevronDown, Calendar, Users, Activity, FileText, Settings, Home, User, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Plus, Edit, Trash2, Heart, Baby, Eye, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebaseconfig';

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return 'DR';
  const parts = name.split(' ');
  const first = parts[0]?.[0] || '';
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

function HomePage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Doctors'));
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
    };
    
    fetchDoctors();
  }, []);

  return (
   <>
   
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Health, Our Priority
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Providing exceptional healthcare services with compassionate care and cutting-edge medical technology.
                </p>
                <Link to="/book-appointment" >
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 shadow-lg">
                  Book Appointment
                </button>
                </Link>
              </div>
              <div className="bg-blue-700 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  
                  <img src="../src/assets/images/photo-1519494026892-80bbd2d6fd0d.jpeg" alt="" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <img src="../src/assets/images/photo-1631217868264-e5b90bb7e133.jpeg" alt="" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Medical Center</h2>
                <p className="text-gray-600 mb-4">
                  With over 25 years of excellence in healthcare, our medical center has been serving the community with state-of-the-art facilities and experienced medical professionals.
                </p>
                <p className="text-gray-600 mb-4">
                  We offer comprehensive healthcare services ranging from primary care to specialized treatments, ensuring every patient receives personalized attention and the highest quality of care.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    24/7 Emergency Services
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Expert Medical Staff
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Modern Equipment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-gray-600">Comprehensive healthcare services for all your needs</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { icon: Heart, name: 'Cardiology', desc: 'Heart care and treatment' },
                { icon: Baby, name: 'Pediatrics', desc: 'Child healthcare' },
                { icon: User, name: 'Dentistry', desc: 'Oral health services' },
                { icon: Eye, name: 'Ophthalmology', desc: 'Eye care specialists' },
                { icon: Brain, name: 'Neurology', desc: 'Brain and nerve care' },
                { icon: Activity, name: 'Orthopedics', desc: 'Bone and joint care' },
                { icon: Activity, name: 'General Surgery', desc: 'Surgical procedures' },
                { icon: Heart, name: 'Emergency Care', desc: '24/7 urgent care' },
              ].map((service, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <service.icon className="text-blue-600 mb-4" size={40} />
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expert Doctors</h2>
              <p className="text-gray-600">Meet our experienced medical professionals</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {doctors.slice(0, 3).map((doctor) => {
                const initials = getInitials(doctor.name);
                const bgColor = getColorFromName(doctor.name);
                
                return (
                  <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`${bgColor} h-48 flex items-center justify-center`}>
                      <span className="text-white text-5xl font-bold">{initials}</span>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{doctor.name}</h3>
                      <p className="text-blue-600 mb-4">{doctor.specialization || 'Doctor'}</p>
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="inline-block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {doctors.length > 3 && (
              <div className="text-center mt-8">
                <Link
                  to="/doctors"
                  className="inline-block px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  View All Doctors
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">Get in touch with our team</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="font-semibold text-xl mb-6">Send us a message</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    ></textarea>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                    Send Message
                  </button>
                </div>
              </div>

              {/* Contact Info & Map */}
              <div>
                <div className="bg-white p-8 rounded-lg shadow-sm mb-6">
                  <h3 className="font-semibold text-xl mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="text-blue-600 mr-3 mt-1" size={20} />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-gray-600">123 Medical Plaza, Health City, HC 12345</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="text-blue-600 mr-3 mt-1" size={20} />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="text-blue-600 mr-3 mt-1" size={20} />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">info@medcenter.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-200 h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968459391!3d40.75889597932781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1697123456789!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Medical Center Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
   </>
  )
}

export default HomePage