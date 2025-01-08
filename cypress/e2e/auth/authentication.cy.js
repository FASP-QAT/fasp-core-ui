import { API_URL } from '../../../src/Constants';

describe('Authentication', () => {
  beforeEach(() => {
    cy.mockRealApiCalls();
  });

  it('should handle invalid credentials', () => {
    cy.intercept('POST', `${API_URL}/authenticate`, {
      statusCode: 401,
      body: { messageCode: 'static.message.login.invalidCredentials' }
    }).as('loginRequest');

    cy.login('wrong@email.com', 'wrongpass');
    // Test the actual text user sees
    cy.contains('Incorrect login or password').should('be.visible');
    cy.url().should('include', '/#/login');
  });

  it('should handle forgot password flow', () => {
    cy.visit('/#/login', {
      onBeforeLoad: (win) => {
        win.WebSocket = undefined;
      }
    });

    // Click forgot password using actual text
    cy.get('button[type="button"].btn-link').click();
    cy.url().should('include', '/#/forgotPassword');

    // Fill and submit forgot password form
    cy.get('#emailId').type('test@example.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@forgotPassword');
    // Test the actual message user sees
    cy.contains('An email has been sent to you with a password reset link').should('be.visible');
  });

  it('should handle expired password and redirect to update password', () => {
    cy.intercept('POST', `${API_URL}/authenticate`, {
      statusCode: 406,
      body: { messageCode: 'static.message.login.passwordExpired' }
    }).as('loginRequest');

    cy.login('test@example.com', 'password123');
    cy.url().should('include', '/#/updateExpiredPassword');
  });

  it('should handle complete login with valid credentials', () => {
    // Login
    cy.login('testuser@qat.info', 'password');
    cy.url().should('include', '/#/ApplicationDashboard');
  });
});