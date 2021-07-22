import { K8sResourceCommon } from 'console-sdk-ai-lib';
import { K8sKind, KebabOption } from 'console-sdk-ai-lib/lib/api/api-types';

export type KebabAction = (
  kind: K8sKind,
  obj: K8sResourceCommon,
  resources?: unknown,
  customData?: unknown,
) => KebabOption;
