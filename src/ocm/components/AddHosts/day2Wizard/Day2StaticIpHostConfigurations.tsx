import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useDay2WizardContext } from './Day2WizardContext';
import { HostsNetworkConfigurationType } from '../../../services';
import { getFieldId, RadioField } from '../../../../common';

type WipValues = Record<string, string>; // TODO (multi-arch) define

const Day2StaticIpHostConfigurations = () => {
  const { setFieldValue } = useFormikContext<WipValues>();
  const wizardContext = useDay2WizardContext();

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
      <RadioField name={'hostsNetworkConfigurationType'} value={'dhcp'} label="DHCP only" />
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={'static'}
        label="Static IP, bridges, and bonds"
      />
    </FormGroup>
  );
};

export default Day2StaticIpHostConfigurations;
