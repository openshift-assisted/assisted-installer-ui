import { AxiosPromise } from 'axios';
import client from './axiosClient';
import { API_ROOT } from '../config';

export const getVersions = (): AxiosPromise => client.get(`${API_ROOT}/versions`);
