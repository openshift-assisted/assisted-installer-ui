import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { Wizard, WizardStep, WizardStepFunctionType } from '@patternfly/react-core';
import { AlertsContextProvider, useAlerts } from '../AlertsContextProvider';
import { OpenshiftVersionOptionType } from '../../types';
import {
  ClusterDeploymentDetailsProps,
  ClusterDeploymentWizardProps,
  ClusterDeploymentWizardValues,
} from './types';
import ClusterDeploymentDetails from './ClusterDeploymentDetails';
import {
  getClusterDetailsInitialValues,
  getClusterDetailsValidationSchema,
} from '../clusterWizard/utils';

const getInitialValues = (
  versions: OpenshiftVersionOptionType[],
  defaultPullSecret?: string,
): ClusterDeploymentWizardValues => {
  // TODO(mlibra): update for other steps
  return getClusterDetailsInitialValues({
    cluster: undefined,
    pullSecret: defaultPullSecret,
    managedDomains: [], // not supported
    versions,
  });
};

const getValidationSchema = (usedClusterNames: string[]) => {
  // TODO(mlibra): update for other steps
  return getClusterDetailsValidationSchema(usedClusterNames);
};

const ClusterDeploymentWizardInternal: React.FC<
  ClusterDeploymentDetailsProps & { className?: string; onClose: () => void }
> = ({ className, ocpVersions, defaultPullSecret, onClose }) => {
  const { isValid, isValidating, isSubmitting, submitForm } = useFormikContext<
    ClusterDeploymentWizardValues
  >();

  const onSave = () => {
    // at the transition from the last step
    submitForm();
  };
  const onNext: WizardStepFunctionType = () => {
    // probably nothing to do here since we have canNextClusterDetails()
  };

  const onBack: WizardStepFunctionType = () => {
    // probably nothing to do here
  };

  const canNextClusterDetails = () => {
    // consider functions from wizardTransitions.ts
    return isValid && !isValidating && !isSubmitting;
  };

  const steps: WizardStep[] = [
    {
      id: 'cluster-details',
      name: 'Cluster details',
      component: (
        <ClusterDeploymentDetails defaultPullSecret={defaultPullSecret} ocpVersions={ocpVersions} />
      ),
      enableNext: canNextClusterDetails(),
    },
    {
      id: 'todo-next-wizard-step-id',
      name: 'Next step details',
      component: <div>FOO BAR</div>,
      enableNext: true,
    },
  ];

  return (
    <Wizard
      className={className}
      navAriaLabel="New cluster deployment steps"
      mainAriaLabel="New cluster deployment content"
      steps={steps}
      onClose={onClose}
      onNext={onNext}
      onBack={onBack}
      onSave={onSave}
    />
  );
};

const ClusterDeploymentWizard: React.FC<ClusterDeploymentWizardProps> = ({
  className,
  onClusterCreate,
  onClose,
  ocpVersions,
  defaultPullSecret,
  usedClusterNames,
}) => {
  const { addAlert, clearAlerts } = useAlerts();

  const handleSubmit = async (values: ClusterDeploymentWizardValues) => {
    clearAlerts();
    // const params: ClusterCreateParams = _.omit(values, ['useRedHatDnsService', 'SNODisclaimer']);
    try {
      await onClusterCreate(values);
      onClose();
    } catch (e) {
      addAlert({ title: 'Failed to create ClusterDeployment', message: e });
    }
  };

  const initialValues = React.useMemo(() => getInitialValues(ocpVersions, defaultPullSecret), [
    ocpVersions,
    defaultPullSecret,
  ]);
  const validationSchema = React.useMemo(() => getValidationSchema(usedClusterNames), [
    usedClusterNames,
  ]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnMount={true}
    >
      {() => (
        <ClusterDeploymentWizardInternal
          className={className}
          defaultPullSecret={defaultPullSecret}
          ocpVersions={ocpVersions}
          onClose={onClose}
        />
      )}
    </Formik>
  );
};

const ClusterDeploymentWizardWithContext: React.FC<ClusterDeploymentWizardProps> = (
  props: ClusterDeploymentWizardProps,
) => (
  <AlertsContextProvider>
    <ClusterDeploymentWizard {...props} />
  </AlertsContextProvider>
);

export default ClusterDeploymentWizardWithContext;
