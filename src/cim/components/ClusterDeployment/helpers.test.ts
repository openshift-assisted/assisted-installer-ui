import { formatEventsData } from './helpers';

const rawData = [
  {
    cluster_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    host_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    severity: 'info',
    category: 'user',
    message: 'string',
    event_time: '2021-09-01T13:14:45.966Z',
    request_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    props: 'string',
  },
];
const result = [
  {
    clusterId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    hostId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    severity: 'info',
    category: 'user',
    message: 'string',
    eventTime: '2021-09-01T13:14:45.966Z',
    requestId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    props: 'string',
  },
];

describe('Clusterdeployment helpers', () => {
  describe('formatEventsData', () => {
    it('camel-cases the response keys', () => {
      expect(formatEventsData(rawData)).toEqual(result);
    });
  });
});
