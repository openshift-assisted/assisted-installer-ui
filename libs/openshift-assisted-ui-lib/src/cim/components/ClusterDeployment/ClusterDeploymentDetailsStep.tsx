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
  getRichTextValidation,
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
  InfraEnvK8sResource,
} from '../../types';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { isCIMFlow, getGridSpans } from './helpers';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type UseDetailsFormikArgs = {
  clusterImages: ClusterImageSetK8sResource[];
  usedClusterNames: string[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  defaultBaseDomain?: string;
  pullSecret?: string;
  infraEnv?: InfraEnvK8sResource;
};

export const useDetailsFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  usedClusterNames,
  defaultBaseDomain,
  pullSecret,
  infraEnv,
}: UseDetailsFormikArgs): [ClusterDetailsValues, Lazy] => {
  const { t } = useTranslation();
  const featureSupportLevels = useFeatureSupportLevel();
  const ocpVersions = getOCPVersions(clusterImages);
  const cluster = React.useMemo(
    () =>
      clusterDeployment && agentClusterInstall
        ? getAICluster({
            clusterDeployment,
            agentClusterInstall,
            agents,
            infraEnv,
          })
        : undefined,
    [agentClusterInstall, clusterDeployment, agents, infraEnv],
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
      getClusterDetailsValidationSchema({
        usedClusterNames,
        featureSupportLevels,
        pullSecretSet: true,
        ocpVersions,
        validateUniqueName: true,
        t,
      }),
    [usedClusterNames, ocpVersions, featureSupportLevels, t],
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
  infraEnv,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const { t } = useTranslation();
  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    clusterImages,
    usedClusterNames,
    infraEnv,
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
      {({ submitForm, isSubmitting, isValid, isValidating, dirty }) => {
        const handleOnNext = () => {
          if (dirty) {
            void submitForm();
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
