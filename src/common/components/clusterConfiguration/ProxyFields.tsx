import React from 'react';
import { useFormikContext } from 'formik';
import { Grid } from '@patternfly/react-core';
import { InputField, CheckboxField, trimCommaSeparatedList } from '../ui';
import { ProxyFieldsType } from '../../types';

export const ProxyInputFields = () => {
  const { setFieldValue, values } = useFormikContext<ProxyFieldsType>();
  const onNoProxyBlur = () => {
    if (values.noProxy) {
      setFieldValue('noProxy', trimCommaSeparatedList(values.noProxy));
    }
  };
  return (
    <Grid hasGutter>
      <InputField
        label="HTTP Proxy URL"
        name="httpProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            HTTP proxy URL that agents should use to access the discovery service. The URL scheme{' '}
            <b>must be http</b>.
          </div>
        }
      />
      <InputField
        label="HTTPS Proxy URL"
        name="httpsProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            HTTPS proxy URL that agents should use to access the discovery service. If the value is
            not specified, the HTTP Proxy URL is used as default for both http and https
            connections. The URL scheme <b>must be http</b>, the <i>https</i> is currently not
            supported.
          </div>
        }
      />
      <InputField
        label="No Proxy domains"
        name="noProxy"
        placeholder="one.domain.com,second.domain.com"
        helperText="A comma-separated list of destination domain names, domains, IP addresses or other network CIDRs to exclude proxying. Preface a domain with . to include all subdomains of that domain. Use * to bypass proxy for all destinations."
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

  // https://docs.openshift.com/container-platform/4.6/networking/enable-cluster-wide-proxy.html
  return (
    <>
      <CheckboxField
        label="Configure cluster-wide proxy settings"
        name="enableProxy"
        helperText={
          <p>
            If hosts are behind a firewall that requires the use of a proxy, provide additional
            information about the proxy.
          </p>
        }
        onChange={(value: boolean) => resetProxy(value)}
        body={values.enableProxy && <ProxyInputFields />}
      />
    </>
  );
};

export default ProxyFields;
