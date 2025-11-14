import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the storage module to prevent localStorage issues in tests
jest.mock('./lib/storage', () => ({
  getCurrentUser: jest.fn(() => null),
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
