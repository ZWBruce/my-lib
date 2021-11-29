import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello mini-react', () => {
  render(<App />);
  const element = screen.getByText(/hello mini-react/i);
  expect(element).toBeInTheDocument();
});
