import React from 'react';
import { Text, TextContent, TextVariants, Alert, Grid } from '@patternfly/react-core';

import { CustomManifests } from './components/CustomManifests';
import { Cluster } from '../../../../common';
import { CustomManifestFormState } from './components/propTypes';

export const CustomManifestsPage = ({
  cluster,
  onFormStateChange: onFormStateChangeParent,
}: {
  cluster: Cluster;
  onFormStateChange(formState: CustomManifestFormState): void;
}) => {
  const onFormStateChange = (formState: CustomManifestFormState) => {
    const hasFilledData = !formState.isEmpty;
    hasFilledData && onFormStateChangeParent(formState);
  };

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
      <CustomManifests cluster={cluster} onFormStateChange={onFormStateChange} />
    </Grid>
  );
};
