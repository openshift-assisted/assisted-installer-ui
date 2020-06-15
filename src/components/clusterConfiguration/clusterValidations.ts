import * as _ from 'lodash';
import * as Yup from 'yup';
import { validateYupSchema, yupToFormErrors } from 'formik';
import { Cluster } from '../../api/types';
import { ClusterConfigurationValues } from '../../types/clusters';
import {
  pullSecretKnownOrRequired,
  sshPublicKeyValidationSchema,
} from '../ui/formik/validationSchemas';
import { getInitialValues } from './utils';
import { CLUSTER_FIELD_LABELS } from '../../config/constants';

export const validateHosts = (cluster: Cluster) => {
  const hosts = cluster.hosts || [];
  const masters = hosts.filter((r) => r.role === 'master').length;
  if (hosts.length < 3) {
    return `Cluster has insufficient number of hosts registered. Please register at least 3 hosts.`;
  }
  if (masters < 3) {
    return `Cluster with ${masters} masters is not supported. Please choose at least 3 master hosts.`;
  }
  if (masters % 2 === 0) {
    return `Cluster with ${masters} masters is not supported. Please set an odd number of master hosts.`;
  }
  const readyMasters =
    cluster.hosts?.filter((host) => host.role === 'master' && host.status === 'known') || [];
  if (readyMasters.length < 3) {
    return `Cluster has insufficient number of hosts ready for installation. Minimum of 3 master hosts in 'Known' state is required.`;
  }
};

// TODO(jtomasek): Add validation to identify hosts which are connected to network defined by VIPs
// const validateConnectedHosts = (cluster: Cluster) => ...;

export const validateRequiredFields = (cluster: Cluster) => {
  const values = getInitialValues(cluster);
  const requiredSchema = Yup.mixed().required();

  const installValidationSchema = Yup.object<ClusterConfigurationValues>().shape({
    baseDnsDomain: requiredSchema,
    clusterNetworkHostPrefix: requiredSchema,
    clusterNetworkCidr: requiredSchema,
    serviceNetworkCidr: requiredSchema,
    apiVip: requiredSchema,
    ingressVip: requiredSchema,
    pullSecret: pullSecretKnownOrRequired(values),
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
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `Warning: An unhandled error was caught during validation in 'validateRequiredFields'`,
          err,
        );
      }
    }
  }
};

export const validateCluster = (cluster: Cluster) => {
  return _.filter([validateHosts(cluster), validateRequiredFields(cluster)]);
};
