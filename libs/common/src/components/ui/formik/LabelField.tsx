import * as React from 'react';
import { useField } from 'formik';
import {
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  TextInput,
} from '@patternfly/react-core';

import { useTranslation } from '../../../hooks';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { getFieldId } from './utils';

type LabelsFieldProps = {
  name: string;
  label: string;
  idPostfix?: string;
};

export const LabelField = ({ name, label, idPostfix }: LabelsFieldProps) => {
  const { t } = useTranslation();
  const [{ value: labels }, { touched, error }, { setValue: setLabels, setTouched }] =
    useField<string[]>(name);
  const fieldId = getFieldId(name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';

  const onDelete = (_ev: React.MouseEvent<Element, MouseEvent>, index: number) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1);
    setTouched(true);
    setLabels(newLabels, true);
  };

  const onAdd = (text: string) => {
    if (!text) {
      return;
    }
    const newLabels = [...labels, text];

    setTouched(true);
    setLabels(newLabels, true);
  };

  const onEdit = (index: number, nextText: string) => {
    const newLabels = [...labels];
    newLabels.splice(index, 1, nextText);

    setTouched(true);
    setLabels(newLabels, true);
  };

  return (
    <FormGroup label={label}>
      <LabelGroup
        numLabels={5}
        addLabelControl={<EditableLabelControl defaultLabel="key=value" onAddLabel={onAdd} />}
      >
        {labels.map((label, index) => {
          return (
            <Label
              key={index}
              textMaxWidth="16ch"
              onClose={(e) => onDelete(e, index)}
              onEditCancel={(_, prevText) => onEdit(index, prevText)}
              onEditComplete={(_, newText) => onEdit(index, newText)}
              /* Add a basic tooltip as the PF tooltip doesn't work for editable labels */
              title={label}
              isEditable
            >
              {label}
            </Label>
          );
        })}
      </LabelGroup>
      <FormHelperText>
        <HelperText>
          <HelperTextItem
            id={`${fieldId}-helper-text`}
            data-testid={`input-label-${fieldId}-helper-text`}
          >
            {t("ai:Enter a key=value and then press 'enter' to input the label.")}
          </HelperTextItem>
          {errorMessage && (
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={'error'}
              id={`${fieldId}-helper-error`}
              data-testid={`input-label-${fieldId}-helper-error`}
            >
              {errorMessage}
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

type EditableLabelControlProps = {
  defaultLabel: string;
  onAddLabel: (text: string) => void;
};

const EditableLabelControl = ({ defaultLabel, onAddLabel }: EditableLabelControlProps) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [label, setLabel] = React.useState<string>('');
  const { t } = useTranslation();

  const onConfirmAdd = () => {
    onAddLabel(label);
    setIsEditing(false);
    setLabel('');
  };

  const onDiscardAdd = () => {
    setIsEditing(false);
    setLabel('');
  };

  return isEditing ? (
    <TextInput
      aria-label={t('ai:New label')}
      autoFocus
      value={label}
      onChange={(_, value) => {
        setLabel(value);
      }}
      onBlur={onConfirmAdd}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onConfirmAdd();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onDiscardAdd();
        }
      }}
    />
  ) : (
    <Button
      aria-label={t('ai:Add label')}
      variant="link"
      className="pf-v6-u-ml-xs"
      isInline
      onClick={() => {
        setIsEditing(true);
        setLabel(defaultLabel);
      }}
    >
      {t('ai:Add label')}
    </Button>
  );
};
