import * as fixtures from '../../fixtures';

export const addEventsIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/events*', (req) => {
    expect(req.query['order']).eq('descending');
    expect(req.query['cluster_id']).eq(Cypress.env('clusterId'));

    const events = fixtures.getEvents({
      limit: req.query['limit'],
      offset: req.query['offset'],
      severities: req.query['severities'] as string,
      hostIds: req.query['host_ids'] as string,
      clusterLevel: !!req.query['cluster_level'],
      message: req.query['message'] as string,
    });

    req.reply({
      body: events,
      headers: fixtures.getEventHeaders(req.query),
    });
  }).as('events');
};
