import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { HostsNetworkConfigurationType } from '../../../services';
import { getFieldId, RadioField } from '../../../../common';
import { Day2ClusterDetailValues } from '../types';

const GROUP_NAME = 'hostsNetworkConfigurationType';

const Day2HostStaticIpConfigurations = () => {
  const { setFieldValue } = useFormikContext<Day2ClusterDetailValues>();

  const onChangeNetworkType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('hostsNetworkConfigurationType', event.target.value);
  };

  return (
    <FormGroup
      label="Hosts' network configuration"
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      isInline
      onChange={onChangeNetworkType}
    >
      <RadioField name={GROUP_NAME} value={HostsNetworkConfigurationType.DHCP} label="DHCP only" />
      <RadioField
        name={GROUP_NAME}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static IP, bridges, and bonds"
      />
    </FormGroup>
  );
};

export default Day2HostStaticIpConfigurations;
