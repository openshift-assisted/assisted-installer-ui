import React from 'react';
import { useFormikContext } from 'formik';
import { Grid } from '@patternfly/react-core';
import { InputField, CheckboxField, trimCommaSeparatedList, PopoverIcon } from '../ui';
import { ProxyFieldsType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import './ProxyFields.css';
import { Trans } from 'react-i18next';

export const ProxyInputFields = () => {
  const { setFieldValue, values } = useFormikContext<ProxyFieldsType>();
  const onNoProxyBlur = () => {
    if (values.noProxy) {
      setFieldValue('noProxy', trimCommaSeparatedList(values.noProxy));
    }
  };
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <InputField
        label={
          <>
            {t('ai:HTTP proxy URL')}{' '}
            <PopoverIcon
              bodyContent={t(
                'ai:The HTTP proxy URL that agents should use to access the discovery service.',
              )}
            />
          </>
        }
        name="httpProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            <Trans
              t={t}
              components={{ bold: <strong /> }}
              i18nKey="ai:URL must start with <bold>http</bold>."
            />
          </div>
        }
      />
      <InputField
        label={
          <>
            {t('ai:HTTPS proxy URL')}{' '}
            <PopoverIcon
              bodyContent={t(
                "ai:Specify the HTTPS proxy that agents should use to access the discovery service. If you don't provide a value, your HTTP proxy URL will be used by default for both HTTP and HTTPS connections.",
              )}
            />
          </>
        }
        name="httpsProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            <Trans
              t={t}
              components={{ bold: <strong /> }}
              i18nKey="ai:URL must start with <bold>http</bold> (https schemes are not currently supported)."
            />
          </div>
        }
      />
      <InputField
        label={
          <>
            {t('ai:No proxy domains')}{' '}
            <PopoverIcon
              bodyContent={t(
                'ai:Exclude destination domain names, IP addresses, or other network CIDRs from proxying by adding them to this comma-separated list.',
              )}
            />
          </>
        }
        name="noProxy"
        placeholder="one.domain.com,second.domain.com"
        helperText={
          <div>
            <Trans
              t={t}
              components={{ bold: <strong /> }}
              i18nKey="ai:Use a comma to separate each listed domain. Preface a domain with <bold>.</bold> to include its subdomains. Use <bold>*</bold> to bypass the proxy for all destinations."
            />
          </div>
        }
        onBlur={onNoProxyBlur}
      />
    </Grid>
  );
};

const ProxyFields: React.FC = () => {
  const { setFieldValue, values, initialValues } = useFormikContext<ProxyFieldsType>();
  const resetProxy = (isNewlyChecked: boolean) => {
    if (isNewlyChecked) {
      setFieldValue('httpProxy', initialValues.httpProxy);
      setFieldValue('httpsProxy', initialValues.httpsProxy);
      setFieldValue('noProxy', initialValues.noProxy);
    } else {
      setFieldValue('httpProxy', '');
      setFieldValue('httpsProxy', '');
      setFieldValue('noProxy', '');
    }
  };
  const { t } = useTranslation();
  // https://docs.openshift.com/container-platform/4.6/networking/enable-cluster-wide-proxy.html
  return (
    <>
      <CheckboxField
        label={t('ai:Configure cluster-wide proxy settings')}
        name="enableProxy"
        className="ai-proxy-fields"
        helperText={
          <p>
            {t(
              'ai:If hosts are behind a firewall that requires the use of a proxy, provide additional information about the proxy.',
            )}
          </p>
        }
        onChange={(value: boolean) => resetProxy(value)}
        body={values.enableProxy && <ProxyInputFields />}
      />
    </>
  );
};

export default ProxyFields;
