import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getFormikErrorFields, useAlerts } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterCIMExtended,
  ClusterDeploymentK8sResource,
} from '../../types';
import { labelsToArray } from '../helpers';

import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import ClusterDeploymentHostsSelection from './ClusterDeploymentHostsSelection';
import {
  ClusterDeploymentHostSelectionStepProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { hostCountValidationSchema, hostLabelsValidationSchema } from './validationSchemas';

const getInitialValues = ({
  clusterDeployment,
  // agentClusterInstall,
  agents,
}: {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
}): ClusterDeploymentHostsSelectionValues => ({
  hostCount: agents.length,
  useMastersAsWorkers: true, // TODO: calculate
  labels: labelsToArray(clusterDeployment.spec?.platform.agentBareMetal.agentSelector?.matchLabels),
  autoSelectMasters: true, // TODO: read
});

const getValidationSchema = () =>
  Yup.object({
    hostCount: hostCountValidationSchema,
    useMastersAsWorkers: Yup.boolean().required(),
    labels: hostLabelsValidationSchema,
    autoSelectMasters: Yup.boolean().required(),
  });

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  // cluster,
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  // TODO(mlibra): avoid "cluster" in favor of direct resources
  const initialValues = React.useMemo(
    () => getInitialValues({ clusterDeployment, agentClusterInstall, agents }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(() => getValidationSchema(), []);

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (values: ClusterDeploymentHostsSelectionValues) => {
    try {
      await onSaveHostsSelection(values);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
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
            onBack={() => setCurrentStepId('cluster-details')}
            onCancel={onClose}
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <ClusterDeploymentHostsSelection />
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
