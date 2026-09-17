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
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useField, useFormikContext } from 'formik';
import {
  ConfirmationModal,
  getFieldId,
  getHumanizedSubnetRange,
  PopoverIcon,
  useFieldErrorMsg,
} from '../../../../../../../common';
import {
  OcmCheckboxField,
  OcmInputField,
  OcmRadio,
  OcmRadioField,
} from '../../../../../ui/OcmFormFields';
import {
  getAddressObject,
  getProtocolVersionLabel,
  getShownProtocolVersions,
  getEmptyIpConfig,
  Cidr,
  FormViewHost,
  FormViewNetworkWideValues,
  IpConfig,
  ProtocolVersion,
  StaticProtocolType,
  getMachineNetworkCidr,
  DISCONNECTED_SINGLE_STACK_FIELD,
} from '../../data';
import { detectProtocolVersionFromIp } from '../../commonValidationSchemas';
import {
  MIN_PREFIX_LENGTH,
  MAX_PREFIX_LENGTH,
  MAX_VLAN_ID,
  MIN_VLAN_ID,
} from './formViewNetworkWideValidationSchema';
import { useClusterWizardContext } from '../../../../clusterWizardContext';

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
  const fieldId = getFieldId(`${fieldName}`, 'input');
  return (
    <FormGroup
      labelHelp={
        <PopoverIcon noVerticalAlign bodyContent="The range of IP addresses of the hosts." />
      }
      label="Subnet"
      fieldId={fieldId}
      isRequired
      className="subnet"
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
              data-testid={`input-machine-network-${fieldId}-helper-text`}
            >
              {errorMessage ? errorMessage : machineNetworkHelptext}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

const SingleStackMachineNetwork: React.FC<{ fieldName: string }> = ({ fieldName }) => {
  const [{ value }] = useField<Cidr>(fieldName);
  const ipFieldName = `${fieldName}.ip`;
  const prefixLengthFieldName = `${fieldName}.prefixLength`;
  const ipErrorMessage = useFieldErrorMsg({ name: ipFieldName });
  const prefixLengthErrorMessage = useFieldErrorMsg({ name: prefixLengthFieldName });
  const errorMessage = ipErrorMessage || prefixLengthErrorMessage;
  const protocolVersion = detectProtocolVersionFromIp(value.ip) ?? ProtocolVersion.ipv4;
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
      label="Subnet"
      fieldId={fieldId}
      isRequired
      className="subnet"
    >
      <Flex>
        <FlexItem spacer={{ default: 'spacerSm' }}>
          <OcmInputField
            name={`${fieldName}.ip`}
            isRequired={true}
            data-testid="single-stack-machine-network-ip"
            showErrorMessage={false}
          />
        </FlexItem>
        <FlexItem spacer={{ default: 'spacerSm' }}>{'/'}</FlexItem>
        <FlexItem>
          <OcmInputField
            name={`${fieldName}.prefixLength`}
            isRequired={true}
            data-testid="single-stack-machine-network-prefix-length"
            type={TextInputTypes.number}
            showErrorMessage={false}
            min={MIN_PREFIX_LENGTH}
            max={MAX_PREFIX_LENGTH.ipv6}
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
              data-testid={`input-machine-network-${fieldId}-helper-text`}
            >
              {errorMessage ? errorMessage : machineNetworkHelptext}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

const SingleStackIpConfigFields: React.FC<{ fieldName: string }> = ({ fieldName }) => {
  return (
    <Grid hasGutter>
      <SingleStackMachineNetwork fieldName={`${fieldName}.machineNetwork`} />
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
        data-testid="single-stack-gateway"
      />
    </Grid>
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

const ConnectedProtocolTypeSelect = () => {
  const selectFieldName = 'protocolType';
  const [{ value: protocolType }, , { setValue: setProtocolType }] =
    useField<StaticProtocolType>(selectFieldName);
  const [, , { setValue: setIpv6 }] = useField<IpConfig>(`ipConfigs.ipv6`);
  const [openConfirmModal, setConfirmModal] = React.useState(false);
  const { values } = useFormikContext<FormViewNetworkWideValues>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProtocolType = e.target.value as StaticProtocolType;
    if (newProtocolType === protocolType) {
      return;
    }
    if (newProtocolType === 'ipv4' && !ipv6ValuesEmpty(values)) {
      setConfirmModal(true);
    } else {
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
            setIpv6(getEmptyIpConfig());
            setProtocolType('ipv4');
          }}
        />
      )}
    </>
  );
};

