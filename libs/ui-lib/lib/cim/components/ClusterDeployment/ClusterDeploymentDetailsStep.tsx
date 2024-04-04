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
import { getAICluster, getNetworkType, getOCPVersions } from '../helpers';
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
  infraEnv?: InfraEnvK8sResource;
  isNutanix: boolean;
};

export const useDetailsFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  clusterImages,
  usedClusterNames,
  infraEnv,
  isNutanix,
}: UseDetailsFormikArgs): [
  ClusterDetailsValues & { networkType: 'OpenShiftSDN' | 'OVNKubernetes' },
  Lazy<{ baseDnsDomain: string }>,
] => {
  const { t } = useTranslation();
  const featureSupportLevels = useFeatureSupportLevel();
  const ocpVersions = getOCPVersions(clusterImages, isNutanix);
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
    () => {
      const initValues = getClusterDetailsInitialValues({
        managedDomains: [], // not supported
        cluster,
        ocpVersions,
      });

      const ocpVersion = ocpVersions.find(
        (ocpVersion) => ocpVersion.value === initValues.openshiftVersion,
      );
      return {
        ...initValues,
        networkType: getNetworkType(ocpVersion),
      };
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const isEdit = !!clusterDeployment || !!agentClusterInstall;
  const validationSchema = React.useMemo(
    () =>
      getClusterDetailsValidationSchema({
        usedClusterNames,
        featureSupportLevels,
        pullSecretSet: isEdit,
        ocpVersions,
        validateUniqueName: true,
        t,
      }),
    [usedClusterNames, ocpVersions, featureSupportLevels, isEdit, t],
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
  isPreviewOpen,
  infraEnv,
  isNutanix,
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
    isNutanix,
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
                  isNutanix={isNutanix}
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
