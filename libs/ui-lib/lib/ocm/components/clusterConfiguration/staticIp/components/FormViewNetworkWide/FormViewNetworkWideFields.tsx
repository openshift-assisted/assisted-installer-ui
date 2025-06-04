import React from 'react';
import {
  Content,
  ContentVariants,
  Grid,
  FormGroup,
  TextInputTypes,
  Alert,
  AlertVariant,
  Flex,
  FlexItem,
  ButtonVariant,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import {
  ConfirmationModal,
  getFieldId,
  getHumanizedSubnetRange,
  PopoverIcon,
} from '../../../../../../common';
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
import { OcmCheckboxField, OcmInputField, OcmRadioField } from '../../../../ui/OcmFormFields';

import '../staticIp.css';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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
  const fieldId = getFieldId(`${fieldName}`, 'input');
  return (
    <FormGroup
      labelHelp={
        <PopoverIcon noVerticalAlign bodyContent="The range of IP addresses of the hosts." />
      }
      label="Machine network"
      fieldId={fieldId}
      isRequired
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
      {(errorMessage || machineNetworkHelptext) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage ? <ExclamationCircleIcon /> : null}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : machineNetworkHelptext}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
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

const ipv6ValuesEmpty = (values: FormViewNetworkWideValues) =>
  values.ipConfigs.ipv6.gateway === '' &&
  values.ipConfigs.ipv6.machineNetwork.ip === '' &&
  values.ipConfigs.ipv6.machineNetwork.prefixLength === '';

export const ProtocolTypeSelect = () => {
  const selectFieldName = 'protocolType';
  const [{ value: protocolType }, , { setValue: setProtocolType }] =
    useField<StaticProtocolType>(selectFieldName);
  const [, , { setValue: setIpv6 }] = useField<IpConfig>(`ipConfigs.ipv6`);
  const [openConfirmModal, setConfirmModal] = React.useState(false);
  const { values } = useFormikContext<FormViewNetworkWideValues>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProtocolType = e.target.value as types.StaticProtocolType;
    if (newProtocolType === protocolType) {
      return;
    }
    if (newProtocolType === 'ipv4' && !ipv6ValuesEmpty(values)) {
      setConfirmModal(true);
    } else {
      //no need to empty ipv4, when switching back dual stack ipv4 remains as is
      setIpv6(getEmptyIpConfig());
      setProtocolType(newProtocolType);
    }
  };
  const isIpv4Selected = protocolType === 'ipv4';
  return (
    <>
      <FormGroup
        fieldId={getFieldId(selectFieldName, 'radio')}
        isInline
        label="Networking stack type"
        isRequired
        onChange={onChange}
      >
        <OcmRadioField
          label={
            <>
              {getProtocolVersionLabel(ProtocolVersion.ipv4)}{' '}
              <PopoverIcon
                noVerticalAlign
                bodyContent="Select this when your hosts are using only IPv4."
              />
            </>
          }
          name={selectFieldName}
          data-testid="select-ipv4"
          id="select-ipv4"
          value="ipv4"
          isChecked={isIpv4Selected}
          callFormikOnChange={false}
        />
        <OcmRadioField
          label={
            <>
              {'Dual-stack'}{' '}
              <PopoverIcon
                noVerticalAlign
                bodyContent="Select dual-stack when your hosts are using IPV4 together with IPV6."
              />
            </>
          }
          name={selectFieldName}
          data-testid="select-dual-stack"
          id="select-dual-stack"
          value="dualStack"
          isChecked={!isIpv4Selected}
          callFormikOnChange={false}
        />
      </FormGroup>

      {openConfirmModal && (
        <ConfirmationModal
          title={'Change networking stack type?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={
            <>
              <p>All data and configuration done for 'Dual Stack' will be lost.</p>
            </>
          }
          onClose={() => {
            setConfirmModal(false);
            setProtocolType('dualStack');
          }}
          onConfirm={() => {
            setConfirmModal(false);
            setProtocolType('ipv4');
          }}
        />
      )}
    </>
  );
};
export const FormViewNetworkWideFields = ({ hosts }: { hosts: FormViewHost[] }) => {
  const { values, setFieldValue } = useFormikContext<FormViewNetworkWideValues>();
  return (
    <>
      <Content>
        <Content component={ContentVariants.h3}>Network-wide configurations</Content>
        <Content component={ContentVariants.small}>
          The following configurations are applicable to all the hosts.
        </Content>
      </Content>

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
