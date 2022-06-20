import React from 'react';
import flatten from 'lodash/flatten';
import { MultiSelectField } from '../../../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';
import { AGENT_LOCATION_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { Dropdown, DropdownItem, DropdownToggle, Label, LabelGroup } from '@patternfly/react-core';
import { useField } from 'formik';

export const infraEnvLabelKeys = [INFRAENV_AGENTINSTALL_LABEL_KEY, AGENT_LOCATION_LABEL_KEY];

type LabelsSelectorProps = {
  agents: AgentK8sResource[];
  labelKeysFilter?: string[];
  name?: string;
  label?: string;
};

const LabelsSelector: React.FC<LabelsSelectorProps> = ({
  agents,
  labelKeysFilter,
  name = 'agentLabels',
  label = 'Labels matching hosts',
}) => {
  const agentLabelOptions = Array.from(
    new Set(
      flatten(
        agents.map((agent) =>
          Object.keys(agent.metadata?.labels || {})
            .filter((k) => !(labelKeysFilter || infraEnvLabelKeys).includes(k))
            .map((k) => `${k}=${agent.metadata?.labels?.[k]}`),
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
      name={name}
      label={label}
      placeholderText="app=frontend"
      helperText="Provide as many labels as you can to narrow the list to relevant hosts only."
      options={agentLabelOptions}
    />
  );
};

export default LabelsSelector;

export const LabelSelectorGroup: React.FC<LabelsSelectorProps> = ({
  agents,
  labelKeysFilter,
  name = 'agentLabels',
  label = 'Host label filter',
}) => {
  const [addLabelOpen, setAddLabelOpen] = React.useState(false);
  const [field, , { setValue }] = useField<string[]>(name);

  const options = Array.from(
    new Set(
      flatten(
        agents.map((agent) =>
          Object.keys(agent.metadata?.labels || {})
            .filter((k) => !(labelKeysFilter || infraEnvLabelKeys).includes(k))
            .map((k) => `${k}=${agent.metadata?.labels?.[k]}`),
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

  const availableOptions = options.filter(
    (option) => !(field.value || []).includes(option.value as string),
  );

  const children = availableOptions.length
    ? availableOptions.map((option) => (
        <DropdownItem
          key={option.id}
          id={option.id}
          onClick={() => setValue([...field.value, option.value as string])}
        >
          {option.displayName}
        </DropdownItem>
      ))
    : [
        <DropdownItem key="no-option" id="no-option" isDisabled>
          No label available
        </DropdownItem>,
      ];

  return (
    <LabelGroup
      categoryName={label}
      addLabelControl={
        <Dropdown
          onSelect={() => setAddLabelOpen(false)}
          toggle={
            <DropdownToggle
              toggleIndicator={null}
              onToggle={setAddLabelOpen}
              style={{ padding: 0 }}
            >
              <Label color="blue" variant="outline" className="pf-m-overflow">
                Add label
              </Label>
            </DropdownToggle>
          }
          isOpen={addLabelOpen}
          isPlain
          dropdownItems={children}
          menuAppendTo={() => document.body}
        />
      }
    >
      {field.value.map((v) => (
        <Label
          key={v}
          onClose={() => setValue(field.value.filter((label) => label !== v))}
          isTruncated
        >
          {v}
        </Label>
      ))}
    </LabelGroup>
  );
};
