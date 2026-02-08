import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { ProxyFieldsType } from '../types';
import { trimCommaSeparatedList } from '../components/ui/formik/utils';
import { PROXY_DNS_REGEX } from './regexes';
import { isIPorDN } from './utils';

export const httpProxyValidationSchema = ({
  values,
  pairValueName,
  allowEmpty,
  t,
}: {
  values: ProxyFieldsType;
  pairValueName: 'httpProxy' | 'httpsProxy';
  allowEmpty?: boolean;
  t: TFunction;
}) => {
  const validation = Yup.string().test(
    'http-proxy-validation',
    t('ai:Provide a valid HTTP URL.'),
    (value?: string) => {
      if (!value) {
        return true;
      }

      if (!value.startsWith('http://')) {
        return false;
      }

      try {
        new URL(value);
      } catch {
        return false;
      }
      return true;
    },
  );

  if (allowEmpty) {
    return validation;
  }

  return validation.test(
    'http-proxy-no-empty-validation',
    t('ai:At least one of the HTTP or HTTPS proxy URLs is required.'),
    (value) => !values.enableProxy || !!value || !!values[pairValueName],
  );
};

export const noProxyValidationSchema = (t: TFunction) =>
  Yup.string().test(
    'no-proxy-validation',
    t('ai:Provide a comma separated list of valid DNS names or IP addresses.'),
    (value?: string) => {
      if (!value || value === '*') {
        return true;
      }

      // https://docs.openshift.com/container-platform/4.5/installing/installing_bare_metal/installing-restricted-networks-bare-metal.html#installation-configure-proxy_installing-restricted-networks-bare-metal
      // A comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude proxying.
      // Preface a domain with . to match subdomains only. For example, .y.com matches x.y.com, but not y.com.
      // Use * to bypass proxy for all destinations.
      const noProxyList = trimCommaSeparatedList(value).split(',');
      return noProxyList.every((p) => isIPorDN(p, PROXY_DNS_REGEX));
    },
  );
