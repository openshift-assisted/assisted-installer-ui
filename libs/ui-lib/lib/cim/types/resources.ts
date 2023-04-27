import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// To conform ACM
type ResourceType = {
  // status?: any;
  apiVersion: string;
  kind: string;
  metadata?: {
    name?: string;
    namespace?: string;
    resourceVersion?: string;
    creationTimestamp?: string;
    uid?: string;
    annotations?: Record<string, string>;
    labels?: Record<string, string>;
    generateName?: string;
    deletionTimestamp?: string;
    selfLink?: string;
    finalizers?: string[];
    ownerReferences?: {
      apiVersion: string;
      blockOwnerDeletion?: boolean;
      controller?: boolean;
      kind: string;
      name: string;
      uid?: string;
    }[];
    // managedFields?: any[];
  };
};

export type CreateResourceFuncType = (resource: ResourceType) => Promise<ResourceType>;
export type DeleteResourceFuncType = (resource: ResourceType) => Promise<void>;
export type GetResourceFuncType = (resource: ResourceType) => Promise<ResourceType>;
export type ListResourcesFuncType = (
  resource: { apiVersion: string; kind: string; metadata?: { namespace?: string } },
  labels?: string[],
  query?: Record<string, string>,
) => Promise<ResourceType[]>;
export type ResourcePatch = { op: 'replace' | 'add'; path: string; value: unknown };
export type PatchResourceFuncType = (
  resource: ResourceType,
  patches: ResourcePatch[],
) => Promise<ResourceType>;

export const convertOCPtoCIMResourceHeader = (res: K8sResourceCommon): ResourceType => ({
  apiVersion: res.apiVersion || '',
  kind: res.kind || '',
  metadata: res.metadata,
});
