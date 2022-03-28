import React from 'react';
import { useFormikContext } from 'formik';
import { Grid } from '@patternfly/react-core';
import { InputField, CheckboxField, trimCommaSeparatedList, PopoverIcon } from '../ui';
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
        label={
          <>
            {'HTTP proxy URL'}
            <PopoverIcon
              variant={'plain'}
              bodyContent={
                'The HTTP proxy URL that agents should use to access the discovery service.'
              }
            />
          </>
        }
        name="httpProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            URL must start with <b>http</b>.
          </div>
        }
      />
      <InputField
        label={
          <>
            {'HTTPS proxy URL'}
            <PopoverIcon
              variant={'plain'}
              bodyContent={
                "Specify the HTTPS proxy that agents should use to access the discovery service. If you don't provide a value, your HTTP proxy URL will be used by default for both HTTP and HTTPS connections."
              }
            />
          </>
        }
        name="httpsProxy"
        placeholder="http://<user>:<password>@<ipaddr>:<port>"
        helperText={
          <div>
            URL must start with <b>http</b> (https schemes are not currently supported).
          </div>
        }
      />
      <InputField
        label={
          <>
            {'NO_PROXY domains'}
            <PopoverIcon
              variant={'plain'}
              bodyContent={
                'Exclude destination domain names, IP addresses, or other network CIDRs from proxying by adding them to this comma-separated list.'
              }
            />
          </>
        }
        name="noProxy"
        placeholder="one.domain.com,second.domain.com"
        helperText={
          <div>
            Use a comma to separate each listed domain. Preface a domain with <b>.</b> to include
            its subdomains. Use <b>*</b> to bypass the proxy for all destinations.
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
