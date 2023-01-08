import { Grid, GridItem } from '@patternfly/react-core';
import * as React from 'react';
import { NumberInputField, PopoverIcon } from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../../types';
import { LabelSelectorGroup } from '../../ClusterDeployment/LabelsSelector';

type NodePoolAgentsFormProps = {
  agents: AgentK8sResource[];
  labelName: string;
  countName: string;
  maxAgents: number;
};

const NodePoolAgentsForm = ({
  agents,
  labelName,
  countName,
  maxAgents,
}: NodePoolAgentsFormProps) => {
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <GridItem>
        <LabelSelectorGroup agents={agents} name={labelName} />
      </GridItem>
      <GridItem>
        <NumberInputField
          label={t('ai:Number of hosts')}
          idPostfix="count"
          name={countName}
          isRequired
          minValue={0}
          maxValue={maxAgents}
          helperText={
            <>
              {t('ai:Maximum availability {{maxAgents}}', { maxAgents })}{' '}
              <PopoverIcon
                bodyContent={t(
                  'ai:Maximum availability is based on the number of hosts available in a given namespace. The number changes dynamically depending on the filtering labels added above.',
                )}
              />
            </>
          }
        />
      </GridItem>
    </Grid>
  );
};

export default NodePoolAgentsForm;
