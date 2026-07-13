import React from 'react';
import { Formik } from 'formik';
import { Grid, GridItem, useWizardContext } from '@patternfly/react-core';

import { useAlerts, ClusterWizardStepHeader, getRichTextValidation } from '../../../../common';

import { ClusterDeploymentDetailsStepProps, ClusterDeploymentDetailsValues } from '../types';
import { getOCPVersions } from '../../helpers';
import {
  ClusterDeploymentDetailsForm,
  ClusterDeploymentDetailsFormWrapper,
} from './ClusterDeploymentDetailsForm';
import { getGridSpans } from '../helpers';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { useDetailsFormik } from './useDetailsFormik';

export const ClusterDeploymentDetailsStep: React.FC<ClusterDeploymentDetailsStepProps> = ({
  clusterImages,
  clusterDeployment,
  agentClusterInstall,
  agents,
  usedClusterNames,
  onSaveDetails,
  isPreviewOpen,
  infraEnv,
  isNutanix,
}) => {
  const { t } = useTranslation();
  const { addAlert } = useAlerts();
  const { goToNextStep } = useWizardContext();

  const ocpVersions = getOCPVersions(clusterImages, isNutanix);
  const allOcpVersions = getOCPVersions(clusterImages, isNutanix, undefined, true);
  const gridSpans = getGridSpans(isPreviewOpen);

  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    ocpVersions,
    allOcpVersions,
    agentClusterInstall,
    agents,
    usedClusterNames,
    infraEnv,
  });

  const handleSubmit = async (values: ClusterDeploymentDetailsValues) => {
    try {
      await onSaveDetails(values);
      await goToNextStep();
    } catch (error) {
      addAlert({
        title: t('ai:Failed to save ClusterDeployment'),
        message: error as string,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={getRichTextValidation(validationSchema)}
      onSubmit={handleSubmit}
    >
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>Cluster Details</ClusterWizardStepHeader>
        </GridItem>
        <GridItem {...gridSpans}>
          <ClusterDeploymentDetailsFormWrapper>
            <ClusterDeploymentDetailsForm
              agentClusterInstall={agentClusterInstall}
              clusterDeployment={clusterDeployment}
              clusterImages={clusterImages}
              isNutanix={isNutanix}
            />
          </ClusterDeploymentDetailsFormWrapper>
        </GridItem>
      </Grid>
    </Formik>
  );
};
