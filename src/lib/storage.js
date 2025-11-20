//const USERS_KEY = 'trava_users';
const SERVICES_KEY = 'trava_services';
const APPOINTMENTS_KEY = 'trava_appointments';
//const CURRENT_USER_KEY = 'trava_current_user';
const LS_USERS_KEY = "users";
const LS_CURRENT_KEY = "currentUser";

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

export function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]");
  return users.find(u => u.email === email) || null;
}

export function saveUser(user) {
  const users = JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]");
  
  // Assign an id if missing
  const newUser = {
    id: user.id || Date.now().toString(),
    ...user
  };

  users.push(newUser);
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
  return newUser; // Return the saved user
}

export function setCurrentUser(user) {
  localStorage.setItem(LS_CURRENT_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  const user = localStorage.getItem(LS_CURRENT_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearCurrentUser() {
  localStorage.removeItem(LS_CURRENT_KEY);
}

// User functions

export async function apiSignup(email, password) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Sign up failed");
  }

  return await res.json();
}

export async function apiLogin(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }

  return await res.json();
}

export async function apiGetCurrentUser() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  return data.user || data; // support both formats
}

export async function apiLogout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
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
export async function getAppointments() {
  try {
    const response = await fetch('/api/appointments');
    if (!response.ok) throw new Error('Failed to fetch appointments');

    const appointments = await response.json();
    writeLocal(APPOINTMENTS_KEY, appointments);
    return appointments;

  } catch (error) {
    console.error('Error fetching appointments from API, falling back to localStorage:', error);
    return readLocal(APPOINTMENTS_KEY, []);
  }
}

export async function getAppointmentsByUserId(userId) {
  const appointments = await getAppointments();
  return appointments.filter(a => a.userId === userId);
}

export async function saveAppointment(appointment) {
  if (typeof window === 'undefined') return;

  const existingAppointment = appointment.id ? await getAppointmentById(appointment.id) : null;

  try {
    const route = existingAppointment ? `/api/appointments/${appointment.id}`: `/api/appointments`;
    const method = existingAppointment ? 'PUT' : 'POST';

    const response = await fetch(route, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) throw new Error('Failed to save appointment');

    const savedAppointment = await response.json();

    // Update localStorage
    const appointments = readLocal(APPOINTMENTS_KEY, []);
    if (existingAppointment) {
      const index = appointments.findIndex(a => a.id === savedAppointment.id);
      if (index >= 0) appointments[index] = savedAppointment;
      else appointments.push(savedAppointment);
    } else {
      appointments.push(savedAppointment);
    }
    writeLocal(APPOINTMENTS_KEY, appointments);

    return savedAppointment;

  } catch (error) {
    console.error("API unavailable, falling back to localStorage:", error);

    // Fallback logic
    const appointments = readLocal(APPOINTMENTS_KEY, []);

    if (!existingAppointment) {
      const newAppointment = {
        ...appointment,
        id: Date.now().toString(),
      };
      appointments.push(newAppointment);
      writeLocal(APPOINTMENTS_KEY, appointments);
      return newAppointment;
    }

    const index = appointments.findIndex(a => a.id === appointment.id);
    if (index >= 0) appointments[index] = appointment;
    else appointments.push(appointment);

    writeLocal(APPOINTMENTS_KEY, appointments);
    return appointment;
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete appointment');

    const filtered = readLocal(APPOINTMENTS_KEY, [])
      .filter(a => a.id !== appointmentId);

    writeLocal(APPOINTMENTS_KEY, filtered);

  } catch (error) {
    console.error('API unavailable, deleting locally:', error);

    const filtered = readLocal(APPOINTMENTS_KEY, [])
      .filter(a => a.id !== appointmentId);

    writeLocal(APPOINTMENTS_KEY, filtered);
  }
}

export async function getAppointmentById(appointmentId) {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}`);
    if (!response.ok) throw new Error('Failed to fetch appointment');
    return await response.json();

  } catch (error) {
    console.error('API unavailable, searching localStorage:', error);
    const appointments = readLocal(APPOINTMENTS_KEY, []);
    return appointments.find(a => a.id === appointmentId);
  }
}
