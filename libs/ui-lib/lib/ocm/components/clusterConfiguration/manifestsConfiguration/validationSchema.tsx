import * as Yup from 'yup';

import {
  getMaxFileSizeMessage,
  INCORRECT_TYPE_FILE_MESSAGE,
  validateFileName,
  validateFileSize,
  validateFileType,
} from '../../../../common/utils';
import { CustomManifestValues, ManifestFormData } from '../../../../common';

/* eslint-disable */
type CustomManifestMapper = (a: CustomManifestValues) => string;

declare module 'yup' {
  interface ArraySchema<
    TIn extends any[] | null | undefined,
    TContext,
    TDefault = undefined,
    TFlags extends Yup.Flags = '',
  > {
    uniqueManifestFiles(message: string, mapper: CustomManifestMapper): this;
  }
}
/* eslint-enable */

Yup.addMethod(
  Yup.array,
  'uniqueManifestFiles',
  function (message: string, mapper: CustomManifestMapper) {
    return this.test('unique', message, function (list: CustomManifestValues[] | undefined) {
      if (!list) return true;

      const seen = new Set();
      const errors: Yup.ValidationError[] = [];

      list.forEach((item, index) => {
        const mappedValue = mapper(item);
        if (seen.has(mappedValue)) {
          errors.push(
            this.createError({
              path: `${this.path}[${index}].filename`,
              message,
            }),
          );
        }
        seen.add(mappedValue);
      });

      if (errors.length > 0) {
        throw new Yup.ValidationError(errors);
      }

      return true;
    });
  },
);

const INCORRECT_FILENAME =
  'Must have a yaml, yml, json, yaml.patch or yml.patch extension and can not contain /.';

const UNIQUE_FOLDER_FILENAME = 'Ensure unique file names to avoid conflicts and errors.';

export const getFormViewManifestsValidationSchema = Yup.object<ManifestFormData>({
  manifests: Yup.array<CustomManifestValues>()
    .of(
      Yup.object({
        folder: Yup.mixed().required('Required'),
        filename: Yup.string()
          .required('Required')
          .min(1, 'Number of characters must be 1-255')
          .max(255, 'Number of characters must be 1-255')
          .test('not-correct-filename', INCORRECT_FILENAME, (value: string) => {
            return validateFileName(value);
          }),
        manifestYaml: Yup.string().when('filename', {
          is: (filename: string) => !filename.includes('patch'),
          then: () =>
            Yup.string()
              .required('Required')
              .test('not-big-file', getMaxFileSizeMessage, validateFileSize)
              .test('not-valid-file', INCORRECT_TYPE_FILE_MESSAGE, validateFileType),
          otherwise: () =>
            Yup.string()
              .required('Required')
              .test('not-big-file', getMaxFileSizeMessage, validateFileSize), // Validation of file content is not required if filename contains 'patch'
        }),
      }),
    )
    .uniqueManifestFiles(UNIQUE_FOLDER_FILENAME, (val: CustomManifestValues) => val.filename),
});
