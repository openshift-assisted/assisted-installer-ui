import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { AgentK8sResource } from './types';
import { isEqual } from 'lodash-es';
import { AgentModel } from './types/models';

export const appendPatch = <V>(patches: Patch[], path: string, newVal?: V, existingVal?: V) => {
  if (!isEqual(newVal, existingVal)) {
    patches.push({
      op: existingVal === undefined ? 'add' : 'replace',
      path,
      value: newVal,
    });
  }
};

export const onApproveAgent = (agent: AgentK8sResource) => {
  const patches: Patch[] = [];
  appendPatch(patches, '/spec/approved', true, agent.spec?.approved);
  return k8sPatch({ model: AgentModel, resource: agent, data: patches });
};
