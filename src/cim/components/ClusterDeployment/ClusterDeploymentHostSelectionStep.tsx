import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getFormikErrorFields, labelsToArray, useAlerts } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
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
  masterLabels: labelsToArray(
    clusterDeployment.spec?.platform.agentBareMetal.agentSelector?.matchLabels,
  ),
  workerLabels: labelsToArray({
    /* TODO(mlibra): wait for late-binding to be ready - API is about to be changed */
  }),
  autoSelectMasters: true, // TODO: read
});

const getValidationSchema = () =>
  Yup.lazy<Pick<ClusterDeploymentHostsSelectionValues, 'autoSelectMasters'>>(
    ({ autoSelectMasters }) =>
      Yup.object().shape({
        hostCount: hostCountValidationSchema,
        useMastersAsWorkers: Yup.boolean().required(),
        masterLabels: hostLabelsValidationSchema.required(),
        workerLabels: autoSelectMasters
          ? hostLabelsValidationSchema.required()
          : hostLabelsValidationSchema,
        autoSelectMasters: Yup.boolean().required(),
      }),
  );

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
  ...props
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

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
            <ClusterDeploymentHostsSelection {...props} />
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
