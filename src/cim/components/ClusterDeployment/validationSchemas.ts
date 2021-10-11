import * as Yup from 'yup';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';

export const hostCountValidationSchema = Yup.number()
  .min(HOSTS_MIN_COUNT, `A cluster can have ${HOSTS_MIN_COUNT} hosts at minimum.`)
  .max(HOSTS_MAX_COUNT, `Maximum hosts count (${HOSTS_MAX_COUNT}) reached.`)
  .test('not-four', 'A cluster needs 2 or more worker nodes.', (value) => value !== 4)
  .required();
