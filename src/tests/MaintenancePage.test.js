import React from 'react';
import { render, screen } from '@testing-library/react';
import MaintenancePage from '../pages/MaintenancePage';

test('renders the Maintenance Page correctly', () => {
  render(<MaintenancePage />);
  
  // Check if the title is rendered
  const titleElement = screen.getByText(/Product Maintenance/i);
  expect(titleElement).toBeInTheDocument();
  
  // Check if the form is rendered
  const addButton = screen.getByText(/Add Product/i);
  expect(addButton).toBeInTheDocument();
  
  // Check if the table is rendered
  const tableHeader = screen.getByText(/Products List/i);
  expect(tableHeader).toBeInTheDocument();
});
