import React from 'react';
import { Flex, FlexItem, FormGroup, TextContent, TextVariants, Text } from '@patternfly/react-core';
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
      label={
        <TextContent>
          <Text component={TextVariants.h4}>Hosts' network configuration</Text>
        </TextContent>
      }
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      isInline
      onChange={onChangeNetworkType}
    >
      <Flex>
        <FlexItem key={HostsNetworkConfigurationType.DHCP}>
          <RadioField
            name={GROUP_NAME}
            value={HostsNetworkConfigurationType.DHCP}
            label="DHCP only"
          />
        </FlexItem>
        <FlexItem key={HostsNetworkConfigurationType.STATIC}>
          <RadioField
            name={GROUP_NAME}
            value={HostsNetworkConfigurationType.STATIC}
            label="Static IP, bridges, and bonds"
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default Day2HostStaticIpConfigurations;
