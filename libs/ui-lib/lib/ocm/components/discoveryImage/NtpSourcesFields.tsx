import React from 'react';
import { Grid } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { AdditionalNTPSourcesField, CheckboxField, useTranslation } from '../../../common';

export type NtpSourcesFieldsType = {
  enableNtpSources: boolean;
  ntpSourcesList: string;
};

export const NtpSourcesFields: React.FC = () => {
  const { values } = useFormikContext<NtpSourcesFieldsType>();
  const { t } = useTranslation();

  return (
    <CheckboxField
      label={t('ai:Replace default NTP sources')}
      name="enableNtpSources"
      className="ai-ntp-sources-fields"
      helperText={t(
        'ai:Replaces default public NTP pools. Only the specified sources are used. Use in air-gapped or restricted networks where default pools are unreachable or not permitted.',
      )}
      body={
        values.enableNtpSources && (
          <Grid hasGutter>
            <AdditionalNTPSourcesField
              name="ntpSourcesList"
              label={t('ai:NTP sources')}
              helperText={t(
                'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
              )}
              isRequired
            />
          </Grid>
        )
      }
    />
  );
};
