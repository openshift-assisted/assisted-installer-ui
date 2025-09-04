import { Alert, AlertVariant, Grid, GridItem, Text } from '@patternfly/react-core';
import * as React from 'react';
import { CheckboxField, NumberInputField, PopoverIcon } from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../../types';
import { LabelSelectorGroup } from '../../ClusterDeployment/LabelsSelector';
import { useField } from 'formik';

type NodePoolAgentsFormProps = {
  agents: AgentK8sResource[];
  labelName: string;
  countName: string;
  maxAgents: number;
  isEdit?: boolean;
  autoscalingName: string;
  useAutoscalingName: string;
};

const NodePoolAgentsForm = ({
  agents,
  labelName,
  countName,
  autoscalingName,
  maxAgents,
  useAutoscalingName,
  isEdit = false,
}: NodePoolAgentsFormProps) => {
  const { t } = useTranslation();

  const [{ value: count }] = useField<number>(countName);
  const [{ value: minValue }] = useField<number>(`${autoscalingName}.minReplicas`);
  const [{ value: maxValue }] = useField<number>(`${autoscalingName}.maxReplicas`);
  const [{ value: useAutoscalingValue }] = useField<boolean>(useAutoscalingName);

  const helperText = (
    <>
      {t('ai:Maximum availability {{maxAgents}}', { maxAgents })}{' '}
      <PopoverIcon
        bodyContent={t(
          'ai:Maximum availability is based on the number of hosts available in a given namespace. The number changes dynamically depending on the filtering labels added above.',
        )}
      />
    </>
  );

  return (
    <Grid hasGutter>
      {!isEdit && (
        <GridItem>
          <LabelSelectorGroup agents={agents} name={labelName} />
        </GridItem>
      )}
      <GridItem>
        <CheckboxField name={useAutoscalingName} label={t('ai:Use autoscaling')} />
      </GridItem>
      {useAutoscalingValue ? (
        <>
          <GridItem>
            <NumberInputField
              name={`${autoscalingName}.minReplicas`}
              label={t('ai:Minimum number of hosts')}
              isRequired
              minValue={1}
              maxValue={maxValue}
            />
          </GridItem>
          <GridItem>
            <NumberInputField
              name={`${autoscalingName}.maxReplicas`}
              label={t('ai:Maximum number of hosts')}
              isRequired
              minValue={minValue || 1}
              helperText={helperText}
            />
          </GridItem>
        </>
      ) : (
        <>
          <GridItem>
            <NumberInputField
              label={t('ai:Number of hosts')}
              idPostfix="count"
              name={countName}
              isRequired
              minValue={0}
              helperText={helperText}
            />
          </GridItem>
        </>
      )}
      {(useAutoscalingValue ? maxValue : count) > maxAgents && (
        <GridItem>
          <Alert
            isInline
            variant={AlertVariant.warning}
            title={t('ai:Host count exceeds the current number of available hosts.')}
          >
            <Text>{t('ai:Scale down the nodepool or make more hosts available.')}</Text>
          </Alert>
        </GridItem>
      )}
    </Grid>
  );
};

export default NodePoolAgentsForm;
