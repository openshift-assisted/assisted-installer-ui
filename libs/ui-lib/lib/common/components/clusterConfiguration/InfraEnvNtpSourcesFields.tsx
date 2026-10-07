import React from 'react';
import { FormGroup, Radio, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { AdditionalNTPSourcesField } from '../ui/formik';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import './InfraEnvNtpSourcesFields.css';

type InfraEnvNtpSourcesFormValues = {
  useAdditionalNTPSources: boolean;
  additionalNTPSources: string;
  useNTPSources: boolean;
  ntpSources: string;
};

export const InfraEnvNtpSourcesFields: React.FC = () => {
  const { values, setValues } = useFormikContext<InfraEnvNtpSourcesFormValues>();
  const { t } = useTranslation();
  const isAutoNtp = !values.useAdditionalNTPSources && !values.useNTPSources;

  const selectAutoNtp = () => {
    setValues({
      ...values,
      useAdditionalNTPSources: false,
      useNTPSources: false,
      additionalNTPSources: '',
      ntpSources: '',
    });
  };

  const selectAdditionalNtp = () => {
    setValues({
      ...values,
      useAdditionalNTPSources: true,
      useNTPSources: false,
      ntpSources: '',
    });
  };

  const selectExclusiveNtp = () => {
    setValues({
      ...values,
      useAdditionalNTPSources: false,
      useNTPSources: true,
      additionalNTPSources: '',
    });
  };

  const ntpConfigurationRadioName = 'infra-env-ntp-configuration';

  return (
    <FormGroup
      fieldId="infra-env-ntp-sources"
      className="ai-infra-env-ntp-sources-fields"
      label={t('ai:NTP (Network Time Protocol) sources')}
    >
      <Stack hasGutter>
        <StackItem>
          <Radio
            id="infra-env-ntp-auto"
            name={ntpConfigurationRadioName}
            label={t('ai:Auto synchronized NTP sources')}
            isChecked={isAutoNtp}
            onChange={(_event, checked) => {
              if (checked) {
                selectAutoNtp();
              }
            }}
          />
        </StackItem>
        <StackItem>
          <Radio
            id="infra-env-ntp-additional"
            name={ntpConfigurationRadioName}
            label={t('ai:Your own NTP sources')}
            isChecked={values.useAdditionalNTPSources}
            onChange={(_event, checked) => {
              if (checked) {
                selectAdditionalNtp();
              }
            }}
            description={t(
              'ai:Configure your own NTP sources to synchronize the time between the hosts that will be added to this infrastructure environment.',
            )}
            body={
              values.useAdditionalNTPSources && (
                <AdditionalNTPSourcesField
                  name="additionalNTPSources"
                  helperText={t(
                    'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
                  )}
                />
              )
            }
          />
        </StackItem>
        <StackItem>
          <Radio
            id="infra-env-ntp-exclusive"
            name={ntpConfigurationRadioName}
            label={t('ai:Replace default NTP sources')}
            isChecked={values.useNTPSources}
            onChange={(_event, checked) => {
              if (checked) {
                selectExclusiveNtp();
              }
            }}
            description={t(
              'ai:Replaces default public NTP pools. Only the specified sources are used. Use in air-gapped or restricted networks where default pools are unreachable or not permitted.',
            )}
            body={
              values.useNTPSources && (
                <AdditionalNTPSourcesField
                  name="ntpSources"
                  helperText={t(
                    'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
                  )}
                  isRequired
                />
              )
            }
          />
        </StackItem>
      </Stack>
    </FormGroup>
  );
};
