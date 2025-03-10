import * as React from 'react';
import { useField } from 'formik';
import {
  Button,
  FormGroup,
  MenuFooter,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { SecretK8sResource } from '../../types';
import { useNavigate } from 'react-router-dom-v5-compat';

type CredentialsFieldProps = {
  name: string;
  credentials: SecretK8sResource[];
  onSelect: (cred: SecretK8sResource) => void;
};

const CredentialsField = ({ credentials, onSelect, name }: CredentialsFieldProps) => {
  const { t } = useTranslation();
  const [isCredentialsOpen, setIsCredentialsOpen] = React.useState(false);
  const [field, , { setValue }] = useField<string>({
    name: name,
  });
  const navigate = useNavigate();

  return (
    <>
      <FormGroup fieldId="credentials" label={t('ai:Infrastructure provider credentials')}>
        <Select
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsCredentialsOpen(!isCredentialsOpen)}
              isExpanded={isCredentialsOpen}
              isFullWidth
            >
              {field.value
                ? credentials.find((c) => c.metadata?.uid === field.value)?.metadata?.name
                : t('ai:Select a credential')}
            </MenuToggle>
          )}
          aria-label={t('ai:Select credentials')}
          onOpenChange={setIsCredentialsOpen}
          onSelect={(_, v) => {
            const cred = credentials.find((c) => c.metadata?.uid === v);
            if (cred) {
              onSelect(cred);
            }
            setValue(v as string);
            setIsCredentialsOpen(false);
          }}
          selected={field.value}
          isOpen={isCredentialsOpen}
        >
          <SelectList>
            {credentials.map((p) => (
              <SelectOption key={p.metadata?.uid} value={p.metadata?.uid}>
                {p.metadata?.name}
              </SelectOption>
            ))}
          </SelectList>
          <MenuFooter>
            <Button
              variant="link"
              isInline
              onClick={() => navigate('/multicloud/credentials/create?type=hostinventory')}
            >
              {t('ai:Add credential')}
            </Button>
          </MenuFooter>
        </Select>
      </FormGroup>
    </>
  );
};

export default CredentialsField;
