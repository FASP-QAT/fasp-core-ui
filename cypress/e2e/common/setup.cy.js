beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Disable failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

Cypress.on('test:before:run', () => {
  // Clear cookies before each test
  cy.clearCookies();
  cy.clearLocalStorage();
}); 