import { FormikErrors, FormikTouched } from 'formik';
import Yup from 'yup';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { ManifestFormData, ListManifestsExtended } from '../data/dataTypes';

export type CustomManifestFormState = {
  isAutoSaveRunning: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  touched: FormikTouched<object>;
  errors: FormikErrors<object>;
  isEmpty: boolean;
};

export type CustomManifestsFormProps = {
  onFormStateChange(formState: CustomManifestFormState): void;
  showEmptyValues: boolean;
  getInitialValues(customManifests: ListManifestsExtended): ManifestFormData;
  getEmptyValues(): ManifestFormData;
  validationSchema: Yup.ObjectSchema<Yup.AnyObject>;
  cluster: Cluster;
};

export type CustomManifestComponentProps = {
  manifestIdx: number;
  fieldName: string;
  isDisabled?: boolean;
};
