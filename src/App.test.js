import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch for the /time endpoint
global.fetch = jest.fn();

// Suppress act warnings for async state updates in useEffect
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  fetch.mockClear();
});

test('renders app header', async () => {
  const mockData = { time: 1234567890 };
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockData),
  });

  render(<App />);

  // Wait for the fetch to complete and state to update
  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });

  // Then check for content
  await waitFor(() => {
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });
});

test('displays current time after fetch', async () => {
  const mockTime = 1234567890;
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ time: mockTime }),
  });

  render(<App />);

  // Wait for fetch and state update
  await waitFor(() => {
    expect(screen.getByText(/the current time is/i)).toBeInTheDocument();
  });

  expect(screen.getByText(new RegExp(mockTime.toString()))).toBeInTheDocument();
});

test('renders learn react link', async () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve({ time: 1234567890 }),
  });

  render(<App />);

  // Wait for async operations to complete
  await waitFor(() => {
    expect(screen.getByText(/learn react/i)).toBeInTheDocument();
  });
});
