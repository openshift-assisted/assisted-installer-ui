import React from 'react';
import { useFormikContext } from 'formik';
import { InputField, CheckboxField } from '../ui/formik';
import { DiscoveryImageFormValues } from './types';

const DiscoveryProxyFields: React.FC = () => {
  const { setFieldValue, values } = useFormikContext<DiscoveryImageFormValues>();
  const resetProxy = () => setFieldValue('proxyUrl', '');
  return (
    <>
      <CheckboxField
        label="Use HTTP Proxy"
        name="enableProxy"
        helperText="If hosts are behind a firewall that requires the use of a proxy, provide additional information about the proxy."
        onChange={(value: boolean) => !value && resetProxy()}
      />
      {values.enableProxy && (
        <InputField
          label="HTTP Proxy URL"
          name="proxyUrl"
          placeholder="http://<user>:<password>@<ipaddr>:<port>"
          helperText="HTTP proxy URL that agents should use to access the discovery service"
        />
      )}
    </>
  );
};

export default DiscoveryProxyFields;
