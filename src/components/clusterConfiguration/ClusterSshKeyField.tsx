import * as React from 'react';
import { useFormikContext } from 'formik';
import { FormGroup } from '@patternfly/react-core';
import { FieldProps } from '../ui/formik/types';
import { getFieldId } from '../ui/formik/utils';
import HelperText from '../ui/formik/HelperText';
import TextAreaField from '../ui/formik/TextAreaField';
import { CheckboxField } from '../ui/formik';
import { NetworkConfigurationValues } from '../../types/clusters';

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
    SSH key used to debug OpenShift nodes. Generate a new key using <em>ssh-keygen</em> command and
    upload or paste the resulting public key here (by default it is content of the{' '}
    <em>~/.ssh/id_rsa.pub</em> file).
  </HelperText>
);

const label = 'Host SSH Public Key for troubleshooting after installation';

const ClusterSshKeyField: React.FC<ClusterSshKeyFieldProps> = ({
  isSwitchHidden,
  onToggle,
  onClusterSshKeyVisibilityChanged,
  idPostfix,
  onSshKeyBlur,
  ...props
}) => {
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  const { values } = useFormikContext<NetworkConfigurationValues>();

  React.useEffect(onClusterSshKeyVisibilityChanged, [isSwitchHidden]);

  return (
    <FormGroup fieldId={fieldId} label={label}>
      {!isSwitchHidden && (
        <CheckboxField
          label="Use the same host discovery SSH key"
          name={props.name}
          onChange={onToggle}
        />
      )}
      {(isSwitchHidden || !values.shareDiscoverySshKey) && (
        <TextAreaField
          name="sshPublicKey"
          helperText={<SshPublicKeyHelperText />}
          className="ssh-public-key__textarea"
          onBlur={onSshKeyBlur}
        />
      )}
    </FormGroup>
  );
};

export default ClusterSshKeyField;
