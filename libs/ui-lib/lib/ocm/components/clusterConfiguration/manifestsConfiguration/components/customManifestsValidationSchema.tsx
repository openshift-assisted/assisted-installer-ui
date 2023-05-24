import * as Yup from 'yup';
import { UniqueStringArrayExtractor } from '../../staticIp/commonValidationSchemas';
import { CustomManifestValues, ManifestFormData } from '../data/dataTypes';
import { load } from 'js-yaml';

const MAX_FILE_SIZE = 100000; //100 kb
const FILENAME_REGEX = /^[^/]*\.(yaml|yml|json)$/;
const INCORRECT_FILENAME = 'Must have a yaml, yml or json extension and can not contain /.';
const INCORRECT_TYPE_FILE = 'File type is not supported. File type must be yaml, yml or json.';
const INCORRECT_FILE_SIZE = 'File size is too big. Upload a new 100 Kb or less.';

export const getUniqueValidationSchema = <FormValues,>(
  uniqueStringArrayExtractor: UniqueStringArrayExtractor<FormValues>,
) => {
  return Yup.string().test(
    'unique',
    'Folder and file name must be unique',
    function (value: string) {
      const context = this.options.context as Yup.TestContext & { values?: FormValues };
      if (!context || !context.values) {
        return this.createError({
          message: 'Unexpected error: Yup test context should contain form values',
        });
      }

      const values = uniqueStringArrayExtractor(context.values, this, value);

      const setValues = new Set(values);

      if (!values) {
        return this.createError({
          message: 'Unexpected error: Failed to get values to test uniqueness',
        });
      }
      return values.length === setValues.size;
    },
  );
};

const getAllManifests: UniqueStringArrayExtractor<ManifestFormData> = (values: ManifestFormData) =>
  values.manifests.map((manifest) => `${manifest.folder}_${manifest.filename}`);

export const getFormViewManifestsValidationSchema = Yup.lazy<ManifestFormData>(() =>
  Yup.object<ManifestFormData>().shape({
    manifests: Yup.array<CustomManifestValues>().of(
      Yup.object().shape({
        folder: Yup.mixed().required('Required').concat(getUniqueValidationSchema(getAllManifests)),
        filename: Yup.string()
          .required('Required')
          .min(1, 'Number of characters must be 1-255')
          .max(255, 'Number of characters must be 1-255')
          .test('not-correct-filename', INCORRECT_FILENAME, (value: string) => {
            return validateFileName(value);
          })
          .concat(getUniqueValidationSchema(getAllManifests)),
        manifestYaml: Yup.string()
          .required('Required')
          .test('not-big-file', INCORRECT_FILE_SIZE, (value: string) => {
            return validateFileSize(value);
          })
          .test('not-valid-file', INCORRECT_TYPE_FILE, (value: string) => {
            return validateFileType(value);
          }),
      }),
    ),
  }),
);

export const validateFileName = (fileName: string) => {
  return new RegExp(FILENAME_REGEX).test((fileName || '').toString());
};

export const validateFileType = (value: string) => {
  return isStringValidYAML(value) || isStringValidJSON(value);
};

const isStringValidYAML = (input: string): boolean => {
  try {
    load(input);
    return true;
  } catch (error) {
    return false;
  }
};

const isStringValidJSON = (input: string): boolean => {
  try {
    JSON.parse(input);
    return true;
  } catch (error) {
    return false;
  }
};

const validateFileSize = (value: string): boolean => {
  const contentFile = new Blob([value], { type: 'text/plain;charset=utf-8' });
  if (contentFile.size > MAX_FILE_SIZE) {
    return false;
  } else {
    return true;
  }
};
