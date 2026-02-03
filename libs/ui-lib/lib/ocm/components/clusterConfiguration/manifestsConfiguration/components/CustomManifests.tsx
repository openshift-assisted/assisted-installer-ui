import React from 'react';
import { ListManifestsExtended } from '../data/dataTypes';
import { CustomManifestsFormProps, CustomManifestFormState } from './propTypes';
import { getFormViewManifestsValidationSchema } from './customManifestsValidationSchema';
import { CustomManifestsForm } from './CustomManifestsForm';
import { getEmptyManifestsValues, getManifestValues } from './utils';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../../../common';

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
