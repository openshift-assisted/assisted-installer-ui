import React from 'react';
import { FormGroup, Grid } from '@patternfly/react-core';

import { getFieldId, InputField, PopoverIcon } from '../ui';
import { MachineNetworkField } from './MachineNetworkField';
import { ProtocolVersion } from './types';
import { useTranslation } from '../../hooks';
import { TFunction } from 'react-i18next';

export const getProtocolVersionLabel = (protocolVersion: ProtocolVersion, t: TFunction) =>
  protocolVersion === ProtocolVersion.ipv4 ? t('ai:IPv4') : t('ai:IPv6');

export const IpConfigFields: React.FC<{
  fieldName: string;
  protocolVersion: ProtocolVersion;
}> = ({ protocolVersion, fieldName }) => {
  const { t } = useTranslation();

  return (
    <FormGroup
      label={getProtocolVersionLabel(protocolVersion, t)}
      fieldId={getFieldId(`ip-configs-${protocolVersion}`, 'input')}
    >
      <Grid hasGutter>
        <MachineNetworkField
          fieldName={`${fieldName}.machineNetwork`}
          protocolVersion={protocolVersion}
          isDisabled={false} // todo
        />
        <InputField
          isRequired
          isDisabled={false} //todo
          label={t('ai:Default gateway')}
          labelIcon={
            <PopoverIcon
              noVerticalAlign
              bodyContent={t(
                'ai:An IP address to where any IP packet should be forwarded in case there is no other routing rule configured for a destination IP.',
              )}
            />
          }
          name={`${fieldName}.gateway`}
          data-testid={`${protocolVersion}-gateway`}
        />
      </Grid>
    </FormGroup>
  );
};
