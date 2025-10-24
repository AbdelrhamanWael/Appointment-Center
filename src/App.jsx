import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import DoctorsPage from './pages/public/DoctorsPage';
import DoctorProfilePage from './pages/public/DoctorProfilePage';
import ContactPage from './pages/public/ContactPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/dashboard/PatientsPage';
import DoctorsManagementPage from './pages/dashboard/DoctorsManagementPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import BookAppointmentPage from './pages/public/BookAppointmentPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AddPatientModal from './pages/dashboard/AddPatientModal';
import AddDoctorModal from './pages/dashboard/AddDoctorModal';


function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Authentication Routes (should be BEFORE other routes) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Public Routes with Header and Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
        </Route>

        {/* Dashboard Routes with Sidebar and TopBar */}
        <Route path="/admin" element={<DashboardLayout />}>
        
          <Route index element={<DashboardPage />} />
          <Route path="patients">
            <Route index element={<PatientsPage />} />
            <Route path="add" element={<AddPatientModal />} />
          </Route>
          <Route path="doctors" element={<DoctorsManagementPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          
        </Route>
        <Route path="/dashboard/add-patient" element={<AddPatientModal />} />
        <Route path="/dashboard/add-doctor" element={<AddDoctorModal />} />

        {/* Fallback Route for 404 */}
        <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;