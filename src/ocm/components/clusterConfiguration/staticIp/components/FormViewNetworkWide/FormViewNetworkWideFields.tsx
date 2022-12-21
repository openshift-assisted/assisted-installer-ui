import React from 'react';
import {
  Text,
  TextVariants,
  FormSelectOptionProps,
  Grid,
  FormGroup,
  TextInputTypes,
  Alert,
  AlertVariant,
  TextContent,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import { getFieldId, getHumanizedSubnetRange, PopoverIcon } from '../../../../../../common';
import {
  getAddressObject,
  getProtocolVersionLabel,
  getShownProtocolVersions,
} from '../../data/protocolVersion';
import * as types from '../../data/dataTypes';
import { getEmptyIpConfig } from '../../data/emptyData';
import {
  Cidr,
  FormViewHost,
  FormViewNetworkWideValues,
  IpConfig,
  ProtocolVersion,
  StaticProtocolType,
} from '../../data/dataTypes';
import { getMachineNetworkCidr } from '../../data/machineNetwork';
import useFieldErrorMsg from '../../../../../../common/hooks/useFieldErrorMsg';
import {
  MIN_PREFIX_LENGTH,
  MAX_PREFIX_LENGTH,
  MAX_VLAN_ID,
  MIN_VLAN_ID,
} from './formViewNetworkWideValidationSchema';
import { OcmCheckboxField, OcmInputField, OcmSelectField } from '../../../../ui/OcmFormFields';

import '../staticIp.css';

const hostsConfiguredAlert = (
  <Alert
    variant={AlertVariant.warning}
    isInline={true}
    data-testid="hosts-configured-alert"
    title="If you edit the values and click Next, the earlier configurations will be replaced with the new values for all of the hosts."
  />
);

const MachineNetwork: React.FC<{ fieldName: string; protocolVersion: ProtocolVersion }> = ({
  fieldName,
  protocolVersion,
}) => {
  const [{ value }] = useField<Cidr>(fieldName);
  const ipFieldName = `${fieldName}.ip`;
  const prefixLengthFieldName = `${fieldName}.prefixLength`;
  const ipErrorMessage = useFieldErrorMsg({ name: ipFieldName });
  const prefixLengthErrorMessage = useFieldErrorMsg({ name: prefixLengthFieldName });
  const errorMessage = ipErrorMessage || prefixLengthErrorMessage;
  const machineNetworkHelptext = React.useMemo(() => {
    if (errorMessage) {
      return '';
    }
    const cidr = getMachineNetworkCidr(value);
    return getHumanizedSubnetRange(getAddressObject(cidr, protocolVersion));
  }, [value, protocolVersion, errorMessage]);
  return (
    <FormGroup
      labelIcon={
        <PopoverIcon noVerticalAlign bodyContent="The range of IP addresses of the hosts." />
      }
      label="Machine Network"
      fieldId={getFieldId(`${fieldName}`, 'input')}
      isRequired
      helperTextInvalid={errorMessage}
      validated={errorMessage ? 'error' : 'default'}
      helperText={machineNetworkHelptext}
      className="machine-network"
    >
      <Flex>
        <FlexItem spacer={{ default: 'spacerSm' }}>
          <OcmInputField
            name={`${fieldName}.ip`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-ip`}
            showErrorMessage={false}
          />
        </FlexItem>
        <FlexItem spacer={{ default: 'spacerSm' }}>{'/'}</FlexItem>
        <FlexItem>
          <OcmInputField
            name={`${fieldName}.prefixLength`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-prefix-length`}
            type={TextInputTypes.number}
            showErrorMessage={false}
            min={MIN_PREFIX_LENGTH}
            max={
              protocolVersion === ProtocolVersion.ipv4
                ? MAX_PREFIX_LENGTH.ipv4
                : MAX_PREFIX_LENGTH.ipv6
            }
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

const IpConfigFields: React.FC<{
  fieldName: string;
  protocolVersion: ProtocolVersion;
}> = ({ protocolVersion, fieldName }) => {
  return (
    <Grid hasGutter>
      <MachineNetwork fieldName={`${fieldName}.machineNetwork`} protocolVersion={protocolVersion} />
      <OcmInputField
        isRequired
        label="Default gateway"
        labelIcon={
          <PopoverIcon
            noVerticalAlign
            bodyContent="An IP address to where any IP packet should be forwarded in case there is no other routing rule configured for a destination IP."
          />
        }
        name={`${fieldName}.gateway`}
        data-testid={`${protocolVersion}-gateway`}
      />
    </Grid>
  );
};

const protocolVersionOptions: FormSelectOptionProps[] = [
  {
    label: getProtocolVersionLabel(ProtocolVersion.ipv4),
    value: 'ipv4',
  },
  {
    label: 'Dual Stack',
    value: 'dualStack',
  },
];

export const ProtocolTypeSelect = () => {
  const selectFieldName = 'protocolType';
  const [{ value: protocolType }, , { setValue: setProtocolType }] =
    useField<StaticProtocolType>(selectFieldName);
  const [, , { setValue: setIpv6 }] = useField<IpConfig>(`ipConfigs.ipv6`);
  const onChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const newProtocolType = e.currentTarget.value as types.StaticProtocolType;
    if (newProtocolType === protocolType) {
      return;
    }
    //no need to empty ipv4, when switching back dual stack ipv4 remains as is
    setIpv6(getEmptyIpConfig());
    setProtocolType(newProtocolType);
  };
  return (
    <OcmSelectField
      label="Internet protocol version"
      options={protocolVersionOptions}
      name={selectFieldName}
      callFormikOnChange={false}
      onChange={onChange}
      data-testid="select-protocol-version"
    />
  );
};
export const FormViewNetworkWideFields = ({ hosts }: { hosts: FormViewHost[] }) => {
  const { values, setFieldValue } = useFormikContext<FormViewNetworkWideValues>();
  return (
    <>
      <TextContent>
        <Text component={TextVariants.h3}>Network-wide configurations</Text>
        <Text component={TextVariants.small}>
          The following configurations are applicable to all the hosts.
        </Text>
      </TextContent>

      {hosts.length > 0 && hostsConfiguredAlert}

      <ProtocolTypeSelect />

      <OcmCheckboxField
        label={
          <>
            {'Use VLAN '}
            <PopoverIcon
              noVerticalAlign
              bodyContent="If the hosts are in a sub network, enter the VLAN ID."
            />
          </>
        }
        name="useVlan"
        data-testid="use-vlan"
        onChange={() => setFieldValue('vlanId', '')}
      />

      {values.useVlan && (
        <div className="vlan-id">
          <OcmInputField
            label="VLAN ID"
            name="vlanId"
            isRequired
            data-testid="vlan-id"
            min={MIN_VLAN_ID}
            max={MAX_VLAN_ID}
          />
        </div>
      )}

      <OcmInputField
        isRequired
        label="DNS"
        name={`dns`}
        data-testid={`dns`}
        helperText={'List of your DNS server addresses, separated by commas.'}
      />

      {getShownProtocolVersions(values.protocolType).map((protocolVersion) => (
        <FormGroup
          key={protocolVersion}
          label={getProtocolVersionLabel(protocolVersion)}
          fieldId={getFieldId(`ip-configs-${protocolVersion}`, 'input')}
        >
          <IpConfigFields
            fieldName={`ipConfigs.${protocolVersion}`}
            protocolVersion={protocolVersion}
          />
        </FormGroup>
      ))}
    </>
  );
};
