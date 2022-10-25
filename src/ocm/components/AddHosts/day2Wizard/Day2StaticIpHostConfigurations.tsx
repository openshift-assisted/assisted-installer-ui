import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useDay2WizardContext } from './Day2WizardContext';
import { HostsNetworkConfigurationType } from '../../../services';
import { getFieldId, RadioField } from '../../../../common';
import { Day2ClusterDetailValues } from '../types';

const Day2HostConfigurations = () => {
  const { values, setFieldValue } = useFormikContext<Day2ClusterDetailValues>();
  const wizardContext = useDay2WizardContext();

  React.useEffect(() => {
    if (values.hostsNetworkConfigurationType) {
      wizardContext.onUpdateHostNetworkConfigType(values.hostsNetworkConfigurationType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeNetworkType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    wizardContext.onUpdateHostNetworkConfigType(value as HostsNetworkConfigurationType);
    setFieldValue('hostsNetworkConfigurationType', value);
  };

  return (
    <FormGroup
      label="Hosts' network configuration"
      fieldId={getFieldId('hostsNetworkConfigurationType', 'radio')}
      isInline
      onChange={onChangeNetworkType}
    >
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={HostsNetworkConfigurationType.DHCP}
        label="DHCP only"
      />
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static IP, bridges, and bonds"
      />
    </FormGroup>
  );
};

export default Day2HostConfigurations;
