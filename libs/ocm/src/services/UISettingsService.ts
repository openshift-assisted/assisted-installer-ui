import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import UISettingsAPI from '@openshift-assisted/common/api/assisted-service/UISettingsAPI';
import { UISettingsValues } from '@openshift-assisted/common';

const PREFIX_LENGHT = 6;

const UISettingService = {
  async fetch(clusterId: Cluster['id']) {
    const { data } = await UISettingsAPI.get(clusterId);
    return (data.length ? JSON.parse(data.slice(PREFIX_LENGHT)) : {}) as UISettingsValues;
  },
  update(clusterId: Cluster['id'], data: UISettingsValues) {
    return UISettingsAPI.put(clusterId, `AI_UI:${JSON.stringify(data)}`);
  },
};

export default UISettingService;