const DisconnectedProtocolTypeSelect = () => {
  const selectFieldName = 'protocolType';
  const [{ value: protocolType }, , { setValue: setProtocolType }] =
    useField<StaticProtocolType>(selectFieldName);
  const [, , { setValue: setIpv6 }] = useField<IpConfig>(`ipConfigs.ipv6`);
  const [openConfirmModal, setConfirmModal] = React.useState(false);
  const { values } = useFormikContext<FormViewNetworkWideValues>();

  const isDualStack = protocolType === 'dualStack';
  const singleStackRadioId = getFieldId(selectFieldName, 'radio', 'singleStack');
  const dualStackRadioId = getFieldId(selectFieldName, 'radio', 'dualStack');

  const switchToSingleStack = () => {
    if (protocolType !== 'dualStack') {
      return;
    }
    if (!ipv6ValuesEmpty(values)) {
      setConfirmModal(true);
      return;
    }
    setIpv6(getEmptyIpConfig());
    setProtocolType('ipv4');
  };

  const switchToDualStack = () => {
    if (protocolType === 'dualStack') {
      return;
    }
    setProtocolType('dualStack');
  };

  return (
    <>
      <FormGroup
        fieldId={getFieldId(selectFieldName, 'radio')}
        isInline
        label="Networking stack type"
        isRequired
      >
        <OcmRadio
          id={singleStackRadioId}
          name={`${selectFieldName}-stack-level`}
          data-testid="select-single-stack"
          label={
            <>
              {'Single stack\u00A0'}
              <PopoverIcon
                noVerticalAlign
                bodyContent="Use either IPv4 or IPv6 for all network-wide and host addresses. The address family is determined from the subnet you enter below."
              />
            </>
          }
          isChecked={!isDualStack}
          onChange={() => switchToSingleStack()}
        />
        <OcmRadio
          id={dualStackRadioId}
          name={`${selectFieldName}-stack-level`}
          data-testid="select-dual-stack"
          label={
            <>
              {'Dual-stack'}{' '}
              <PopoverIcon
                noVerticalAlign
                bodyContent="Select dual-stack when your hosts are using IPV4 together with IPV6."
              />
            </>
          }
          isChecked={isDualStack}
          onChange={() => switchToDualStack()}
        />
      </FormGroup>

      {openConfirmModal && (
        <ConfirmationModal
          title={'Change networking stack type?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={<p>All data and configuration done for &apos;Dual-stack&apos; will be lost.</p>}
          onClose={() => setConfirmModal(false)}
          onConfirm={() => {
            setConfirmModal(false);
            setIpv6(getEmptyIpConfig());
            setProtocolType('ipv4');
          }}
        />
      )}
    </>
  );
};

export const ProtocolTypeSelect = () => {
  const { installDisconnected } = useClusterWizardContext();
  if (installDisconnected) {
    return <DisconnectedProtocolTypeSelect />;
  }
  return <ConnectedProtocolTypeSelect />;
};
const getIpConfigSectionLabel = (
  protocolVersion: ProtocolVersion,
  protocolType: StaticProtocolType,
  installDisconnected: boolean,
): string => {
  if (installDisconnected && protocolType !== 'dualStack') {
    return 'Single stack';
  }
  return getProtocolVersionLabel(protocolVersion);
};

export const FormViewNetworkWideFields = ({ hosts }: { hosts: FormViewHost[] }) => {
  const { installDisconnected } = useClusterWizardContext();
  const { values, setFieldValue } = useFormikContext<FormViewNetworkWideValues>();
  const isDisconnectedSingleStack = installDisconnected && values.protocolType !== 'dualStack';

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

      {isDisconnectedSingleStack ? (
        <FormGroup label="Single stack" fieldId={getFieldId('ip-configs-single-stack', 'input')}>
          <SingleStackIpConfigFields fieldName={`ipConfigs.${DISCONNECTED_SINGLE_STACK_FIELD}`} />
        </FormGroup>
      ) : (
        getShownProtocolVersions(values.protocolType).map((protocolVersion) => (
          <FormGroup
            key={protocolVersion}
            label={getIpConfigSectionLabel(
              protocolVersion,
              values.protocolType,
              installDisconnected,
            )}
            fieldId={getFieldId(`ip-configs-${protocolVersion}`, 'input')}
          >
            <IpConfigFields
              fieldName={`ipConfigs.${protocolVersion}`}
              protocolVersion={protocolVersion}
            />
          </FormGroup>
        ))
      )}
    </>
  );
};
