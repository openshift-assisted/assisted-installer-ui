import * as Yup from 'yup';
import { trimSshPublicKey } from '../components/ui/formik/utils';
import { SSH_PUBLIC_KEY_REGEX } from './regexes';

export const sshPublicKeyValidationSchema = Yup.string().test(
  'ssh-public-key',
  'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT]. A single key can be provided only.',
  (value?: string) => {
    if (!value) {
      return true;
    }

    return !!trimSshPublicKey(value).match(SSH_PUBLIC_KEY_REGEX);
  },
);

export const sshPublicKeyListValidationSchema = Yup.string()
  .test(
    'ssh-public-keys',
    'SSH public key must consist of "[TYPE] key [[EMAIL]]", supported types are: ssh-rsa, ssh-ed25519, ecdsa-[VARIANT].',
    (value?: string) => {
      if (!value) {
        return true;
      }

      return (
        trimSshPublicKey(value)
          .split('\n')
          .find((line: string) => !line.match(SSH_PUBLIC_KEY_REGEX)) === undefined
      );
    },
  )
  .test('ssh-public-keys-unique', 'SSH public keys must be unique.', (value?: string) => {
    if (!value) {
      return true;
    }
    const keyList = trimSshPublicKey(value).split('\n');
    return new Set(keyList).size === keyList.length;
  });
