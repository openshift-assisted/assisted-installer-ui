import React from 'react';
import flatten from 'lodash/flatten';
import { MultiSelectField } from '../../../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';
import { AGENT_LOCATION_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Label,
  LabelGroup,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useField } from 'formik';

import './LabelSelector.css';

export const infraEnvLabelKeys = [INFRAENV_AGENTINSTALL_LABEL_KEY, AGENT_LOCATION_LABEL_KEY];

const getSelectOptions = (agents: AgentK8sResource[], labelKeysFilter?: string[]) =>
  Array.from(
    new Set(
      flatten(
        agents.map((agent) =>
          Object.keys(agent.metadata?.labels || {})
            .filter((k) => !(labelKeysFilter || infraEnvLabelKeys).includes(k))
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

  return (
    <Split hasGutter className="pf-c-label-group pf-m-category">
      <SplitItem>
        <LabelGroup
          categoryName={label || t('ai:Host label filter')}
          className="ai-group-label-selector"
        >
          {field.value.length ? (
            field.value.map(({ key, value }) => (
              <Label
                key={key}
                onClose={() => setValue(field.value.filter((value) => value.key !== key))}
                isTruncated
              >
                {`${key}=${value}`}
              </Label>
            ))
          ) : (
            <Label> {t('ai:Any label')}</Label>
          )}
        </LabelGroup>
      </SplitItem>
      <SplitItem>
        <Dropdown
          onSelect={() => setAddLabelOpen(false)}
          toggle={
            <DropdownToggle
              toggleIndicator={null}
              onToggle={setAddLabelOpen}
              style={{ padding: 0 }}
            >
              <Label color="blue" variant="outline" className="pf-m-overflow">
                {t('ai:Add label')}
              </Label>
            </DropdownToggle>
          }
          isOpen={addLabelOpen}
          isPlain
          dropdownItems={children}
          menuAppendTo={() => document.body}
        />
      </SplitItem>
    </Split>
  );
};
