const USERS_KEY = 'trava_users';
const SERVICES_KEY = 'trava_services';
const APPOINTMENTS_KEY = 'trava_appointments';
const CURRENT_USER_KEY = 'trava_current_user';

// Helper: safely read local storage
function readLocal(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

// Helper: write local storage
function writeLocal(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

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
export async function getServices() {
  try{
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error('Failed to fetch services');
    const services = await response.json();

    writeLocal(SERVICES_KEY, services);
    return services;
  } catch (error) {
    console.error('Error fetching services from API, falling back to localStorage:', error);
    return readLocal(SERVICES_KEY, []);
  }
}

export async function getServicesByUserId(userId) {

  //leaving for now 
  const services = await getServices();
  return services.filter(service => service.userId === userId);
}

export async function saveService(service) {
  if (typeof window === 'undefined') return;

  // Check if this is a new service (create) or existing (update)
  const existingService = service.id ? await getServiceById(service.id) : null;
  
  try{
    const route = existingService ? `/api/services/${service.id}` : '/api/services';
    const method = existingService ? 'PUT' : 'POST';

    const response = await fetch(route, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(service),
    });
    if (!response.ok) throw new Error('Failed to save service');
    const savedService = await response.json();

    // Update localStorage
    const services = readLocal(SERVICES_KEY, []);
    if (existingService) {
      const index = services.findIndex(s => s.id === savedService.id);
      if (index >= 0) {
        services[index] = savedService;
      } else {
        services.push(savedService);
      }
    } else {
      services.push(savedService);
    }
    writeLocal(SERVICES_KEY, services);

    return savedService;
  } catch (error) {
    console.error('Error saving service to API, falling back to localStorage:', error);
    const services = readLocal(SERVICES_KEY, []);
    // Fallback to localStorage for create/update
    if (!existingService) {
      // Create new service
      const createdService = {
        ...service,
        id: Date.now().toString() 
      };
      services.push(createdService);
      return createdService; 
    } else {
      // Update existing service
      const index = services.findIndex(s => s.id === service.id);
      if (index >= 0) {
        services[index] = service;
      } else {
        services.push(service);
      }
    }
    writeLocal(SERVICES_KEY, services);
    return service;              
  }
}

export async function deleteService(serviceId) {
  try{
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete service');
    const services = readLocal(SERVICES_KEY, []);
    const filtered = services.filter(service => service.id !== serviceId);
    writeLocal(SERVICES_KEY, filtered);
  } catch (error) {
    console.error('Error deleting service from API, falling back to localStorage:', error);
    const services = readLocal(SERVICES_KEY, []);
    const filtered = services.filter(service => service.id !== serviceId);
    writeLocal(SERVICES_KEY, filtered);
  }
}

export async function getServiceById(serviceId) {
  try {
    // Try to get the specific service from the API
    const response = await fetch(`/api/services/${serviceId}`);
    if (!response.ok) throw new Error('Service not found or API error');
    return await response.json();

  } catch (error) {

    console.error("API unavailable, searching local storage:", error);
    // Fallback: Read local storage manually
    const services = readLocal(SERVICES_KEY, []);
    return services.find(service => service.id === serviceId);
  }
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
