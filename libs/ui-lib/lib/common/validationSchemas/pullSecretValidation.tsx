import * as Yup from 'yup';
import { TFunction } from 'i18next';

export const pullSecretValidationSchema = (t: TFunction) =>
  Yup.string().test(
    'is-well-formed-json',
    t("ai:Invalid pull secret format. You must use your Red Hat account's pull secret."),
    (value?: string) => {
      if (!value || !value.trim()) return true;
      try {
        const pullSecret = JSON.parse(value) as unknown;
        return (
          typeof pullSecret === 'object' &&
          pullSecret !== null &&
          'auths' in pullSecret &&
          typeof (pullSecret as { auths: unknown }).auths === 'object' &&
          (pullSecret as { auths: unknown }).auths !== null
        );
      } catch {
        return false;
      }
    },
  );
