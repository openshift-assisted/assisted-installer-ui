import React from 'react';
import {
  Text,
  TextVariants,
  FormGroup,
  Alert,
  AlertVariant,
  TextContent,
  ButtonVariant,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import {
  ConfirmationModal,
  getFieldId,
  getProtocolVersionLabel,
  IpConfig,
  IpConfigFields,
  MIN_VLAN_ID,
  MAX_VLAN_ID,
  PopoverIcon,
  useTranslation,
  StaticProtocolType,
  ProtocolVersion,
} from '../../../../../../common';
import { getShownProtocolVersions } from '../../../../../../common/components/staticIP/protocolVersion';
import { getEmptyIpConfig } from '../../data/emptyData';
import { FormViewHost, FormViewNetworkWideValues } from '../../data/dataTypes';
import { OcmCheckboxField, OcmInputField, OcmRadioField } from '../../../../ui/OcmFormFields';
import { selectCurrentClusterPermissionsState } from '../../../../../store/slices/current-cluster/selectors';

import '../staticIp.css';

const hostsConfiguredAlert = (
  <Alert
    variant={AlertVariant.warning}
    isInline={true}
    data-testid="hosts-configured-alert"
    title="If you edit the values and click Next, the earlier configurations will be replaced with the new values for all of the hosts."
  />
);

const ipv6ValuesEmpty = (values: FormViewNetworkWideValues) =>
  values.ipConfigs.ipv6.gateway === '' &&
  values.ipConfigs.ipv6.machineNetwork.ip === '' &&
  values.ipConfigs.ipv6.machineNetwork.prefixLength === '';

export const ProtocolTypeSelect = () => {
  const { t } = useTranslation();
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
              {getProtocolVersionLabel(ProtocolVersion.ipv4, t)}{' '}
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
            setProtocolType(StaticProtocolType.dualStack);
          }}
          onConfirm={() => {
            setConfirmModal(false);
            setProtocolType(StaticProtocolType.ipv4);
          }}
        />
      )}
    </>
  );
};

export const FormViewNetworkWideFields = ({ hosts }: { hosts: FormViewHost[] }) => {
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
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
        <IpConfigFields
          fieldName={`ipConfigs.${protocolVersion}`}
          protocolVersion={protocolVersion}
          key={protocolVersion}
          isDisabled={isViewerMode}
        />
      ))}
    </>
  );
};
