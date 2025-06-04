import React from 'react';
import { Content, ContentVariants, Alert, Grid } from '@patternfly/react-core';

import { CustomManifests } from './components/CustomManifests';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CustomManifestFormState } from './components/propTypes';

export const CustomManifestsPage = ({
  cluster,
  onFormStateChange,
}: {
  cluster: Cluster;
  onFormStateChange(formState: CustomManifestFormState): void;
}) => (
  <Grid hasGutter>
    <Content>
      <Content component={ContentVariants.h2}>Custom manifests</Content>
      <Content component={ContentVariants.small}>
        Upload additional manifests that will be applied at the install time for advanced
        configuration of the cluster.
      </Content>
    </Content>
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
