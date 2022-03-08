import React from 'react';
import { Formik } from 'formik';
import { Lazy } from 'yup';
import { Grid, GridItem } from '@patternfly/react-core';

import {
  useAlerts,
  getClusterDetailsInitialValues,
  getClusterDetailsValidationSchema,
  ClusterWizardStepHeader,
  ClusterDetailsValues,
  useFeatureSupportLevel,
} from '../../../common';

import { ClusterDeploymentDetailsStepProps, ClusterDeploymentDetailsValues } from './types';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import { getAICluster, getOCPVersions } from '../helpers';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { isCIMFlow, getGridSpans } from './helpers';

type UseDetailsFormikArgs = {
  clusterImages: ClusterImageSetK8sResource[];
  usedClusterNames: string[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  defaultBaseDomain?: string;
  pullSecret?: string;
};

export const useDetailsFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  usedClusterNames,
  defaultBaseDomain,
  pullSecret,
}: UseDetailsFormikArgs): [ClusterDetailsValues, Lazy] => {
  const featureSupportLevels = useFeatureSupportLevel();
  const ocpVersions = getOCPVersions(clusterImages);
  const cluster = React.useMemo(
    () =>
      clusterDeployment && agentClusterInstall
        ? getAICluster({
            clusterDeployment,
            agentClusterInstall,
            agents,
          })
        : undefined,
    [agentClusterInstall, clusterDeployment, agents],
  );
  const initialValues = React.useMemo(
    () =>
      getClusterDetailsInitialValues({
        managedDomains: [], // not supported
        cluster,
        ocpVersions,
        baseDomain: defaultBaseDomain,
        pullSecret,
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(
    () =>
      getClusterDetailsValidationSchema(usedClusterNames, featureSupportLevels, true, ocpVersions),
    [usedClusterNames, ocpVersions, featureSupportLevels],
  );

  return [initialValues, validationSchema];
};

const ClusterDeploymentDetailsStep: React.FC<ClusterDeploymentDetailsStepProps> = ({
  clusterImages,
  clusterDeployment,
  agentClusterInstall,
  agents,
  usedClusterNames,
  onSaveDetails,
  onClose,
  pullSecret,
  isPreviewOpen,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    clusterImages,
    usedClusterNames,
  });

  const next = () =>
    isCIMFlow(clusterDeployment)
      ? setCurrentStepId('hosts-selection')
      : setCurrentStepId('hosts-discovery');

  const handleSubmit = async (values: ClusterDeploymentDetailsValues) => {
    try {
      await onSaveDetails(values);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save ClusterDeployment',
        message: error as string,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, isValidating, dirty }) => {
        const handleOnNext = () => {
          if (dirty) {
            submitForm();
          } else {
            next();
          }
        };

        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={handleOnNext}
            onCancel={onClose}
          />
        );

        const gridSpans = getGridSpans(isPreviewOpen);

        return (
          <ClusterDeploymentWizardStep footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Cluster Details</ClusterWizardStepHeader>
              </GridItem>
              <GridItem {...gridSpans}>
                <ClusterDeploymentDetailsForm
                  agentClusterInstall={agentClusterInstall}
                  clusterDeployment={clusterDeployment}
                  clusterImages={clusterImages}
                  pullSecret={pullSecret}
                />
              </GridItem>
            </Grid>
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentDetailsStep;
