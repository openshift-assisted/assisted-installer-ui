import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useDay2WizardContext } from './Day2WizardContext';
import { HostsNetworkConfigurationType } from '../../../services';
import { getFieldId, RadioField } from '../../../../common';
import { Day2ClusterDetailValues } from '../types';

const GROUP_NAME = 'hostsNetworkConfigurationType';

const Day2HostStaticIpConfigurations = () => {
  const { values, setFieldValue } = useFormikContext<Day2ClusterDetailValues>();
  const wizardContext = useDay2WizardContext();

  React.useEffect(() => {
    if (values.hostsNetworkConfigurationType) {
      wizardContext.onUpdateHostNetworkConfigType(values.hostsNetworkConfigurationType);
    }
  }, []);

  const onChangeNetworkType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    wizardContext.onUpdateHostNetworkConfigType(value as HostsNetworkConfigurationType);
    setFieldValue('hostsNetworkConfigurationType', value);
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
