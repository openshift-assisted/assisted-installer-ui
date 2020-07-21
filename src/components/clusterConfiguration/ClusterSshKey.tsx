import React from 'react';
import { useFormikContext } from 'formik';
import { FormGroup, Switch } from '@patternfly/react-core';
import { TextAreaField } from '../ui';
import { ClusterConfigurationValues } from '../../types/clusters';
import { getFieldId } from '../ui/formik/utils';
import HelperText from '../ui/formik/HelperText';
import { ImageInfo } from '../../api/types';

import './ClusterSshKey.css';

const sshPublicKeyHelperText = (
  <>
    Provide a SSH public key to debug OpenShift nodes after installation. To generate a new key, use
    the <em>ssh-keygen -o</em> command and paste the value of <em>~/.ssh/id_rsa.pub</em> here.
  </>
);

const sshPublicKeyLabel = 'Host SSH Public Key for troubleshooting after installation';

type ClusterSshKeyProps = {
  imageSshPublicKey: ImageInfo['sshPublicKey'];
};

const ClusterSshKey: React.FC<ClusterSshKeyProps> = ({ imageSshPublicKey }) => {
  const { setFieldValue, initialValues, values } = useFormikContext<ClusterConfigurationValues>();
  const isCheckboxVisible = !!imageSshPublicKey;
  const [isChecked, setChecked] = React.useState(
    (isCheckboxVisible && initialValues.sshPublicKey === imageSshPublicKey) ||
      !initialValues.sshPublicKey,
  );

  const onChange = (newVal: boolean) => {
    setChecked(newVal);
    if (newVal) {
      setFieldValue('sshPublicKey', imageSshPublicKey);
    } else {
      setFieldValue('sshPublicKey', initialValues.sshPublicKey);
    }
  };

  React.useEffect(
    () => {
      if (imageSshPublicKey && isChecked && imageSshPublicKey != values.sshPublicKey) {
        onChange(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageSshPublicKey], // just once or when image key changes
  );

  const checkbox = (
    <Switch
      id="sshPublicKeySwitch"
      label="Use the same host discovery SSH key"
      isChecked={isChecked}
      onChange={onChange}
    />
  );

  const fieldId = getFieldId('sshPublicKey', 'switch');

  return isCheckboxVisible && isChecked ? (
    <FormGroup
      fieldId={fieldId}
      label={sshPublicKeyLabel}
      helperText={<HelperText fieldId={fieldId}>{sshPublicKeyHelperText}</HelperText>}
    >
      {checkbox}
    </FormGroup>
  ) : (
    <TextAreaField
      name="sshPublicKey"
      label={sshPublicKeyLabel}
      helperText={sshPublicKeyHelperText}
      className="ssh-public-key__textarea"
    >
      {isCheckboxVisible && checkbox}
    </TextAreaField>
  );
};

export default ClusterSshKey;
