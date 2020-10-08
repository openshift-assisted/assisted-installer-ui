import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Switch } from '@patternfly/react-core';
import { FieldProps } from '../ui/formik/types';
import { getFieldId } from '../ui/formik/utils';
import HelperText from '../ui/formik/HelperText';
import TextAreaField from '../ui/formik/TextAreaField';

import './ClusterSshKeyField.css';

interface ClusterSshKeyFieldProps extends FieldProps {
  isSwitchHidden: boolean;
  onToggle: (isChecked: boolean) => void;
  onClusterSshKeyVisibilityChanged: () => void;
  onSshKeyBlur: () => void;
}

export const SshPublicKeyHelperText: React.FC<{
  fieldId?: string;
}> = ({ fieldId = 'sshPublicKey' }) => (
  <HelperText fieldId={fieldId}>
    Provide an SSH public key to debug OpenShift nodes after installation. To generate a new key,
    use the <em>ssh-keygen</em> command and paste the resulting public key (i.e. content of{' '}
    <em>~/.ssh/id_rsa.pub</em> file) here.
  </HelperText>
);

const label = 'Host SSH Public Key for troubleshooting after installation';

const ClusterSshKeyField: React.FC<ClusterSshKeyFieldProps> = ({
  validate,
  isSwitchHidden,
  onToggle,
  onClusterSshKeyVisibilityChanged,
  idPostfix,
  onSshKeyBlur,
  ...props
}) => {
  const [field] = useField({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  React.useEffect(onClusterSshKeyVisibilityChanged, [isSwitchHidden]);

  const checkbox = (
    <Switch
      id="sshPublicKeySwitch"
      label="Use the same host discovery SSH key"
      isChecked={field.value}
      onChange={onToggle}
    />
  );

  return !isSwitchHidden && field.value ? (
    <FormGroup fieldId={fieldId} label={label} helperText={<SshPublicKeyHelperText />}>
      {checkbox}
    </FormGroup>
  ) : (
    <TextAreaField
      name="sshPublicKey"
      label={label}
      helperText={<SshPublicKeyHelperText />}
      className="ssh-public-key__textarea"
      onBlur={onSshKeyBlur}
    >
      {!isSwitchHidden && checkbox}
    </TextAreaField>
  );
};

export default ClusterSshKeyField;
