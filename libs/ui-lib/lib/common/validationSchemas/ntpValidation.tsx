import * as Yup from 'yup';
import { trimCommaSeparatedList } from '../components/ui/formik/utils';
import { isIPorDN } from './utils';
import { TFunction } from 'i18next';

export const ntpSourceValidationSchema = (t: TFunction) =>
  Yup.string()
    .test(
      'ntp-source-validation',
      t('ai:Provide a comma separated list of valid DNS names or IP addresses.'),
      (value?: string) => {
        if (!value || value === '') {
          return true;
        }
        return trimCommaSeparatedList(value)
          .split(',')
          .every((v) => isIPorDN(v));
      },
    )
    .test(
      'ntp-source-validation-unique',
      t('ai:DNS names and IP addresses must be unique.'),
      (value?: string) => {
        if (!value || value === '') {
          return true;
        }
        const arr = trimCommaSeparatedList(value).split(',');
        return arr.length === new Set(arr).size;
      },
    );
