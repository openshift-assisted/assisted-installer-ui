import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import ClusterDetailsFormFields from '../clusterWizard/ClusterDetailsFormFields';
import ClusterWizardStepHeader from '../clusterWizard/ClusterWizardStepHeader';
import { ClusterDetailsValues } from '../clusterWizard/types';
import { OpenshiftVersionOptionType } from '../../types';
import { Cluster } from '../../api';

const ClusterDeploymentDetails: React.FC<{
  defaultPullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
  cluster?: Cluster;
}> = ({ ocpVersions, defaultPullSecret, cluster }) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const toggleRedHatDnsService = () => {
    console.error(
      'toggleRedHatDnsService() should not be called, managedDomains are recently not used.',
    );
  };

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader cluster={undefined /* Intentional to hide Events */}>
          Cluster Details
        </ClusterWizardStepHeader>
      </GridItem>
      <GridItem span={12} lg={10} xl={9} xl2={7}>
        <ClusterDetailsFormFields
          toggleRedHatDnsService={toggleRedHatDnsService}
          versions={ocpVersions}
          defaultPullSecret={defaultPullSecret}
          canEditPullSecret={!cluster || !cluster.pullSecretSet}
          isSNOGroupDisabled={true}
          forceOpenshiftVersion={undefined}
          {...values}
        />
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentDetails;
