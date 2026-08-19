import React from 'react';
import { Grid } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { CheckboxField } from '../ui';
import { AdditionalNTPSourcesField } from '../ui/formik';
import { NtpSourcesFieldsType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const NtpSourcesFields: React.FC = () => {
  const { setFieldValue, values, initialValues } = useFormikContext<NtpSourcesFieldsType>();
  const { t } = useTranslation();

  const resetNtpSources = (isChecked: boolean) => {
    if (isChecked) {
      setFieldValue('ntpSourcesList', initialValues.ntpSourcesList);
    } else {
      setFieldValue('ntpSourcesList', '');
    }
  };

  return (
    <CheckboxField
      label={t('ai:Replace default NTP sources')}
      name="enableNtpSources"
      className="ai-ntp-sources-fields"
      helperText={t(
        'ai:Replaces default public NTP pools. Only the specified sources are used. Use in air-gapped or restricted networks where default pools are unreachable or not permitted.',
      )}
      onChange={resetNtpSources}
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
