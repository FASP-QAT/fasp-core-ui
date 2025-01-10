import { API_URL } from '../../../src/Constants';

describe('Authentication', () => {
  let testData;

  before(() => {
    cy.fixture('auth.json').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.mockRealApiCalls();
  });

  it('should handle invalid credentials', () => {
    cy.intercept('POST', `${API_URL}/authenticate`, {
      statusCode: 401,
      body: { messageCode: 'static.message.login.invalidCredentials' }
    }).as('loginRequest');

    cy.login(testData.invalidUser.email, testData.invalidUser.password);
    cy.contains('Incorrect login or password').should('be.visible');
    cy.url().should('include', '/#/login');
  });

  it('should handle forgot password flow', () => {
    cy.visit('/#/login', {
      onBeforeLoad: (win) => {
        win.WebSocket = undefined;
      }
    });

    // Navigate to forgot password
    cy.get('button[type="button"].btn-link').click();
    cy.url().should('include', '/#/forgotPassword');

    // Submit forgot password request
    cy.get('#emailId').type(testData.forgotPasswordUser.email);
    cy.get('button[type="submit"]').click();

    // Verify success message
    cy.wait('@forgotPassword');
    cy.contains('An email has been sent to you with a password reset link')
      .should('be.visible');
  });

  it('should handle expired password and redirect to update password', () => {
    cy.intercept('POST', `${API_URL}/authenticate`, {
      statusCode: 406,
      body: { messageCode: 'static.message.login.passwordExpired' }
    }).as('loginRequest');

    cy.login(testData.expiredPasswordUser.email, testData.expiredPasswordUser.password);
    cy.url().should('include', '/#/updateExpiredPassword');
  });

  it('should handle complete login with valid credentials and logout successfully', () => {
    // Handle expected exceptions from cleanup operations
    cy.on('uncaught:exception', () => false);

    // Perform login
    cy.login(testData.validUser.email, testData.validUser.password);
    cy.url().should('include', '/#/ApplicationDashboard');

    // Wait for dashboard data
    cy.wait(['@notificationCount', '@openIssues', '@realmLevel']);

    // Perform logout
    cy.get('.icon-wrapper .cui-account-logout.icons.icon-anim-pulse').click();
    cy.get('.react-confirm-alert-button-group button').contains('Yes').click();
    cy.wait('@logout');

    // Verify logout success
    cy.url().should('include', '/#/login');
    cy.contains('Logged out successfully').should('be.visible');
    
    // Verify session cleanup
    cy.window().then((win) => {
      expect(win.localStorage.getItem('curUser')).to.be.null;
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});