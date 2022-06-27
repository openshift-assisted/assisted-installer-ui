import * as React from 'react';
import { useField } from 'formik';

import { PopoverIcon, trimSshPublicKey, UploadField } from '../ui';
import { SshPublicKeyHelperText } from './SecurityFields';

type UploadSSHProps = {
  isRequired?: boolean;
};

const UploadSSH: React.FC<UploadSSHProps> = ({ isRequired }) => {
  const [{ name, value }, , { setValue }] = useField('sshPublicKey');

  return (
    <UploadField
      label={
        <>
          {'SSH public key'}
          <PopoverIcon bodyContent="Provide an SSH key to receive debugging information during installation" />
        </>
      }
      name={name}
      helperText={<SshPublicKeyHelperText />}
      idPostfix="discovery"
      onBlur={() => value && setValue(trimSshPublicKey(value))}
      dropzoneProps={{
        accept: '.pub',
        maxSize: 2048,
        onDropRejected:
          ({ setError }) =>
          () =>
            setError('File not supported.'),
      }}
      transformValue={trimSshPublicKey}
      isRequired={isRequired}
    />
  );
};

export default UploadSSH;
