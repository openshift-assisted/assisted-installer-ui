import React from 'react';
import { useFormikContext } from 'formik';
import { Form } from '@patternfly/react-core';
import { getAgentsForSelection } from '../helpers/agents';
import { AgentK8sResource } from '../../types/k8s/agent';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import { ScaleUpFormValues } from './types';
import SwitchField from '../../../common/components/ui/formik/SwitchField';
import ClusterScaleUpAutoHostsSelection from './ClusterScaleUpAutoHostsSelection';
import { AgentTableActions } from '../ClusterDeployment/types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ScaleUpFormProps = {
  agents: AgentK8sResource[];
  onEditHost: AgentTableActions['onEditHost'];
};

const ScaleUpForm: React.FC<ScaleUpFormProps> = ({ agents, onEditHost }) => {
  const { values } = useFormikContext<ScaleUpFormValues>();
  const { autoSelectHosts } = values;
  const availableAgents = React.useMemo(
    () =>
      getAgentsForSelection(agents).filter(
        (agent) =>
          !(
            agent.spec?.clusterDeploymentName?.name || agent.spec?.clusterDeploymentName?.namespace
          ),
      ),
    [agents],
  );
  const { t } = useTranslation();
  return (
    <Form>
      <SwitchField name="autoSelectHosts" label={t('ai:Auto-select hosts')} />

      {autoSelectHosts && <ClusterScaleUpAutoHostsSelection availableAgents={availableAgents} />}

      {!autoSelectHosts && (
        <ClusterDeploymentHostsSelectionAdvanced<ScaleUpFormValues>
          availableAgents={availableAgents}
          onEditHost={onEditHost}
        />
      )}
    </Form>
  );
};

export default ScaleUpForm;
