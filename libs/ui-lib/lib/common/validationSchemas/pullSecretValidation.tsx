import * as Yup from 'yup';
import { TFunction } from 'i18next';

export const pullSecretValidationSchema = (t: TFunction) =>
  Yup.string().test(
    'is-well-formed-json',
    t("ai:Invalid pull secret format. You must use your Red Hat account's pull secret."),
    (value?: string) => {
      const isValid = true;
      if (!value) return isValid;
      try {
        const pullSecret = JSON.parse(value) as {
          auths: string;
        };
        return (
          pullSecret.constructor.name === 'Object' &&
          !!pullSecret?.auths &&
          pullSecret.auths.constructor.name === 'Object'
        );
      } catch {
        return !isValid;
      }
    },
  );
