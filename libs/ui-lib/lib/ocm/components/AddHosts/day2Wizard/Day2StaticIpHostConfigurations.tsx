import React from 'react';
import {
  Flex,
  FlexItem,
  FormGroup,
  Content,
  ContentVariants,
  Tooltip,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { HostsNetworkConfigurationType } from '../../../services';
import { RadioField, getFieldId } from '../../../../common';
import { Day2ClusterDetailValues } from '../types';

const GROUP_NAME = 'hostsNetworkConfigurationType';

const Day2HostStaticIpConfigurations = ({ isDisabled }: { isDisabled: boolean }) => {
  const { setFieldValue } = useFormikContext<Day2ClusterDetailValues>();

  const onChangeNetworkType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('hostsNetworkConfigurationType', event.target.value);
  };

  return (
    <FormGroup
      label={
        <Content>
          <Content component={ContentVariants.h4}>Hosts' network configuration</Content>
        </Content>
      }
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      isInline
      onChange={onChangeNetworkType}
    >
      <Tooltip
        hidden={!isDisabled}
        content="This cluster is using the Oracle cloud platform which allows only DHCP for the hosts' network configuration"
      >
        <Flex>
          <FlexItem key={HostsNetworkConfigurationType.DHCP}>
            <RadioField
              name={GROUP_NAME}
              value={HostsNetworkConfigurationType.DHCP}
              label="DHCP only"
              isDisabled={isDisabled}
            />
          </FlexItem>
          <FlexItem key={HostsNetworkConfigurationType.STATIC}>
            <RadioField
              name={GROUP_NAME}
              value={HostsNetworkConfigurationType.STATIC}
              label="Static IP, bridges, and bonds"
              isDisabled={isDisabled}
            />
          </FlexItem>
        </Flex>
      </Tooltip>
    </FormGroup>
  );
};

export default Day2HostStaticIpConfigurations;
