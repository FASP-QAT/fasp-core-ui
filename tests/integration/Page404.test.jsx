import React from 'react';
import { render, screen } from '@testing-library/react';
import Page404 from '../../src/views/Pages/Page404/Page404';
import { BrowserRouter as Router } from 'react-router-dom'; // If needed for routing

describe('Page404', () => {
  test('renders 404 error page with correct elements', () => {
    render(
      <Router>
        <Page404 />
      </Router>
    );

    // Check if the 404 message is rendered
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Oops! You're lost./i)).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for was not found./i)).toBeInTheDocument();

    // Check if the search input field is present
    expect(screen.getByPlaceholderText(/What are you looking for?/i)).toBeInTheDocument();

    // Check if the search button is present
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
});
