import { AxiosPromise } from 'axios';
import { EventList, Event } from './types';
import { client } from './axiosClient';

export const getEvents = (entityId: Event['entityId']): AxiosPromise<EventList> =>
  client.get(`/events/${entityId}`);
