import * as _ from 'lodash';
import * as Yup from 'yup';
import { validateYupSchema, yupToFormErrors } from 'formik';
import { Cluster, ManagedDomain } from '../../api/types';
import { ClusterConfigurationValues } from '../../types/clusters';
import { sshPublicKeyValidationSchema } from '../ui/formik/validationSchemas';
import { getInitialValues } from './utils';
import { CLUSTER_FIELD_LABELS } from '../../config/constants';
import { captureException, SEVERITY } from '../../sentry';

// TODO(jtomasek): Add validation to identify hosts which are connected to network defined by VIPs
// const validateConnectedHosts = (cluster: Cluster) => ...;

const validateRequiredFields = (cluster: Cluster, managedDomains: ManagedDomain[]) => {
  const values = getInitialValues(cluster, managedDomains);
  const requiredSchema = Yup.mixed().required();

  const installValidationSchema = Yup.object<ClusterConfigurationValues>().shape({
    baseDnsDomain: requiredSchema,
    clusterNetworkHostPrefix: requiredSchema,
    clusterNetworkCidr: requiredSchema,
    serviceNetworkCidr: requiredSchema,
    apiVip: requiredSchema,
    ingressVip: requiredSchema,
    sshPublicKey: sshPublicKeyValidationSchema,
  });
  try {
    validateYupSchema<ClusterConfigurationValues>(values, installValidationSchema, true);
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const errors = yupToFormErrors(err);
      const errorFields = Object.keys(errors).map((field: string) => CLUSTER_FIELD_LABELS[field]);
      return `Not all required cluster properties are configured yet: ${errorFields.join(', ')}.`;
    } else {
      captureException(
        `Warning: An unhandled error was caught during validation in 'validateRequiredFields'`,
        err,
        SEVERITY.WARN,
      );
    }
  }
};

export const validateCluster = (cluster: Cluster, managedDomains: ManagedDomain[] = []) => {
  return _.filter([validateRequiredFields(cluster, managedDomains)]);
};
