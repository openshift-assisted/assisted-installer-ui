import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getFormikErrorFields, labelsToArray, useAlerts } from '../../../common';
import { AgentK8sResource, ClusterDeploymentK8sResource } from '../../types';
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
import { getLocationsFormMatchExpressions } from '../helpers';

const getInitialValues = ({
  clusterDeployment,
}: {
  clusterDeployment: ClusterDeploymentK8sResource;
  // agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
}): ClusterDeploymentHostsSelectionValues => ({
  hostCount: 3, // agents.length, // TODO(mlibra): it can not be agents.length since that is an user's requirement which does not need to match reality of k8s resources
  useMastersAsWorkers: true, // TODO: read but where from?
  agentLabels: labelsToArray(
    clusterDeployment.spec?.platform?.agentBareMetal?.agentSelector?.matchLabels,
  ),
  locations: getLocationsFormMatchExpressions(
    clusterDeployment.spec?.platform?.agentBareMetal?.agentSelector?.matchExpressions,
  ),
});

const getValidationSchema = () =>
  Yup.object().shape({
    hostCount: hostCountValidationSchema,
    useMastersAsWorkers: Yup.boolean().required(),
    agentLabels: hostLabelsValidationSchema.required(),
    locations: Yup.array().min(0),
  });
const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  // agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
  ...props
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const initialValues = React.useMemo(
    () => getInitialValues({ clusterDeployment, agents }),
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

        console.log(
          '--- ClusterDeploymentWizardFooter: isValid: ',
          isValid,
          ', isValidating: ',
          isValidating,
          ', isSubmitting: ',
          isSubmitting,
          ', dirty: ',
          dirty,
          ', touched: ',
          touched,
          ', errors: ',
          errors,
        );

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
