import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { K8sKind, KebabOption } from '@openshift-console/dynamic-plugin-sdk/lib/api/api-types';

export type KebabAction = (
  kind: K8sKind,
  obj: K8sResourceCommon,
  resources?: unknown,
  customData?: unknown,
) => KebabOption;
