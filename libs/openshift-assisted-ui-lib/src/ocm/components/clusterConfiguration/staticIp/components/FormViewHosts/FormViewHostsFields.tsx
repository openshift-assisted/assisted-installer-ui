import React from 'react';
import { FormGroup, Grid } from '@patternfly/react-core';
import { useField } from 'formik';
import StaticIpHostsArray, { HostComponentProps } from '../StaticIpHostsArray';
import { getFieldId } from '../../../../../../common';
import HostSummary from '../CollapsedHost';
import { FormViewHost, StaticProtocolType } from '../../data/dataTypes';
import { getProtocolVersionLabel, getShownProtocolVersions } from '../../data/protocolVersion';
import { getEmptyFormViewHost } from '../../data/emptyData';
import { OcmInputField } from '../../../../ui/OcmFormFields';

const getExpandedHostComponent = (protocolType: StaticProtocolType) => {
  const Component: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
    return (
      <Grid hasGutter>
        <OcmInputField
          name={`${fieldName}.macAddress`}
          label="MAC Address"
          isRequired
          data-testid={`mac-address-${hostIdx}`}
        />
        {getShownProtocolVersions(protocolType).map((protocolVersion) => (
          <FormGroup
            label={`IP address (${getProtocolVersionLabel(protocolVersion)})`}
            fieldId={getFieldId(`${fieldName}.ips.${protocolVersion}`, 'input')}
            key={protocolVersion}
          >
            <OcmInputField
              name={`${fieldName}.ips.${protocolVersion}`}
              isRequired
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
  const Component: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
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
      />
    );
  };
  return Component;
};

export const FormViewHostsFields: React.FC<{ protocolType: StaticProtocolType }> = ({
  protocolType,
}) => {
  const emptyHost = getEmptyFormViewHost();
  const CollapsedHostComponent = getCollapsedHostComponent(protocolType);
  const ExpandedHostComponent = getExpandedHostComponent(protocolType);
  return (
    <StaticIpHostsArray<FormViewHost>
      CollapsedHostComponent={CollapsedHostComponent}
      ExpandedHostComponent={ExpandedHostComponent}
      emptyHostData={emptyHost}
    />
  );
};
