import React from 'react';
import { render, screen, fireEvent, waitFor, createEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import Login from '../../../../../src/views/Pages/Login/Login';
import AuthenticationService from '../../../../../src/views/Common/AuthenticationService';
import LoginService from '../../../../../src/api/LoginService';
import { isSiteOnline } from '../../../../../src/CommonComponent/JavascriptCommonFunctions';
import { createMemoryHistory } from 'history';


global.indexedDB = {
  open: vi.fn(() => ({
    onupgradeneeded: vi.fn(),
    onsuccess: vi.fn(),
    onerror: vi.fn(),
  })),
};

vi.mock('../../../../../src/api/LoginService', () => ({
  __esModule: true,
  default: {
    authenticate: vi.fn().mockResolvedValue({ 
      data: {
        token: 'mock-token'
      }
    }),
    getApiVersion: vi.fn().mockResolvedValue({ 
      data: {
        app: {
          version: '1.0.0',
          frontEndVersion: '13330'
        }
      }
    }),
  }
}));

// Mock the AuthenticationService
vi.mock('../../../../../src/views/Common/AuthenticationService', () => ({
  __esModule: true,
  default: {
    getIconAndStaticLabel: vi.fn(() => "mockedIcon"),
    clearUserDetails: vi.fn(),
    setRecordCount: vi.fn(),
    getDefaultUserLanguage: vi.fn(() => 'en'),
    setLanguageChangeFlag: vi.fn(),
    setupAxiosInterceptors: vi.fn(),
    isUserLoggedIn: vi.fn(),
  },
}));

// Mock isSiteOnline function
vi.mock('../../../../../src/CommonComponent/JavascriptCommonFunctions', () => ({
  isSiteOnline: vi.fn()
}));

describe('Login Component', () => {
  const mockMatch = { params: { message: 'Welcome to the login page' } };
  let history;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    history = createMemoryHistory();

    render(
      <MemoryRouter initialEntries={['/login']} history={history}>
        <Route path="/login">
          <Login 
            match={mockMatch}
            history={history}
          />
        </Route>
      </MemoryRouter>
    );
  });

  it('renders the login form', () => {
    expect(screen.getByPlaceholderText(/static\.login\.emailId/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/static\.login\.password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /static\.login\.login/i })).toBeInTheDocument();
  });

  it('executes online login flow when online', async () => {
    // Set isSiteOnline to return true
    isSiteOnline.mockReturnValue(true);

    const usernameInput = screen.getByPlaceholderText(/static\.login\.emailId/i);
    const passwordInput = screen.getByPlaceholderText(/static\.login\.password/i);
    const form = screen.getByRole('form');

    fireEvent.change(usernameInput, { target: { value: 'testuser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser@gmail.com');
    expect(passwordInput.value).toBe('password123');
    
    const submitEvent = createEvent.submit(form);
    fireEvent(form, submitEvent);

    await waitFor(() => {
        expect(LoginService.authenticate).toHaveBeenCalledWith(
            'testuser@gmail.com',
            'password123',
            'en',
            null
        );
    });
  });

  it('executes offline login flow and shows error message for invalid credentials', async () => {
    // Set isSiteOnline to return false
    isSiteOnline.mockReturnValue(false);
    const usernameInput = screen.getByPlaceholderText(/static\.login\.emailId/i);
    const passwordInput = screen.getByPlaceholderText(/static\.login\.password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
        expect(AuthenticationService.isUserLoggedIn).toHaveBeenCalledWith('testuser@gmail.com');
    });
    await waitFor(() => {
      expect(screen.getByText('static.message.login.invalidCredentials')).toBeInTheDocument();
    });
  });

  it('redirects to forgot password page when clicking forgot password link', () => {
    isSiteOnline.mockReturnValue(true);
    const forgotPasswordButton = screen.getByRole('button', { name: /static\.login\.forgotpassword/i });
    fireEvent.click(forgotPasswordButton);
    
    expect(history.location.pathname).toBe('/forgotPassword');
  });

  it('shows offline message when trying to reset password offline', () => {
    isSiteOnline.mockReturnValue(false);
    const forgotPasswordButton = screen.getByRole('button', { name: /static\.login\.forgotpassword/i });
    fireEvent.click(forgotPasswordButton);
    
    expect(screen.getByText(/static\.forgotPassword\.offline/i)).toBeInTheDocument();
  });
});
