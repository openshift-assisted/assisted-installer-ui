import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ResourceType = K8sResourceCommon;

export type CreateResourceFuncType = (resource: ResourceType) => Promise<ResourceType>;
export type DeleteResourceFuncType = (resource: ResourceType) => Promise<void>;
export type GetResourceFuncType = (resource: ResourceType) => Promise<ResourceType>;
export type ListResourcesFuncType = (
  resource: { apiVersion: string; kind: string; metadata?: { namespace?: string } },
  labels?: string[],
) => Promise<ResourceType[]>;
export type ResourcePatch = { op: 'replace' | 'add'; path: string; value: unknown };
export type PatchResourceFuncType = (
  resource: ResourceType,
  patches: ResourcePatch[],
) => Promise<ResourceType>;
