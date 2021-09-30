import React from 'react';
import * as Yup from 'yup';
import {
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  Button,
  ButtonVariant,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { AgentK8sResource } from '../../types/k8s/agent';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import ScaleUpForm from '../ClusterDeployment/ScaleUpForm';
import { getAgentSelectorFieldsFromAnnotations } from '../helpers/clusterDeployment';
import { ScaleUpFormValues } from '../ClusterDeployment/types';

const getAgentsToAdd = (
  selectedHostIds: ScaleUpFormValues['selectedHostIds'] | ScaleUpFormValues['autoSelectedHostIds'],
  agents: AgentK8sResource[],
) =>
  agents.filter(
    (agent) =>
      selectedHostIds.includes(agent.metadata?.uid || '') &&
      !(agent.spec?.clusterDeploymentName?.name || agent.spec?.clusterDeploymentName?.namespace),
  );

const getValidationSchema = (agentsCount: number) => {
  return Yup.lazy<ScaleUpFormValues>((values) => {
    return Yup.object<ScaleUpFormValues>().shape({
      hostCount: Yup.number().min(1).max(agentsCount),
      autoSelectedHostIds: values.autoSelectHosts
        ? Yup.array<string>().min(1).max(agentsCount)
        : Yup.array<string>(),
      selectedHostIds: values.autoSelectHosts
        ? Yup.array<string>()
        : Yup.array<string>().min(1).max(agentsCount),
    });
  });
};

type ScaleUpModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  addHostsToCluster: (agentsToAdd: AgentK8sResource[]) => Promise<void>;
  clusterDeployment: ClusterDeploymentK8sResource;
  agents: AgentK8sResource[];
};

const ScaleUpModal = ({
  isOpen,
  onClose,
  addHostsToCluster,
  clusterDeployment,
  agents,
}: ScaleUpModalProps) => {
  const [error, setError] = React.useState<string | undefined>();

  const getInitialValues = (): ScaleUpFormValues => {
    const agentSelector = getAgentSelectorFieldsFromAnnotations(
      clusterDeployment?.metadata?.annotations,
    );

    const autoSelectHosts = agentSelector.autoSelect;
    return {
      autoSelectHosts,
      hostCount: 1,
      agentLabels: agentSelector.labels,
      locations: agentSelector.locations,
      selectedHostIds: [],
      autoSelectedHostIds: [],
    };
  };

  const validationSchema = React.useMemo(() => getValidationSchema(agents.length), [agents.length]);

  const handleSubmit: FormikConfig<ScaleUpFormValues>['onSubmit'] = async (values) => {
    const { autoSelectHosts, autoSelectedHostIds, selectedHostIds } = values;
    try {
      setError(undefined);
      const agentsToAdd = getAgentsToAdd(
        autoSelectHosts ? autoSelectedHostIds : selectedHostIds,
        agents,
      );
      await addHostsToCluster(agentsToAdd);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal
      aria-label="Add worker host dialog"
      title="Add worker hosts"
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="scale-up-modal"
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {({ isSubmitting, isValid, submitForm }: FormikProps<ScaleUpFormValues>) => {
          return (
            <>
              <ModalBoxBody>
                <Stack hasGutter>
                  <StackItem>
                    <ScaleUpForm agents={agents} />
                  </StackItem>
                  {error && (
                    <StackItem>
                      <Alert
                        title="Failed to add hosts to the cluster"
                        variant={AlertVariant.danger}
                        actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
                        isInline
                      >
                        {error}
                      </Alert>
                    </StackItem>
                  )}
                </Stack>
              </ModalBoxBody>
              <ModalBoxFooter>
                <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                  Submit
                </Button>
                <Button onClick={onClose} variant={ButtonVariant.secondary}>
                  Cancel
                </Button>
              </ModalBoxFooter>
            </>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default ScaleUpModal;
