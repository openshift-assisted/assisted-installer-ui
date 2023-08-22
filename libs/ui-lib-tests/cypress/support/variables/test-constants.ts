// timeouts
Cypress.env('HOST_REGISTRATION_TIMEOUT', 11 * 1000);
Cypress.env('HOST_DISCOVERY_TIMEOUT', 11 * 1000);
Cypress.env('HOST_READY_TIMEOUT', 11 * 1000);
Cypress.env('START_INSTALLATION_TIMEOUT', 2.5 * 60 * 1000);
Cypress.env('GENERATE_ISO_TIMEOUT', 2 * 60 * 1000);
Cypress.env('HOST_STATUS_INSUFFICIENT_TIMEOUT', 300000);
Cypress.env('DNS_RESOLUTION_ALERT_MESSAGE_TIMEOUT', 900000);
// Deployment
Cypress.env('NUM_MASTERS', parseInt(Cypress.env('NUM_MASTERS')));
Cypress.env('NUM_WORKERS', parseInt(Cypress.env('NUM_WORKERS')));
