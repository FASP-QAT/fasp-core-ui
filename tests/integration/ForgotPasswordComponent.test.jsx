import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordComponent from '../../src/views/Pages/Login/ForgotPasswordComponent';
import { BrowserRouter as Router } from 'react-router-dom';

vi.mock('../../src/api/UserService.js');

describe('ForgotPasswordComponent', () => {
    beforeEach(() => {
        // Reset mock calls before each test
        vi.clearAllMocks();
    });

    test('renders the ForgotPasswordComponent and form', () => {
        render(
            <Router>
                <ForgotPasswordComponent />
            </Router>
        );

        // Check if the form fields and buttons are rendered
        expect(screen.getByLabelText(/emailid/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
});
