/**
 * Comprehensive CRUD operations test suite
 * Tests all major functionality: Services, Appointments, and Auth
 *
 * This test suite validates:
 * - Create, Read, Update, Delete operations for Services
 * - Create, Read, Update, Delete operations for Appointments
 * - Authentication operations (signup, login, logout, profile updates)
 * - Error handling for all operations
 */

import {
  // Auth
  apiSignup,
  apiLogin,
  apiGetCurrentUser,
  apiUpdateProfile,
  apiLogout,
  // Services
  getServices,
  getServiceById,
  saveService,
  deleteService,
  // Appointments
  getAppointments,
  getAppointmentById,
  saveAppointment,
  deleteAppointment,
} from '../lib/storage';

// Mock fetch globally to intercept all API calls
// This allows us to test the API functions without needing a running backend
global.fetch = jest.fn();

describe('CRUD Operations Test Suite', () => {
  // Clear all mocks before each test to ensure test isolation
  beforeEach(() => {
    fetch.mockClear();
  });

  /**
   * SERVICES CRUD OPERATIONS
   * Tests all Create, Read, Update, Delete operations for services
   * Services represent the offerings that users can book (e.g., "Car Detailing", "Window Cleaning")
   */
  describe('Services CRUD Operations', () => {
    // Mock service data used across multiple tests
    const mockService = {
      id: '123',
      userId: 'user1',
      title: 'Car Detailing',
      description: 'Full car wash and detail service',
      price: '$75',
    };

    /**
     * CREATE OPERATION
     * Tests that a new service can be created via POST request
     * Verifies the correct API endpoint, method, and payload are used
     */
    test('CREATE - can create a new service', async () => {
      const newService = {
        userId: 'user1',
        title: 'Window Cleaning',
        description: 'Professional window cleaning',
        price: '$50',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newService, id: '456' }),
      });

      const result = await saveService(newService);

      expect(fetch).toHaveBeenCalledWith('/api/services', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      expect(result.id).toBe('456');
      expect(result.title).toBe('Window Cleaning');
    });

    /**
     * READ OPERATION - Get All
     * Tests that all services for a user can be retrieved
     * Verifies the API returns an array of services
     */
    test('READ - can get all services', async () => {
      const mockServices = [mockService, { ...mockService, id: '789', title: 'Lawn Care' }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      });

      const result = await getServices();

      expect(fetch).toHaveBeenCalledWith('/api/services', { credentials: 'include' });
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Car Detailing');
    });

    /**
     * READ OPERATION - Get By ID
     * Tests that a specific service can be retrieved by its ID
     * Verifies the correct service data is returned
     */
    test('READ - can get service by ID', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockService,
      });

      const result = await getServiceById('123');

      expect(fetch).toHaveBeenCalledWith('/api/services/123', { credentials: 'include' });
      expect(result.id).toBe('123');
      expect(result.title).toBe('Car Detailing');
    });

    /**
     * UPDATE OPERATION
     * Tests that an existing service can be updated via PUT request
     * Verifies that changes to title, price, etc. are properly saved
     */
    test('UPDATE - can update an existing service', async () => {
      const updatedService = {
        ...mockService,
        title: 'Premium Car Detailing',
        price: '$100',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedService,
      });

      const result = await saveService(updatedService);

      expect(fetch).toHaveBeenCalledWith('/api/services/123', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedService),
      });
      expect(result.title).toBe('Premium Car Detailing');
      expect(result.price).toBe('$100');
    });

    /**
     * DELETE OPERATION
     * Tests that a service can be deleted via DELETE request
     * Verifies the correct endpoint and method are used
     */
    test('DELETE - can delete a service', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteService('123');

      expect(fetch).toHaveBeenCalledWith('/api/services/123', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    /**
     * ERROR HANDLING
     * Tests that appropriate errors are thrown when a service is not found
     * Ensures the application handles missing resources gracefully
     */
    test('handles service not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getServiceById('999')).rejects.toThrow('Service not found');
    });
  });

  /**
   * APPOINTMENTS CRUD OPERATIONS
   * Tests all Create, Read, Update, Delete operations for appointments
   * Appointments represent booked time slots for services with customer information
   */
  describe('Appointments CRUD Operations', () => {
    // Mock appointment data used across multiple tests
    const mockAppointment = {
      id: 'appt-123',
      userId: 'user1',
      serviceId: 'service-456',
      customerName: 'John Doe',
      customerPhone: '555-1234',
      customerEmail: 'john@example.com',
      date: '2024-12-25',
      time: '10:00',
      status: 'scheduled',
      paymentStatus: 'pending',
      notes: 'Test appointment',
    };

    /**
     * CREATE OPERATION
     * Tests that a new appointment can be created with customer details
     * Verifies all appointment fields (name, phone, email, date, time) are saved correctly
     */
    test('CREATE - can create a new appointment', async () => {
      const newAppointment = {
        userId: 'user1',
        serviceId: 'service-456',
        customerName: 'Jane Smith',
        customerPhone: '555-5678',
        customerEmail: 'jane@example.com',
        date: '2024-12-26',
        time: '14:00',
        status: 'scheduled',
        paymentStatus: 'pending',
        notes: '',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newAppointment, id: 'appt-789' }),
      });

      const result = await saveAppointment(newAppointment);

      expect(fetch).toHaveBeenCalledWith('/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
      expect(result.id).toBe('appt-789');
      expect(result.customerName).toBe('Jane Smith');
    });

    /**
     * READ OPERATION - Get All
     * Tests that all appointments for a user can be retrieved
     * Verifies the API returns an array of appointments
     */
    test('READ - can get all appointments', async () => {
      const mockAppointments = [
        mockAppointment,
        { ...mockAppointment, id: 'appt-456', customerName: 'Bob Johnson' },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointments,
      });

      const result = await getAppointments();

      expect(fetch).toHaveBeenCalledWith('/api/appointments', { credentials: 'include' });
      expect(result).toHaveLength(2);
      expect(result[0].customerName).toBe('John Doe');
    });

    /**
     * READ OPERATION - Get By ID
     * Tests that a specific appointment can be retrieved by its ID
     * Verifies appointment status and customer information are returned correctly
     */
    test('READ - can get appointment by ID', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointment,
      });

      const result = await getAppointmentById('appt-123');

      expect(fetch).toHaveBeenCalledWith('/api/appointments/appt-123', {
        credentials: 'include',
      });
      expect(result.id).toBe('appt-123');
      expect(result.customerName).toBe('John Doe');
      expect(result.status).toBe('scheduled');
    });

    /**
     * UPDATE OPERATION - Status and Payment
     * Tests that appointment status and payment information can be updated
     * Verifies status changes (scheduled -> completed) and payment status updates
     */
    test('UPDATE - can update an existing appointment', async () => {
      const updatedAppointment = {
        ...mockAppointment,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedAppointment,
      });

      const result = await saveAppointment(updatedAppointment);

      expect(fetch).toHaveBeenCalledWith('/api/appointments/appt-123', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAppointment),
      });
      expect(result.status).toBe('completed');
      expect(result.paymentStatus).toBe('paid');
    });

    /**
     * UPDATE OPERATION - Status Changes
     * Tests that appointment can be cancelled and payment status updated
     * Verifies status transitions (e.g., scheduled -> cancelled, pending -> refunded)
     */
    test('UPDATE - can update appointment status and payment', async () => {
      const appointmentUpdate = {
        ...mockAppointment,
        status: 'cancelled',
        paymentStatus: 'refunded',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => appointmentUpdate,
      });

      const result = await saveAppointment(appointmentUpdate);

      expect(result.status).toBe('cancelled');
      expect(result.paymentStatus).toBe('refunded');
    });

    /**
     * DELETE OPERATION
     * Tests that an appointment can be deleted via DELETE request
     * Verifies the correct endpoint and method are used
     */
    test('DELETE - can delete an appointment', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await deleteAppointment('appt-123');

      expect(fetch).toHaveBeenCalledWith('/api/appointments/appt-123', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    /**
     * ERROR HANDLING
     * Tests that appropriate errors are thrown when an appointment is not found
     * Ensures the application handles missing appointments gracefully
     */
    test('handles appointment not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getAppointmentById('appt-999')).rejects.toThrow('Appointment not found');
    });
  });

  /**
   * AUTHENTICATION OPERATIONS
   * Tests user authentication and profile management
   * Includes signup, login, logout, and profile updates
   */
  describe('Auth Operations', () => {
    // Mock user data used across auth tests
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
    };

    /**
     * SIGNUP OPERATION
     * Tests that a new user account can be created
     * Verifies email and password are sent correctly and user object is returned
     */
    test('SIGNUP - can create a new user account', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const result = await apiSignup('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(result.user.email).toBe('test@example.com');
    });

    /**
     * SIGNUP ERROR HANDLING
     * Tests that duplicate email addresses are rejected
     * Ensures users cannot create multiple accounts with the same email
     */
    test('SIGNUP - handles duplicate email error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      await expect(apiSignup('existing@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      );
    });

    /**
     * LOGIN OPERATION
     * Tests that users can login with valid email and password
     * Verifies credentials are sent correctly and user session is established
     */
    test('LOGIN - can login with valid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const result = await apiLogin('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(result.user.email).toBe('test@example.com');
    });

    /**
     * LOGIN ERROR HANDLING
     * Tests that invalid credentials are rejected
     * Ensures security by preventing unauthorized access
     */
    test('LOGIN - handles invalid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid email or password' }),
      });

      await expect(apiLogin('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    /**
     * GET CURRENT USER OPERATION
     * Tests that the currently logged-in user can be retrieved
     * Verifies user profile information including PayPal handle is returned
     */
    test('GET CURRENT USER - can get current logged in user', async () => {
      const userWithProfile = {
        ...mockUser,
        paypal_handle: 'myhandle',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: userWithProfile }),
      });

      const result = await apiGetCurrentUser();

      expect(fetch).toHaveBeenCalledWith('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.paypal_handle).toBe('myhandle');
    });

    /**
     * UPDATE PROFILE OPERATION - PayPal Handle
     * Tests that user profile information (e.g., PayPal handle) can be updated
     * Verifies profile changes are saved correctly
     */
    test('UPDATE PROFILE - can update user profile', async () => {
      const updatedUser = {
        ...mockUser,
        paypal_handle: 'newhandle',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: updatedUser }),
      });

      const result = await apiUpdateProfile({ paypal_handle: 'newhandle' });

      expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypal_handle: 'newhandle' }),
      });
      expect(result.user.paypal_handle).toBe('newhandle');
    });

    /**
     * UPDATE PROFILE OPERATION - Password
     * Tests that user password can be updated
     * Verifies password changes are sent securely
     */
    test('UPDATE PROFILE - can update password', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      await apiUpdateProfile({ password: 'newpassword123' });

      expect(fetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'newpassword123' }),
      });
    });

    /**
     * LOGOUT OPERATION
     * Tests that users can logout and end their session
     * Verifies the logout endpoint is called correctly
     */
    test('LOGOUT - can logout user', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await apiLogout();

      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });
  });

  /**
   * ERROR HANDLING
   * Tests that the application handles various error scenarios gracefully
   * Ensures proper error messages are thrown for network failures and API errors
   */
  describe('Error Handling', () => {
    /**
     * Network Error Handling
     * Tests that network failures (e.g., no internet connection) are handled
     */
    test('handles network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getServices()).rejects.toThrow('Network error');
    });

    /**
     * Save Service Error Handling
     * Tests that errors when saving services are properly handled
     */
    test('handles save service failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(saveService({ title: 'Test' })).rejects.toThrow('Failed to save service');
    });

    /**
     * Save Appointment Error Handling
     * Tests that errors when saving appointments are properly handled
     */
    test('handles save appointment failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(saveAppointment({ customerName: 'Test' })).rejects.toThrow(
        'Failed to save appointment'
      );
    });

    /**
     * Delete Service Error Handling
     * Tests that errors when deleting services are properly handled
     */
    test('handles delete service failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(deleteService('123')).rejects.toThrow('Failed to delete service');
    });

    /**
     * Delete Appointment Error Handling
     * Tests that errors when deleting appointments are properly handled
     */
    test('handles delete appointment failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(deleteAppointment('appt-123')).rejects.toThrow('Failed to delete appointment');
    });
  });
});
