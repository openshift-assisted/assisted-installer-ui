import * as React from 'react';
import { useField } from 'formik';

import { PopoverIcon, trimSshPublicKey, UploadField } from '../ui';
import { SshPublicKeyHelperText } from './SecurityFields';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type UploadSSHProps = {
  isRequired?: boolean;
};

const UploadSSH: React.FC<UploadSSHProps> = ({ isRequired }) => {
  const [{ name, value }, , { setValue }] = useField('sshPublicKey');
  const { t } = useTranslation();
  return (
    <UploadField
      label={
        <>
          {t('ai:SSH public key')}{' '}
          <PopoverIcon
            bodyContent={t(
              'ai:Provide an SSH key to be able to connect to the hosts for debugging purposes during the discovery process',
            )}
          />
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
            setError(t('ai:File not supported.')),
      }}
      transformValue={trimSshPublicKey}
      isRequired={isRequired}
    />
  );
};

export default UploadSSH;
