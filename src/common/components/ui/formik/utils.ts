import { FormikErrors, FormikTouched } from 'formik';
import { OpenshiftVersionOptionType } from '../../../types';

export const getFieldId = (fieldName: string, fieldType: string, unique?: string) => {
  unique = unique ? `${unique}-` : '';
  return `form-${fieldType}-${fieldName.replace(/\./g, '-')}-${unique}field`;
};

export const trimSshPublicKey = (key: string) =>
  key
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .join('\n');

export const trimCommaSeparatedList = (list: string) =>
  list
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');

export const getFormikErrorFields = <FormikValues>(
  errors: FormikErrors<FormikValues>,
  touched: FormikTouched<FormikValues>,
) => Object.keys(errors).filter((field) => touched[field]);

export const getDefaultOpenShiftVersion = (versions: OpenshiftVersionOptionType[]) =>
  versions.find((v) => v.default)?.value || versions[0]?.value || '';

export const labelsToArray = (labels: { [key in string]: string } = {}): string[] => {
  const result: string[] = [];
  for (const key in labels) {
    result.push(`${key}=${labels[key]}`);
  }
  return result;
};

// strValues: array of 'key=value' items
export const parseStringLabels = (
  strValues: string[],
): {
  [key in string]: string;
} => {
  const labels = strValues.reduce((acc, curr) => {
    const label = curr.split('=');
    acc[label[0]] = label[1];
    return acc;
  }, {});
  return labels;
};

// Input: ['foo=bar', 'key=value', 'foo=blee']
// Result: ['key=value', 'foo=blee']
export const uniqueLabels = (labelPairs: string[]): string[] =>
  labelsToArray(parseStringLabels(labelPairs));

// Input: (['foo=bar', 'key=value'], ['foo', 'bar'])
// Result: ['foo=bar']
export const selectedLabelsOnly = (labelPairs: string[], allowedKeys: string[]) =>
  labelPairs.filter((pair) => allowedKeys.includes(pair.split('=')[0]));
