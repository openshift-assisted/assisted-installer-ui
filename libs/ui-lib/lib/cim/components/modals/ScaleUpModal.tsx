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
import {
  getAgentSelectorFieldsFromAnnotations,
  getClusterDeploymentCpuArchitecture,
} from '../helpers/clusterDeployment';
import { AgentTableActions, ScaleUpFormValues } from '../ClusterDeployment/types';
import EditAgentModal from './EditAgentModal';
import { getAgentsHostsNames } from '../ClusterDeployment/helpers';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

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
  return Yup.lazy<ScaleUpFormValues>((values: ScaleUpFormValues) => {
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
  onChangeHostname: (agent: AgentK8sResource, hostname: string) => Promise<AgentK8sResource>;
  onSetInstallationDiskId: AgentTableActions['onSetInstallationDiskId'];
  isNutanix: boolean;
};

const ScaleUpModal: React.FC<ScaleUpModalProps> = ({
  isOpen,
  onClose,
  addHostsToCluster,
  clusterDeployment,
  agents,
  onChangeHostname,
  onSetInstallationDiskId,
  isNutanix,
}) => {
  const [editAgent, setEditAgent] = React.useState<AgentK8sResource | undefined>();
  const [error, setError] = React.useState<string | undefined>();

  const { t } = useTranslation();
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
      cpuArchitecture: getClusterDeploymentCpuArchitecture(clusterDeployment),
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
      setError(getErrorMessage(e));
    }
  };

  const clusterAgents = agents.filter(
    (a) =>
      a.spec.clusterDeploymentName?.name === clusterDeployment.metadata?.name &&
      a.spec.clusterDeploymentName?.namespace === clusterDeployment.metadata?.namespace,
  );
  return (
    <>
      <Modal
        aria-label={t('ai:Add worker host dialog')}
        title={t('ai:Add worker hosts')}
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
                      <ScaleUpForm
                        agents={agents}
                        onEditHost={setEditAgent}
                        onSetInstallationDiskId={onSetInstallationDiskId}
                        isNutanix={isNutanix}
                      />
                    </StackItem>
                    {error && (
                      <StackItem>
                        <Alert
                          title={t('ai:Failed to add hosts to the cluster')}
                          variant={AlertVariant.danger}
                          actionClose={
                            <AlertActionCloseButton onClose={() => setError(undefined)} />
                          }
                          isInline
                        >
                          {error}
                        </Alert>
                      </StackItem>
                    )}
                  </Stack>
                </ModalBoxBody>
                <ModalBoxFooter>
                  {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                  <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                    {t('ai:Submit')}
                  </Button>
                  <Button onClick={onClose} variant={ButtonVariant.secondary}>
                    {t('ai:Cancel')}
                  </Button>
                </ModalBoxFooter>
              </>
            );
          }}
        </Formik>
      </Modal>
      {editAgent && (
        <EditAgentModal
          agent={editAgent}
          isOpen
          onClose={() => setEditAgent(undefined)}
          onSave={onChangeHostname}
          usedHostnames={getAgentsHostsNames(clusterAgents)}
        />
      )}
    </>
  );
};

export default ScaleUpModal;
