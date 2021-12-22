import * as React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { RenderIf } from '../ui/RenderIf';
import { getFieldId, HelperText, TextAreaField, trimSshPublicKey } from '../ui';
import { Cluster } from '../../api';
import { NetworkConfigurationValues } from '../../types/clusters';

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

interface ClusterSshKeyFieldsProps {
  clusterSshKey: Cluster['sshPublicKey'];
  imageSshKey: Cluster['imageInfo']['sshPublicKey'];
}

const ClusterSshKeyFields: React.FC<ClusterSshKeyFieldsProps> = ({
  clusterSshKey,
  imageSshKey,
}) => {
  //shareSshKey shouldn't response to changes. imageSshKey stays the same, there's a loading state while it's requested
  //clusterSshKey updating causes the textarea to disappear when the user clears it to edit it
  const defaultShareSshKey = !!imageSshKey && (clusterSshKey === imageSshKey || !clusterSshKey);
  const [shareSshKey, setShareSshKey] = React.useState(defaultShareSshKey);
  const { values, setFieldValue, errors, touched } = useFormikContext<
    Pick<NetworkConfigurationValues, 'sshPublicKey'>
  >();

  const errorMsg = errors.sshPublicKey;

  const handleSshKeyBlur = () => {
    if (values.sshPublicKey) {
      setFieldValue('sshPublicKey', trimSshPublicKey(values.sshPublicKey));
    }
  };

  React.useEffect(() => {
    if (shareSshKey) {
      setFieldValue('sshPublicKey', imageSshKey);
    }
  }, [shareSshKey, imageSshKey, setFieldValue]);

  const fieldId = getFieldId('shareDiscoverySshKey', 'checkbox');
  return (
    <>
      <FormGroup
        fieldId={fieldId}
        label={label}
        helperTextInvalid={errorMsg}
        validated={touched && errorMsg ? 'error' : 'default'}
      >
        <RenderIf condition={Boolean(imageSshKey)}>
          <Checkbox
            name="shareDiscoverySshKey"
            id={fieldId}
            label="Use the same host discovery SSH key"
            aria-describedby={`${fieldId}-helper`}
            isChecked={shareSshKey}
            onChange={setShareSshKey}
          />
        </RenderIf>
        <RenderIf condition={!shareSshKey}>
          <TextAreaField
            name="sshPublicKey"
            helperText={<SshPublicKeyHelperText />}
            onBlur={handleSshKeyBlur}
          />
        </RenderIf>
      </FormGroup>
    </>
  );
};

export default ClusterSshKeyFields;
