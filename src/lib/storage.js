// Basic storage utilities for services and appointments

const SERVICES_KEY = 'trava_services';
const APPOINTMENTS_KEY = 'trava_appointments';

// Service functions
export function getServices() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SERVICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveService(service) {
  const services = getServices();
  const existingIndex = services.findIndex(s => s.id === service.id);
  if (existingIndex >= 0) {
    services[existingIndex] = service;
  } else {
    services.push(service);
  }
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

export function deleteService(serviceId) {
  const services = getServices();
  const filtered = services.filter(service => service.id !== serviceId);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(filtered));
}

export function getServiceById(serviceId) {
  const services = getServices();
  return services.find(service => service.id === serviceId);
}

// Appointment functions
export function getAppointments() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAppointment(appointment) {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex(a => a.id === appointment.id);
  if (existingIndex >= 0) {
    appointments[existingIndex] = appointment;
  } else {
    appointments.push(appointment);
  }
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

export function getAppointmentById(appointmentId) {
  const appointments = getAppointments();
  return appointments.find(appointment => appointment.id === appointmentId);
}
