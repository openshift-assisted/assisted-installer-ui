import { AxiosPromise } from 'axios';
import { EventList, Event } from './types';
import client from './axiosClient';
import { API_ROOT } from '.';

export const getEvents = (entityId: Event['entityId']): AxiosPromise<EventList> =>
  client.get(`${API_ROOT}/events/${entityId}`);
