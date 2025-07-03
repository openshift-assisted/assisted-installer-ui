import {
  getGroupVersionKindForResource,
  k8sCreate,
  K8sGroupVersionKind,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import * as yaml from 'js-yaml';
import { TFunction } from 'react-i18next';
import { getErrorMessage } from '../../../common/utils';

export const submitYamls = async (
  t: TFunction,
  yamls: string,
  models: K8sModel[],
): Promise<K8sResourceCommon[]> => {
  let yamlContent: K8sResourceCommon[] = [];
  try {
    yamlContent = yaml.loadAll(yamls) as K8sResourceCommon[];
  } catch (e) {
    throw t('ai:Failed to parse resources: {{err}}', { err: getErrorMessage(e) });
  }

  for (let i = 0; i < yamlContent.length; i++) {
    let gvk: K8sGroupVersionKind | undefined = undefined;
    try {
      gvk = getGroupVersionKindForResource(yamlContent[i]);
    } catch (e) {
      throw t('ai:Failed to parse resource {{index}}: {{err}}', {
        err: getErrorMessage(e),
        index: i,
      });
    }
    if (!gvk) {
      throw t('ai:Failed to parse resource {{index}}', { index: i });
    }
    const model = models.find(
      ({ kind, apiGroup, apiVersion }) =>
        gvk &&
        kind === gvk.kind &&
        apiVersion === gvk.version &&
        (apiGroup || 'core') === (gvk.group || 'core'),
    );
    if (!model) {
      throw t('ai:Unknown resource {{gvk}}', {
        gvk: `Kind: ${gvk.kind}, Group: ${gvk.group || 'core'}, Version: ${gvk.version}`,
      });
    }
    await k8sCreate({
      model,
      data: yamlContent[i],
    });
  }
  return yamlContent;
};
