import * as Yup from 'yup';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';
import { TFunction } from 'i18next';

export const hostCountValidationSchema = (t: TFunction) => {
  return Yup.number()
    .min(
      HOSTS_MIN_COUNT,
      t('ai:A cluster can have {{HOSTS_MIN_COUNT}} hosts at minimum.', {
        HOSTS_MIN_COUNT,
      }),
    )
    .max(
      HOSTS_MAX_COUNT,
      t('ai:Maximum hosts count {{HOSTS_MAX_COUNT}} reached.', { HOSTS_MAX_COUNT }),
    )
    .required(t('ai:Required field'));
};
