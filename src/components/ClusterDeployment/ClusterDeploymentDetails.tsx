import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import ClusterDetailsFormFields from '../clusterWizard/ClusterDetailsFormFields';
import ClusterWizardStepHeader from '../clusterWizard/ClusterWizardStepHeader';
import { ClusterDetailsValues } from '../clusterWizard/types';
import { ClusterDeploymentDetailsProps } from './types';
import Alerts from '../ui/Alerts';

const ClusterDeploymentDetails: React.FC<ClusterDeploymentDetailsProps> = ({
  ocpVersions,
  defaultPullSecret,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const toggleRedHatDnsService = () => {
    console.error(
      'toggleRedHatDnsService() should not be called, managedDomains are recently not used.',
    );
  };

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader cluster={undefined}>Cluster Details</ClusterWizardStepHeader>
      </GridItem>
      <GridItem span={12} lg={10} xl={9} xl2={7}>
        <ClusterDetailsFormFields
          toggleRedHatDnsService={toggleRedHatDnsService}
          versions={ocpVersions}
          defaultPullSecret={defaultPullSecret}
          canEditPullSecret={true}
          isSNOGroupDisabled={true}
          forceOpenshiftVersion={undefined}
          {...values}
        />
      </GridItem>
      <GridItem>
        {/* TODO(mlibra): position it better */}
        <Alerts />
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentDetails;
