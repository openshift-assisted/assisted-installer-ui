import React from 'react';
import {
  Text,
  TextVariants,
  FormSelectOptionProps,
  Grid,
  GridItem,
  FormGroup,
  TextInputTypes,
  Alert,
  AlertVariant,
  TextContent,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  CheckboxField,
  getFieldId,
  getHumanizedSubnetRange,
  InputField,
  PopoverIcon,
  SelectField,
} from '../../../../../../common';
import { useField, useFormikContext } from 'formik';
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
import '../staticIp.css';
const hostsConfiguredAlert = (
  <Alert
    variant={AlertVariant.warning}
    isInline={true}
    data-testid="hosts-configured-alert"
    title="If you edit the values and click Next, the earlier configurations will be replaced with the new values for all of the hosts."
  ></Alert>
);

const MachineNetwork: React.FC<{ fieldName: string; protocolVersion: ProtocolVersion }> = ({
  fieldName,
  protocolVersion,
}) => {
  const [{ value }, { error }] = useField<Cidr>(fieldName);
  const machineNetworkHelptext = React.useMemo(() => {
    if (error) {
      return '';
    }
    const cidr = getMachineNetworkCidr(value);
    return getHumanizedSubnetRange(getAddressObject(cidr, protocolVersion));
  }, [value, protocolVersion, error]);
  return (
    <FormGroup
      labelIcon={
        <PopoverIcon noVerticalAlign bodyContent="The range of IP addresses of the hosts." />
      }
      label="Machine Network"
      fieldId={getFieldId(`${fieldName}`, 'input')}
      isRequired
    >
      <Flex>
        <FlexItem flex={{ default: 'flex_2' }} spacer={{ default: 'spacerSm' }}>
          <InputField
            name={`${fieldName}.ip`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-ip`}
            helperText={machineNetworkHelptext}
          />
        </FlexItem>
        <FlexItem spacer={{ default: 'spacerSm' }}>{'/'}</FlexItem>
        <FlexItem flex={{ default: 'flex_1' }}>
          <InputField
            name={`${fieldName}.prefixLength`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-prefix-length`}
            type={TextInputTypes.number}
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
      <GridItem span={6}>
        <MachineNetwork
          fieldName={`${fieldName}.machineNetwork`}
          protocolVersion={protocolVersion}
        />
      </GridItem>
      <InputField
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
      <InputField
        isRequired
        label="DNS"
        name={`${fieldName}.dns`}
        data-testid={`${protocolVersion}-dns`}
      />
    </Grid>
  );
};

const protocolVersionOptions: FormSelectOptionProps[] = [
  {
    label: getProtocolVersionLabel('ipv4'),
    value: 'ipv4',
  },
  {
    label: 'Dual Stack',
    value: 'dualStack',
  },
];

export const ProtocolTypeSelect: React.FC = () => {
  const selectFieldName = 'protocolType';
  const [{ value: protocolType }, , { setValue: setProtocolType }] = useField<StaticProtocolType>(
    selectFieldName,
  );
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
    <SelectField
      label="Internet protocol version"
      options={protocolVersionOptions}
      name={selectFieldName}
      callFormikOnChange={false}
      onChange={onChange}
      data-testid="select-protocol-version"
    />
  );
};
export const FormViewNetworkWideFields: React.FC<{ hosts: FormViewHost[] }> = ({ hosts }) => {
  const { values } = useFormikContext<FormViewNetworkWideValues>();
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

      <CheckboxField
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
      />

      {values.useVlan && (
        <div className="vlan-id">
          <InputField
            label="VLAN ID"
            name="vlanId"
            isRequired
            data-testid="vlan-id"
            type={TextInputTypes.number}
          />
        </div>
      )}
      {getShownProtocolVersions(values.protocolType).map((protocolVersion) => (
        <FormGroup
          key={protocolVersion}
          label={getProtocolVersionLabel(protocolVersion)}
          fieldId={getFieldId(`ip-configs-${protocolVersion}`, 'input')}
        >
          <IpConfigFields
            fieldName={`ipConfigs.${protocolVersion}`}
            protocolVersion={protocolVersion}
          ></IpConfigFields>
        </FormGroup>
      ))}
    </>
  );
};
