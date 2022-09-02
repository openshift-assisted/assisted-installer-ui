import { FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Address4 } from 'ip-address';
import set from 'lodash/set';
import { OpenshiftVersionOptionType } from '../../../types';
import { ClusterNetwork, MachineNetwork, ServiceNetwork } from '../../../api';

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

type innerError = { path: string; message: string };
type innerErrors = { inner: innerError[] };
type fieldErrors = { [key: string]: string[] };

const fieldErrorReducer = (errors: innerError[]): fieldErrors => {
  return errors.reduce(
    (memo, { path, message }) => ({
      ...memo,
      [path]: (memo[path] || []).concat(message), // eslint-disable-line
    }),
    {},
  );
};

export const getRichTextValidation =
  <T extends object>(schema: Yup.ObjectSchema<T> | Yup.Lazy) =>
  async (values: T): Promise<fieldErrors | undefined> => {
    try {
      await schema.validate(values, {
        abortEarly: false,
      });
    } catch (e) {
      const { inner } = e as innerErrors;
      if (!inner || inner.length === 0) {
        return {};
      }

      const baseFields: innerError[] = [];
      const arraySubfields: innerError[] = [];

      inner.forEach((item) => {
        const isArraySubfield = /\.|\[/.test(item.path);
        if (isArraySubfield) {
          arraySubfields.push(item);
        } else {
          baseFields.push(item);
        }
      });

      const fieldErrors = fieldErrorReducer(baseFields);
      if (arraySubfields.length === 0) {
        return fieldErrors;
      }

      // Now we need to convert the fieldArray errors to the parent object
      // eg. items[0].thumbprint --> { items: [{ thumbprint: ['subField error'] }]}
      const arrayErrors = {};
      arraySubfields.forEach((field) => {
        set(arrayErrors, field.path, [field.message]);
      });
      return { ...fieldErrors, ...arrayErrors };
    }
  };

export const getFormikArrayItemFieldName = (arrayFieldName: string, idx: number) => {
  return `${arrayFieldName}[${idx}]`;
};

export const getFormikObjectItemFieldName = (objectFieldName: string, idx: number) => {
  return `${objectFieldName}.${idx}`;
};

export const allSubnetsIPv4 = (
  networks: (MachineNetwork | ClusterNetwork | ServiceNetwork)[] | undefined,
) => {
  return !!networks?.every((network) => network.cidr && Address4.isValid(network.cidr));
};
