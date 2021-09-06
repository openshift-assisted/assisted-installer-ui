import React from 'react';
import * as _ from 'lodash';
import { MultiSelectField } from '../../../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';

const LabelsSelector: React.FC<{ agents: AgentK8sResource[] }> = ({ agents }) => {
  const agentLabelOptions = Array.from(
    new Set(
      _.flatten(
        agents.map((agent) =>
          Object.keys(agent.metadata?.labels || {}).map(
            (k) => `${k}=${agent.metadata?.labels?.[k]}`,
          ),
        ),
      ),
    ),
  ).map<MultiSelectOption>((value) => ({
    // Why is that bloody prop set as mandatory in the SelectOptionProps??
    isLastOptionBeforeFooter: (index: number): boolean => index === value.length,
    id: value,
    value: value,
    displayName: value,
  }));

  return (
    <MultiSelectField
      idPostfix="agentLabels"
      name="agentLabels"
      label="Labels matching hosts"
      placeholderText="app=frontend"
      helperText="Provide as many labels as you can to narrow the list to relevant hosts only."
      options={agentLabelOptions}
    />
  );
};

export default LabelsSelector;
