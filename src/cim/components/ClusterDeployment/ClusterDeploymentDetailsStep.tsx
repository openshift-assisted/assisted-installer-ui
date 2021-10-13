import React from 'react';
import { Formik } from 'formik';
import { Lazy } from 'yup';
import { Grid, GridItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import {
  useAlerts,
  getFormikErrorFields,
  getClusterDetailsInitialValues,
  getClusterDetailsValidationSchema,
  ClusterWizardStepHeader,
  ClusterDetailsValues,
} from '../../../common';

import { ClusterDeploymentDetailsStepProps, ClusterDeploymentDetailsValues } from './types';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import { getAICluster, getOCPVersions } from '../helpers';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';

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
    () => getClusterDetailsValidationSchema(usedClusterNames, cluster, ocpVersions),
    [usedClusterNames, cluster, ocpVersions],
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
}) => {
  const { t } = useTranslation();
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    clusterImages,
    usedClusterNames,
  });

  const next = () => setCurrentStepId('hosts-selection');

  const handleSubmit = async (values: ClusterDeploymentDetailsValues) => {
    try {
      await onSaveDetails(values);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save ClusterDeployment',
        message: error,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, isValidating, dirty, errors, touched }) => {
        const handleOnNext = () => {
          if (dirty) {
            submitForm();
          } else {
            next();
          }
        };

        const footer = (
          <ClusterDeploymentWizardFooter
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={handleOnNext}
            onCancel={onClose}
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>{t('Cluster Details')}</ClusterWizardStepHeader>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
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
