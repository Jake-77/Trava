/**
 * Basic functionality tests for services and appointments
 */

import {
  saveService,
  deleteService,
  getServiceById,
  saveAppointment,
  getAppointmentById,
} from '../lib/storage';

// Helper functions to create test data
const createService = (overrides = {}) => ({
  id: '1',
  userId: 'user1',
  title: 'Car Detailing',
  description: 'Full car wash and detail',
  price: '$75',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const createAppointment = (overrides = {}) => ({
  id: 'appt-1',
  userId: 'user1',
  serviceId: 'service1',
  customerName: 'John Doe',
  customerPhone: '555-1234',
  customerEmail: 'john@example.com',
  date: '2024-12-25',
  time: '10:00',
  status: 'scheduled',
  paymentStatus: 'pending',
  notes: '',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Shared setup
beforeEach(() => {
  localStorage.clear();
});

describe('Service Management', () => {
  test('can add a service', () => {
    const service = createService({ id: '1', title: 'Car Detailing', price: '$75' });

    saveService(service);
    const saved = getServiceById('1');

    expect(saved).toEqual(service);
    expect(saved.title).toBe('Car Detailing');
    expect(saved.price).toBe('$75');
  });

  test('can remove a service', () => {
    const service = createService({ id: '2', title: 'Window Cleaning', price: '$50' });

    saveService(service);
    expect(getServiceById('2')).toEqual(service);

    deleteService('2');
    expect(getServiceById('2')).toBeUndefined();
  });
});

describe('Appointment Management', () => {
  test('can create an appointment with unique ID', () => {
    const id1 = Date.now().toString();
    const id2 = (Date.now() + 1).toString();

    const appointment1 = createAppointment({ id: id1, customerName: 'John Doe', date: '2024-12-25', time: '10:00' });
    const appointment2 = createAppointment({ id: id2, customerName: 'Jane Doe', date: '2024-12-26', time: '11:00' });

    saveAppointment(appointment1);
    saveAppointment(appointment2);

    expect(appointment1.id).not.toBe(appointment2.id);
    expect(getAppointmentById(id1)).toEqual(appointment1);
    expect(getAppointmentById(id2)).toEqual(appointment2);
  });

  test('can reference appointment by ID', () => {
    const appointmentId = 'appt-123';
    const appointment = createAppointment({
      id: appointmentId,
      customerName: 'Test Customer',
      customerPhone: '555-9999',
      customerEmail: 'test@example.com',
      notes: 'Test notes',
    });

    saveAppointment(appointment);
    const retrieved = getAppointmentById(appointmentId);

    expect(retrieved).toEqual(appointment);
    expect(retrieved.id).toBe(appointmentId);
    expect(retrieved.customerName).toBe('Test Customer');
  });

  test('appointment can be marked with correct status', () => {
    const appointment = createAppointment({
      id: 'appt-456',
      customerName: 'Paid Customer',
      customerPhone: '555-0000',
      customerEmail: 'paid@example.com',
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
    });

    saveAppointment(appointment);
    const retrieved = getAppointmentById('appt-456');

    expect(retrieved.status).toBe('completed');
    expect(retrieved.paymentStatus).toBe('paid');
    expect(retrieved.paymentMethod).toBe('cash');

    // Update status
    const updated = { ...retrieved, status: 'cancelled' };
    saveAppointment(updated);
    expect(getAppointmentById('appt-456').status).toBe('cancelled');
  });
});
