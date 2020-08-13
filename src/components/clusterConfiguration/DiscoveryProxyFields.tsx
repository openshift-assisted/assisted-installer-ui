import React from 'react';
import { useFormikContext } from 'formik';
import { InputField, CheckboxField } from '../ui/formik';
import { ClusterConfigurationValues } from '../../types/clusters';

const DiscoveryProxyFields: React.FC = () => {
  const { setFieldValue, values } = useFormikContext<ClusterConfigurationValues>();
  const resetProxy = () => {
    setFieldValue('httpProxy', '');
    setFieldValue('httpsProxy', '');
    setFieldValue('noProxy', '');
  };

  // https://docs.openshift.com/container-platform/4.4/networking/enable-cluster-wide-proxy.html
  return (
    <>
      <CheckboxField
        label="Use HTTP Proxy"
        name="enableProxy"
        helperText="If hosts are behind a firewall that requires the use of a proxy, provide additional information about the proxy."
        onChange={(value: boolean) => !value && resetProxy()}
      />
      {values.enableProxy && (
        <>
          <InputField
            label="HTTP Proxy URL"
            name="httpProxy"
            placeholder="http://<user>:<password>@<ipaddr>:<port>"
            helperText={
              <div>
                HTTP proxy URL that agents should use to access the discovery service. The URL
                scheme <b>must be http</b>.
              </div>
            }
          />
          <InputField
            label="HTTPS Proxy URL"
            name="httpsProxy"
            placeholder="http://<user>:<password>@<ipaddr>:<port>"
            helperText={
              <div>
                HTTPS proxy URL that agents should use to access the discovery service. If the value
                is not specified, the HTTP Proxy URL is used as default for both http and https
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
          />
        </>
      )}
    </>
  );
};

export default DiscoveryProxyFields;
