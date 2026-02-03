import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { FORBIDDEN_HOSTNAMES, hostnameValidationMessages } from './constants';
import { NAME_START_END_REGEX, NAME_CHARS_REGEX } from './regexes';

export const richHostnameValidationSchema = (
  t: TFunction,
  usedNames: string[],
  origName?: string,
) => {
  const hostnameValidationMessagesList = hostnameValidationMessages(t);
  return Yup.string()
    .min(1, hostnameValidationMessagesList.INVALID_LENGTH)
    .max(63, hostnameValidationMessagesList.INVALID_LENGTH)
    .test(
      hostnameValidationMessagesList.INVALID_START_END,
      hostnameValidationMessagesList.INVALID_START_END,
      (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return true;
        }
        return (
          !!trimmed[0].match(NAME_START_END_REGEX) &&
          (trimmed[trimmed.length - 1]
            ? !!trimmed[trimmed.length - 1].match(NAME_START_END_REGEX)
            : true)
        );
      },
    )
    .matches(NAME_CHARS_REGEX, {
      message: hostnameValidationMessagesList.INVALID_VALUE,
      excludeEmptyString: true,
    })
    .test(
      hostnameValidationMessagesList.NOT_UNIQUE,
      hostnameValidationMessagesList.NOT_UNIQUE,
      (value) => {
        if (!value || value === origName) {
          return true;
        }
        return !usedNames.find((n) => n === value);
      },
    )
    .notOneOf(FORBIDDEN_HOSTNAMES, hostnameValidationMessagesList.LOCALHOST_ERR);
};
