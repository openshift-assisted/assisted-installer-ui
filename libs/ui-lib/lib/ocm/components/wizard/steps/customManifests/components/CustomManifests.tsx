import React from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../../../../common';
import { getFormViewManifestsValidationSchema } from './validationSchema';
import { CustomManifestsFormProps, CustomManifestFormState } from './propTypes';
import { getEmptyManifestsValues, getManifestValues } from './utils';
import { CustomManifestsForm } from './CustomManifestsForm';
import { ListManifestsExtended } from './types';

export const CustomManifests = ({
  cluster,
  onFormStateChange,
}: {
  cluster: Cluster;
  onFormStateChange: (formState: CustomManifestFormState) => void;
}) => {
  const { t } = useTranslation();
  const [formProps, setFormProps] = React.useState<CustomManifestsFormProps>();

  React.useEffect(() => {
    setFormProps({
      onFormStateChange: onFormStateChange,
      validationSchema: getFormViewManifestsValidationSchema(t),

      getInitialValues: (customManifests: ListManifestsExtended) => {
        return getManifestValues(customManifests);
      },
      getEmptyValues: () => getEmptyManifestsValues(),
      showEmptyValues: true,
      cluster: cluster,
    });
  }, [cluster, onFormStateChange, t]);

  if (!formProps) {
    return null;
  }

  return <CustomManifestsForm {...formProps} />;
};
