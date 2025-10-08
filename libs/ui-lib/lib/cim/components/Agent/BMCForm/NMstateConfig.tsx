import React from 'react';
import { useFormikContext } from 'formik';
import { Language } from '@patternfly/react-code-editor';
import { FormGroup } from '@patternfly/react-core';

import {
  CheckboxField,
  CodeField,
  InputField,
  IpConfigFields,
  MAX_VLAN_ID,
  MIN_VLAN_ID,
  PopoverIcon,
  ProtocolVersion,
  RadioField,
  StaticIpView,
  useTranslation,
} from '../../../../common';
import { AddBmcValues } from '../types';
import { MacMapping } from './MacMapping';

export const NMStateConfig = () => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<AddBmcValues>();

  return (
    <>
      <FormGroup label={t('ai:Configure via')} name="staticIPView" isInline isRequired>
        <RadioField name={'staticIPView'} value={StaticIpView.FORM} label={t('ai:Form view')} />
        <RadioField name={'staticIPView'} value={StaticIpView.YAML} label={t('ai:Yaml view')} />
      </FormGroup>

      {values.staticIPView === StaticIpView.FORM ? (
        <>
          <FormGroup label={t('ai:Networking stack type')} isInline isRequired>
            <RadioField name={'protocolType'} value={'ipv4'} label={t('ai:IPv4')} />
            <RadioField name={'protocolType'} value={'dualStack'} label={t('ai:Dual-stack')} />
          </FormGroup>

          <CheckboxField
            name={'useVlan'}
            label={
              <>
                {t('ai:Use VLAN')}{' '}
                <PopoverIcon
                  bodyContent={t('ai:If the hosts are in a sub network, enter the VLAN ID.')}
                  noVerticalAlign
                />
              </>
            }
            onChange={() => setFieldValue('vlanId', '')}
          />

          {values.useVlan === true && (
            <div className="pf-v5-u-ml-md">
              <InputField
                name={'vlanId'}
                label={t('ai:VLAN ID')}
                min={MIN_VLAN_ID}
                max={MAX_VLAN_ID}
              />
            </div>
          )}

          <InputField name={'dns'} label={t('ai:DNS')} />

          {values.protocolType === 'ipv4' ? (
            <IpConfigFields
              fieldName={`ipConfigs.${ProtocolVersion.ipv4}`}
              protocolVersion={ProtocolVersion.ipv4}
            />
          ) : (
            <>
              <IpConfigFields
                fieldName={`ipConfigs.${ProtocolVersion.ipv4}`}
                protocolVersion={ProtocolVersion.ipv4}
              />
              <IpConfigFields
                fieldName={`ipConfigs.${ProtocolVersion.ipv6}`}
                protocolVersion={ProtocolVersion.ipv6}
              />
            </>
          )}
        </>
      ) : (
        <CodeField
          label={t('ai:NMState')}
          name="nmState"
          language={Language.yaml}
          description={t(
            'ai:Upload a YAML file in NMstate format (not the entire NMstate config CR) that includes your network configuration (static IPs, bonds, etc.).',
          )}
        />
      )}
      <MacMapping />
    </>
  );
};
