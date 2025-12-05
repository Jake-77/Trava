/**
 * App - Main Application Router
 *
 * Sets up all routes for the application using React Router.
 * Handles navigation between:
 * - Dashboard and settings pages (authenticated)
 * - Services management (list, create, edit, detail)
 * - Appointments management (list, create, edit, detail)
 * - Public pages (booking and payment pages for customers)
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './globals.css';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import NewServicePage from './pages/NewServicePage';
import EditServicePage from './pages/EditServicePage';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import EditAppointmentPage from './pages/EditAppointmentPage';
import BookServicePage from './pages/BookServicePage';
import PayAppointmentPage from './pages/PayAppointmentPage';
import SettingsPage from './pages/updateProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/new" element={<NewServicePage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/services/:id/edit" element={<EditServicePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/appointments/new" element={<NewAppointmentPage />} />
        <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="/appointments/:id/edit" element={<EditAppointmentPage />} />
        <Route path="/book/:serviceId" element={<BookServicePage />} />
        <Route path="/pay/:id" element={<PayAppointmentPage />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
