import { FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { Address4, Address6 } from 'ip-address';
import set from 'lodash-es/set.js';
import groupBy from 'lodash-es/groupBy.js';
import pickBy from 'lodash-es/pickBy.js';
import { OpenshiftVersionOptionType } from '../../../types';
import {
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';
import { getKeys } from '../../../utils';

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
) => getKeys(errors).filter((field) => touched[field]);

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
  }, {} as Record<string, string>);
  return labels;
};

type InnerError = { path: string; message: string };
type InnerErrors = { inner: InnerError[] };
type FieldErrors = { [key: string]: string[] };

const fieldErrorReducer = (errors: InnerError[]): FieldErrors => {
  return errors.reduce<FieldErrors>(
    (memo, { path, message }) => ({
      ...memo,
      [path]: (memo[path] || []).concat(message),
    }),
    {},
  );
};

export const getDuplicates = (list: string[]): string[] => {
  const duplicateKeys = pickBy(groupBy(list), (x) => x.length > 1);
  return Object.keys(duplicateKeys);
};

export const getRichTextValidation =
  <T extends object>(schema: Yup.ObjectSchema<T> | Yup.Lazy<T>) =>
  async (values: T): Promise<FieldErrors | undefined> => {
    try {
      await schema.validate(values, {
        abortEarly: false,
      });
    } catch (e) {
      const { inner } = e as InnerErrors;
      if (!inner || inner.length === 0) {
        return {};
      }

      const baseFields: InnerError[] = [];
      const arraySubfields: InnerError[] = [];

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

export const labelsToArray = (labels: { [key in string]: string } = {}): string[] => {
  const result: string[] = [];
  for (const key in labels) {
    result.push(`${key}=${labels[key]}`);
  }
  return result;
};

export const getAddress = (addr: string) => {
  if (Address4.isValid(addr)) {
    return new Address4(addr);
  } else if (Address6.isValid(addr)) {
    return new Address6(addr);
  }
  return undefined;
};
