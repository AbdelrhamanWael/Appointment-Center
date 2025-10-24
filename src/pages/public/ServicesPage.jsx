import React from 'react'
import { Menu, X, Bell, Search, ChevronDown, Calendar, Users, Activity, FileText, Settings, Home, User, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Plus, Edit, Trash2, Heart, Baby, Eye, Brain } from 'lucide-react';

function ServicesPage() {
  return (
      
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
        
        
      
  );
}

export default ServicesPage