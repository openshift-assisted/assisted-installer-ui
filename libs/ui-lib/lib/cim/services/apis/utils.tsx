import * as jsonpatch from 'fast-json-patch';
import {
  k8sCreate,
  k8sDelete,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const reconcileResources = async (
  desiredResources: K8sResourceCommon[],
  existingResources: K8sResourceCommon[],
  model: K8sModel,
  dryRun?: boolean,
) => {
  const toDelete = existingResources.filter(
    (existing) =>
      !desiredResources.find((desired) => existing.metadata?.uid === desired.metadata?.uid),
  );

  const toPatch = desiredResources.filter((desired) =>
    existingResources.find((existing) => existing.metadata?.uid === desired.metadata?.uid),
  );
  const toCreate = desiredResources.filter(
    (desired) =>
      !existingResources.find((existing) => existing.metadata?.uid === desired.metadata?.uid),
  );

  const promises = [] as Promise<K8sResourceCommon>[];
  const queryParams = dryRun ? { dryRun: 'All' } : undefined;

  toDelete.forEach((resource) => promises.push(k8sDelete({ model, resource, queryParams })));
  toCreate.forEach((resource) => promises.push(k8sCreate({ model, data: resource, queryParams })));
  toPatch.forEach((resource) => {
    const existing = existingResources.find(
      (existing) => existing.metadata?.uid === resource.metadata?.uid,
    ) as K8sResourceCommon;
    const patch = jsonpatch.compare(existing, resource);

    if (!!patch.length) {
      promises.push(k8sPatch({ model, resource: existing, data: patch, queryParams }));
    }
  });

  await Promise.allSettled(promises).then((result) => {
    if (result.some((res) => res.status === 'rejected')) {
      throw result;
    }
  });
};
