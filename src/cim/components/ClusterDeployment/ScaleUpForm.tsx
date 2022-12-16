import React from 'react';
import { useFormikContext } from 'formik';
import { Flex, FlexItem, Form, FormGroup } from '@patternfly/react-core';
import { getAgentsForSelection } from '../helpers/agents';
import { AgentK8sResource } from '../../types/k8s/agent';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import { ScaleUpFormValues } from './types';
import SwitchField from '../../../common/components/ui/formik/SwitchField';
import ClusterScaleUpAutoHostsSelection from './ClusterScaleUpAutoHostsSelection';
import { AgentTableActions } from '../ClusterDeployment/types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import RadioField from '../../../common/components/ui/formik/RadioField';

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
          ) && agent.status?.inventory.cpu?.architecture === values.cpuArchitecture,
      ),
    [agents, values.cpuArchitecture],
  );
  const { t } = useTranslation();
  return (
    <Form>
      <SwitchField name="autoSelectHosts" label={t('ai:Auto-select hosts')} />
      <FormGroup fieldId="cpuArchitecture" label={t('ai:CPU architecture')}>
        <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
          <FlexItem>
            <RadioField name="cpuArchitecture" id="x86_64" value="x86_64" label={t('ai:x86_64')} />
          </FlexItem>
          {/* <FlexItem spacer={{ default: 'spacer4xl' }} /> */}
          <FlexItem>
            <RadioField
              name="cpuArchitecture"
              id="arm64"
              value="arm64"
              label={<>{t('ai:arm64')}&nbsp;</>}
            />
          </FlexItem>
        </Flex>
      </FormGroup>

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
