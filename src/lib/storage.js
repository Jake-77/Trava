const USERS_KEY = 'trava_users';
const SERVICES_KEY = 'trava_services';
const APPOINTMENTS_KEY = 'trava_appointments';
const CURRENT_USER_KEY = 'trava_current_user';

// User functions
export function getUsers() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email === email);
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Service functions
export function getServices() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SERVICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getServicesByUserId(userId) {
  const services = getServices();
  return services.filter(service => service.userId === userId);
}

export async function saveService(service) {
  if (typeof window === 'undefined') return;

  // Check if this is a new service (create) or existing (update)
  const existingService = service.id ? getServiceById(service.id) : null;

  // For new services, use Flask API
  if (!existingService) {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      });

      if (!response.ok) throw new Error('Failed to create service');
      const createdService = await response.json();

      // Save to localStorage so other parts of app can access it
      const services = getServices();
      services.push(createdService);
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));

      return createdService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  } else {
    // For updates, use localStorage
    const services = getServices();
    const existingIndex = services.findIndex(s => s.id === service.id);
    if (existingIndex >= 0) {
      services[existingIndex] = service;
    } else {
      services.push(service);
    }
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    return service;
  }
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

export function getAppointmentsByUserId(userId) {
  const appointments = getAppointments();
  return appointments.filter(appointment => appointment.userId === userId);
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

export function deleteAppointment(appointmentId) {
  const appointments = getAppointments();
  const filtered = appointments.filter(appointment => appointment.id !== appointmentId);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
}

export function getAppointmentById(appointmentId) {
  const appointments = getAppointments();
  return appointments.find(appointment => appointment.id === appointmentId);
}
