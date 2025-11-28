import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the storage module to prevent API calls in tests
jest.mock('./lib/storage', () => ({
  apiGetCurrentUser: jest.fn(() => Promise.resolve({ user: null })),
  apiSignup: jest.fn(),
  apiLogin: jest.fn(),
  apiLogout: jest.fn(),
  apiUpdateProfile: jest.fn(),
  getServices: jest.fn(() => Promise.resolve([])),
  getServiceById: jest.fn(),
  saveService: jest.fn(),
  deleteService: jest.fn(),
  getAppointments: jest.fn(() => Promise.resolve([])),
  getAppointmentById: jest.fn(),
  saveAppointment: jest.fn(),
  deleteAppointment: jest.fn(),
}));

test('renders home page with sign up form by default', () => {
  render(<App />);

  // Should show the sign up form on the home page
  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});

test('renders app without crashing', () => {
  render(<App />);

  // App should render without errors
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});
