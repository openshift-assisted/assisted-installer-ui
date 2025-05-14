import React from 'react';
import { Text, TextContent, TextVariants, Alert, Grid } from '@patternfly/react-core';

import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  CustomManifestFormState,
  CustomManifestsFormProps,
  getEmptyManifestsValues,
  getManifestValues,
  ListManifestsExtended,
} from '../../../../common';
import { CustomManifests } from './CustomManifests';
import { getFormViewManifestsValidationSchema } from './validationSchema';

export const CustomManifestsPage = ({
  cluster,
  onFormStateChange,
}: {
  cluster: Cluster;
  onFormStateChange(formState: CustomManifestFormState): void;
}) => {
  const [formProps, setFormProps] = React.useState<CustomManifestsFormProps>();

  React.useEffect(() => {
    setFormProps({
      onFormStateChange: onFormStateChange,
      validationSchema: getFormViewManifestsValidationSchema,

      getInitialValues: (customManifests: ListManifestsExtended) => {
        return getManifestValues(customManifests);
      },
      getEmptyValues: () => getEmptyManifestsValues(),
      showEmptyValues: true,
      cluster: cluster,
    });
  }, [cluster, onFormStateChange]);

  if (!formProps) {
    return null;
  }

  return (
    <Grid hasGutter>
      <TextContent>
        <Text component={TextVariants.h2}>Custom manifests</Text>
        <Text component={TextVariants.small}>
          Upload additional manifests that will be applied at the install time for advanced
          configuration of the cluster.
        </Text>
      </TextContent>
      <Alert
        isInline
        variant="warning"
        title={
          'No validation is performed for the custom manifest contents. Only include resources that are necessary for initial setup to reduce the chance of installation failures.'
        }
      />
      {formProps && <CustomManifests {...formProps} />}
    </Grid>
  );
};
