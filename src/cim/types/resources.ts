import { K8sResourceCommon } from 'console-sdk-ai-lib';

type ResourceType = K8sResourceCommon;
// { apiVersion: string; kind: string; metadata?: ObjectMetadata };

// export const convertResource = (res: K8sResourceCommon): ResourceType => ({
//   apiVersion: res.apiVersion || '',
//   kind: res.kind || '',
//   metadata: {
//     name: res.metadata?.name,
//     namespace: res.metadata?.namespace,
//   },
// });

export type CreateResourceFuncType = (resource: ResourceType) => Promise<ResourceType>;
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
