import * as React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { RenderIf } from '../ui/RenderIf';
import { ExternalLink, getFieldId, HelperText, TextAreaField, trimSshPublicKey } from '../ui';
import { Cluster } from '../../api';
import { NetworkConfigurationValues } from '../../types/clusters';
import { SSH_GENERATION_DOC_LINK } from '../../config';

export const SshPublicKeyHelperText: React.FC<{
  fieldId?: string;
}> = ({ fieldId = 'sshPublicKey' }) => (
  <HelperText fieldId={fieldId}>
    Paste the content of a public ssh key you want to use to connect to the hosts into this field.{' '}
    <ExternalLink href={SSH_GENERATION_DOC_LINK}>Learn more</ExternalLink>
  </HelperText>
);

const label = 'Host SSH Public Key for troubleshooting after installation';

interface SecurityFieldsFieldsProps {
  clusterSshKey: Cluster['sshPublicKey'];
  imageSshKey?: Cluster['imageInfo']['sshPublicKey'];
}

const SecurityFields: React.FC<SecurityFieldsFieldsProps> = ({ clusterSshKey, imageSshKey }) => {
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

export default SecurityFields;
