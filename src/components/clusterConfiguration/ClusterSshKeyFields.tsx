import * as React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import { getFieldId } from '../ui/formik/utils';
import HelperText from '../ui/formik/HelperText';
import TextAreaField from '../ui/formik/TextAreaField';
import { trimSshPublicKey } from '../ui/formik/utils';
import { NetworkConfigurationValues } from '../../types/clusters';
import { Cluster } from '../../api/types';

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
  const [shareSshKey, setShareSshKey] = React.useState(false);
  const { values, setFieldValue } = useFormikContext<NetworkConfigurationValues>();

  const handleSshKeyBlur = () => {
    if (values.sshPublicKey) {
      setFieldValue('sshPublicKey', trimSshPublicKey(values.sshPublicKey));
    }
  };

  React.useEffect(() => {
    if (imageSshKey && (clusterSshKey === imageSshKey || !clusterSshKey)) {
      setShareSshKey(true);
    }
  }, [imageSshKey, clusterSshKey]);

  React.useEffect(() => {
    if (shareSshKey) {
      setFieldValue('sshPublicKey', imageSshKey);
    }
  }, [shareSshKey, imageSshKey, setFieldValue]);

  const fieldId = getFieldId('shareDiscoverySshKey', 'checkbox');
  return (
    <>
      <FormGroup fieldId={fieldId} label={label}>
        {imageSshKey && (
          <Checkbox
            name="shareDiscoverySshKey"
            id={fieldId}
            label="Use the same host discovery SSH key"
            aria-describedby={`${fieldId}-helper`}
            isChecked={shareSshKey}
            onChange={(checked) => {
              setShareSshKey(checked);
            }}
          />
        )}
      </FormGroup>
      {!shareSshKey && (
        <TextAreaField
          name="sshPublicKey"
          label={!imageSshKey && label}
          helperText={<SshPublicKeyHelperText />}
          onBlur={handleSshKeyBlur}
        />
      )}
    </>
  );
};

export default ClusterSshKeyFields;
