import {
  HostStaticNetworkConfig,
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import Yup from 'yup';
import { FormikErrors, FormikTouched } from 'formik';

export type StaticIpFormState = {
  isAutoSaveRunning: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  touched: FormikTouched<object>;
  errors: FormikErrors<object>;
  isEmpty: boolean;
};

export type StaticIpProps = {
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

export type StaticIpPageProps = StaticIpProps & {
  onFormStateChange(formState: StaticIpFormState): void;
};

export type StaticIpViewProps = StaticIpPageProps & {
  showEmptyValues: boolean;
};

export type StaticIpFormProps<StaticIpViewValues extends object> = StaticIpViewProps & {
  showEmptyValues: boolean;
  getInitialValues(infraEnv: InfraEnv): StaticIpViewValues;
  getUpdateParams(currentInfraEnv: InfraEnv, values: StaticIpViewValues): HostStaticNetworkConfig[];
  validationSchema: Yup.ObjectSchema<Yup.AnyObject> | Yup.Lazy<Yup.AnyObject>;
  getEmptyValues(): StaticIpViewValues;
};
