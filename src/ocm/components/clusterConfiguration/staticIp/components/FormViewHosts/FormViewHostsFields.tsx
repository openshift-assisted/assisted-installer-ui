import React from 'react';
import { FormGroup, Grid } from '@patternfly/react-core';
import StaticIpHostsArray, { HostComponentProps } from '../StaticIpHostsArray';
import { useField } from 'formik';
import { getFieldId, InputField } from '../../../../../../common';
import HostSummary from '../CollapsedHost';
import { FormViewHost, StaticProtocolType } from '../../data/dataTypes';
import { getProtocolVersionLabel, getShownProtocolVersions } from '../../data/protocolVersion';
import { getEmptyFormViewHost } from '../../data/emptyData';
import useClusterPermissions from '../../../../../hooks/useClusterPermissions';

const getExpandedHostComponent = (protocolType: StaticProtocolType, isDisabled: boolean) => {
  const Component = ({ fieldName, hostIdx }: HostComponentProps) => {
    return (
      <Grid hasGutter>
        <InputField
          name={`${fieldName}.macAddress`}
          label="MAC Address"
          isRequired
          isDisabled={isDisabled}
          data-testid={`mac-address-${hostIdx}`}
        />
        {getShownProtocolVersions(protocolType).map((protocolVersion) => (
          <FormGroup
            label={`IP address (${getProtocolVersionLabel(protocolVersion)})`}
            fieldId={getFieldId(`${fieldName}.ips.${protocolVersion}`, 'input')}
            key={protocolVersion}
          >
            <InputField
              name={`${fieldName}.ips.${protocolVersion}`}
              isRequired
              isDisabled={isDisabled}
              data-testid={`${protocolVersion}-address-${hostIdx}`}
            />{' '}
          </FormGroup>
        ))}
      </Grid>
    );
  };
  return Component;
};

const getCollapsedHostComponent = (protocolType: StaticProtocolType) => {
  const Component = ({ fieldName, hostIdx }: HostComponentProps) => {
    const [{ value }, { error }] = useField<FormViewHost>({
      name: fieldName,
    });
    const ipAddresses = getShownProtocolVersions(protocolType).map(
      (protocolVersion) => value.ips[protocolVersion],
    );
    const mapValue = ipAddresses.join(', ');
    return (
      <HostSummary
        title="MAC to IP mapping"
        numInterfaces={1}
        macAddress={value.macAddress}
        mappingValue={mapValue}
        hostIdx={hostIdx}
        hasError={!!error}
      ></HostSummary>
    );
  };
  return Component;
};

export const FormViewHostsFields: React.FC<{ protocolType: StaticProtocolType }> = ({
  protocolType,
}) => {
  const emptyHost = getEmptyFormViewHost();
  const { isViewerMode } = useClusterPermissions();
  const CollapsedHostComponent = getCollapsedHostComponent(protocolType);
  const ExpandedHostComponent = getExpandedHostComponent(protocolType, isViewerMode);
  return (
    <StaticIpHostsArray<FormViewHost>
      CollapsedHostComponent={CollapsedHostComponent}
      ExpandedHostComponent={ExpandedHostComponent}
      emptyHostData={emptyHost}
    />
  );
};
