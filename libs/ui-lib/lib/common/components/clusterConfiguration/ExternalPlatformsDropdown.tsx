import React from 'react';
import { TFunction } from 'i18next';
import { useField, useFormikContext } from 'formik';
import { PlatformType } from '@openshift-assisted/types/./assisted-installer-service';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { ClusterDetailsValues } from '../clusterWizard';
import { SelectField, StaticTextField } from '../ui';

const getPlatforms = (t: TFunction): { [key in PlatformType]: string } => ({
  none: t('ai:No platform integration'),
  baremetal: t('ai:Bare metal'),
  nutanix: t('ai:Nutanix'),
  vsphere: t('ai:vSphere'),
  external: t('ai:External cloud provider'),
});

export const ExternalPlatformsDropdown = ({ isEditFlow }: { isEditFlow: boolean }) => {
  const { values, setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const [{ value }] = useField<PlatformType>('platform');

  const { t } = useTranslation();
  const platformLabels = getPlatforms(t);

  const options = Object.entries(platformLabels).map(([value, label]) => ({ value, label }));

  React.useEffect(() => {
    if (['none', 'external'].includes(value) && !values.userManagedNetworking) {
      setFieldValue('userManagedNetworking', true);
    } else if (!['none', 'external'].includes(value) && values.userManagedNetworking) {
      setFieldValue('userManagedNetworking', false);
    }
  }, [setFieldValue, value, values.userManagedNetworking]);

  return isEditFlow ? (
    <StaticTextField
      name={'platform'}
      label={t('ai:Integrate with external partner platforms')}
      isRequired
    >
      {platformLabels[value]}
    </StaticTextField>
  ) : (
    <SelectField
      label={t('ai:Integrate with external partner platforms')}
      options={options}
      name={'platform'}
      isRequired
    />
  );
};
