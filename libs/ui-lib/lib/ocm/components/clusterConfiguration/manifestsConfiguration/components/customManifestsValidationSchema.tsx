import * as Yup from 'yup';
import { CustomManifestValues, ManifestFormData } from '../data/dataTypes';
import {
  getMaxFileSizeMessage,
  validateFileSize,
  validateFileName,
  validateFileType,
  INCORRECT_TYPE_FILE_MESSAGE,
} from '../../../../../common/utils';
const INCORRECT_FILENAME = 'Must have a yaml, yml or json extension and can not contain /.';

const UNIQUE_FOLDER_FILENAME = 'Ensure unique file names to avoid conflicts and errors.';

export const getUniqueValidationSchema = Yup.string().test(
  'unique',
  UNIQUE_FOLDER_FILENAME,
  function (value: string) {
    const context = this.options.context as Yup.TestContext & { values?: ManifestFormData };
    if (!context || !context.values) {
      return this.createError({
        message: 'Unexpected error: Yup test context should contain form values',
      });
    }

    const values = context.values.manifests.map((manifest) => manifest.filename);
    return values.filter((path) => path === value).length === 1;
  },
);

export const getFormViewManifestsValidationSchema = Yup.object<ManifestFormData>().shape({
  manifests: Yup.array<CustomManifestValues>().of(
    Yup.object().shape({
      folder: Yup.mixed().required('Required'),
      filename: Yup.string()
        .required('Required')
        .min(1, 'Number of characters must be 1-255')
        .max(255, 'Number of characters must be 1-255')
        .test('not-correct-filename', INCORRECT_FILENAME, (value: string) => {
          return validateFileName(value);
        })
        .concat(getUniqueValidationSchema),
      manifestYaml: Yup.string()
        .required('Required')
        .test('not-big-file', getMaxFileSizeMessage, validateFileSize)
        .test('not-valid-file', INCORRECT_TYPE_FILE_MESSAGE, validateFileType),
    }),
  ),
});
