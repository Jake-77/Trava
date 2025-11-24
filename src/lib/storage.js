// ---- AUTH API ----

export async function apiSignup(email, password) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).error || "Signup failed");
  return await res.json();
}

export async function apiLogin(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).error || "Login failed");
  return await res.json();
}

export async function apiGetCurrentUser() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  return await res.json();
}

export async function apiUpdateProfile(profileData) {
  const res = await fetch("/api/auth/profile", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return await res.json();
}

export async function apiLogout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

// ---- SERVICES ----

export async function getServices() {
  const res = await fetch("/api/services", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch services");
  return await res.json();
}

export async function getServiceById(id) {
  const res = await fetch(`/api/services/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Service not found");
  return await res.json();
}

export async function saveService(service) {
  const isUpdate = Boolean(service.id);

  const res = await fetch(
    isUpdate ? `/api/services/${service.id}` : `/api/services`,
    {
      method: isUpdate ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    }
  );

  if (!res.ok) throw new Error("Failed to save service");
  return await res.json();
}

export async function deleteService(id) {
  const res = await fetch(`/api/services/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete service");
}

export async function getAppointments() {
  const res = await fetch("/api/appointments", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return await res.json();
}

export async function getAppointmentById(id) {
  const res = await fetch(`/api/appointments/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Appointment not found");
  return await res.json();
}

export async function saveAppointment(appointment) {
  const isUpdate = Boolean(appointment.id);

  const res = await fetch(
    isUpdate ? `/api/appointments/${appointment.id}` : `/api/appointments`,
    {
      method: isUpdate ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    }
  );

  if (!res.ok) throw new Error("Failed to save appointment");
  return await res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete appointment");
}
