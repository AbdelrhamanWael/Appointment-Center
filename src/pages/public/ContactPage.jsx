import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { db } from '../../Firebaseconfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const contactData = {
        ...formData,
        createdAt: Timestamp.now()
      };

      if (user) {
        contactData.userId = user.uid;
      }

      await addDoc(collection(db, 'contacts'), contactData);
      setFeedback('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error adding document: ', error);
      setFeedback('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {feedback && (
                <p className={`text-center ${feedback.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback}
                </p>
              )}
            </form>
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
  )
}

export default ContactPage