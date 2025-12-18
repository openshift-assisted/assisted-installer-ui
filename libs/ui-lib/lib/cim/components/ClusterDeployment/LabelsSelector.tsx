import React from 'react';
import flatten from 'lodash-es/flatten.js';
import {
  Label,
  LabelGroup,
  Split,
  SplitItem,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
import { useField } from 'formik';

import { MultiSelectField } from '../../../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';
import { AGENT_LOCATION_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

import './LabelSelector.css';

export const infraEnvLabelKeys = [INFRAENV_AGENTINSTALL_LABEL_KEY, AGENT_LOCATION_LABEL_KEY];

const getSelectOptions = (agents: AgentK8sResource[], labelKeysFilter?: string[]) =>
  Array.from(
    new Set(
      flatten(
        agents.map((agent) =>
          Object.keys(agent.metadata?.labels || {})
            .filter((k) => !labelKeysFilter?.includes(k))
            .map((k) => `${k}=${agent.metadata?.labels?.[k] || ''}`),
        ),
      ),
    ),
  ).map<MultiSelectOption>((value) => ({
    id: value,
    value: value,
    displayName: value,
  }));

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
  label,
}) => {
  const { t } = useTranslation();
  const agentLabelOptions = getSelectOptions(agents, labelKeysFilter);
  return (
    <MultiSelectField
      idPostfix="agentLabels"
      name={name}
      label={label || t('ai:Labels matching hosts')}
      placeholderText="app=frontend"
      helperText={t(
        'ai:Provide as many labels as you can to narrow the list to relevant hosts only.',
      )}
      options={agentLabelOptions}
    />
  );
};

export default LabelsSelector;

export const LabelSelectorGroup: React.FC<LabelsSelectorProps> = ({
  agents,
  labelKeysFilter,
  name = 'agentLabels',
  label,
}) => {
  const { t } = useTranslation();
  const [addLabelOpen, setAddLabelOpen] = React.useState(false);
  const [field, , { setValue }] = useField<{ key: string; value: string }[]>(name);

  const options = getSelectOptions(agents, labelKeysFilter);

  const availableOptions = options.filter(
    (option) =>
      !(field.value || [])
        .map(({ key, value }) => `${key}=${value}`)
        .includes(option.value as string),
  );

  const children = availableOptions.length
    ? availableOptions.map((option) => (
        <DropdownItem
          key={option.id}
          id={option.id}
          onClick={() => {
            const values = (option.value as string).split('=', 2);
            setValue([...field.value, { key: values[0], value: values[1] }]);
          }}
        >
          {option.displayName}
        </DropdownItem>
      ))
    : [
        <DropdownItem key="no-option" isDisabled>
          {t('ai:No label available')}
        </DropdownItem>,
      ];

  const categoryName = label || t('ai:Filter hosts by existing labels');

  return (
    <Split hasGutter className="pf-v6-c-label-group pf-m-category ai-split-filter-hosts">
      <SplitItem>
        {field.value.length ? (
          <LabelGroup categoryName={categoryName} className="ai-group-label-selector">
            {field.value.map(({ key, value }) => (
              <Label
                key={key}
                onClose={() => setValue(field.value.filter((value) => value.key !== key))}
              >
                {`${key}=${value}`}
              </Label>
            ))}
          </LabelGroup>
        ) : (
          <span className="pf-v6-c-label-group__label">{categoryName}</span>
        )}
      </SplitItem>
      <SplitItem>
        <Dropdown
          isOpen={addLabelOpen}
          onSelect={() => setAddLabelOpen(false)}
          onOpenChange={() => setAddLabelOpen(!addLabelOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              variant="plain"
              className="pf-v6-u-w-100"
              ref={toggleRef}
              isFullWidth
              onClick={() => setAddLabelOpen(!addLabelOpen)}
              isExpanded={addLabelOpen}
            >
              <Label color="blue" variant="outline" className="pf-m-overflow">
                {t('ai:Add label')}
              </Label>
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
        >
          <DropdownList>{children}</DropdownList>
        </Dropdown>
      </SplitItem>
    </Split>
  );
};
