import * as Yup from 'yup';
import isCIDR from 'is-cidr';

import {
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/./assisted-installer-service';
import {
  hostPrefixValidationSchema,
  hostSubnetValidationSchema,
  ipBlockValidationSchema,
} from './addressValidation';
import { isMajorMinorVersionEqualOrGreater } from '../utils';
import { allSubnetsIPv4 } from '../components/ui/formik/utils';

export const machineNetworksValidationSchema = Yup.array().of(
  Yup.object({ cidr: hostSubnetValidationSchema, clusterId: Yup.string() }),
);

export const clusterNetworksValidationSchema = Yup.array().of(
  Yup.lazy((values: ClusterNetwork) =>
    Yup.object({
      cidr: ipBlockValidationSchema(
        undefined /* So far used in OCM only and so validated by backend */,
      ),
      hostPrefix: hostPrefixValidationSchema(values.cidr),
      clusterId: Yup.string(),
    }),
  ),
);

export const serviceNetworkValidationSchema = Yup.array().of(
  Yup.object({
    cidr: ipBlockValidationSchema(
      undefined /* So far used in OCM only and so validated by backend */,
    ),
    clusterId: Yup.string(),
  }),
);

export const dualStackValidationSchema = (field: string, openshiftVersion?: string) =>
  Yup.array()
    .max(2, `Maximum number of ${field} subnets in dual stack is 2.`)
    .test(
      'dual-stack-ipv4',
      openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12')
        ? 'First network has to be a valid IPv4 or IPv6 subnet.'
        : 'First network has to be IPv4 subnet.',
      (values?: { cidr: MachineNetwork['cidr'] }[]): boolean => {
        // For OCP versions > 4.11, allow IPv6 as primary network
        if (openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12')) {
          return !!values?.[0].cidr && (isCIDR.v4(values[0].cidr) || isCIDR.v6(values[0].cidr));
        }
        // For older versions, require IPv4 as primary network
        return !!values?.[0].cidr && isCIDR.v4(values[0].cidr);
      },
    )
    .test(
      'dual-stack-unique-cidrs',
      `Provided ${field} subnets must be unique.`,
      (values?: { cidr?: MachineNetwork['cidr'] }[]) => {
        if (!values || values.length < 2) {
          return true;
        }
        const first = values[0]?.cidr || '';
        const second = values[1]?.cidr || '';
        if (!first || !second) {
          return true;
        }
        const firstIsCidr = isCIDR.v4(first) || isCIDR.v6(first);
        const secondIsCidr = isCIDR.v4(second) || isCIDR.v6(second);
        if (!firstIsCidr || !secondIsCidr) {
          return true;
        }
        return first !== second;
      },
    )
    .test(
      'dual-stack-opposite-families',
      `When two ${field} are provided, one must be IPv4 and the other IPv6.`,
      (values?: { cidr?: MachineNetwork['cidr'] }[]) => {
        if (!values || values.length < 2) {
          return true;
        }
        const a = values[0]?.cidr || '';
        const b = values[1]?.cidr || '';
        if (!a || !b) {
          return true;
        }
        const a4 = isCIDR.v4(a);
        const a6 = isCIDR.v6(a);
        const b4 = isCIDR.v4(b);
        const b6 = isCIDR.v6(b);
        if (!((a4 || a6) && (b4 || b6))) {
          return true;
        }
        return (a4 && b6) || (a6 && b4);
      },
    );

export const IPv4ValidationSchema = Yup.array().test(
  'single-stack',
  `All network subnets must be IPv4.`,
  (values?: (MachineNetwork | ClusterNetwork | ServiceNetwork)[]) => allSubnetsIPv4(values),
);
