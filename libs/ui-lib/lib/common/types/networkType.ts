import type { FeatureSupportLevelId } from '@openshift-assisted/types/assisted-installer-service';
import { TFunction } from 'i18next';

export type NetworkTypeKey =
  | 'OVNKubernetes'
  | 'OpenShiftSDN'
  | 'CiscoACI'
  | 'Cilium'
  | 'Calico'
  | 'None';

export const NETWORK_TYPE_OVN: NetworkTypeKey = 'OVNKubernetes';
export const NETWORK_TYPE_SDN: NetworkTypeKey = 'OpenShiftSDN';
export const NETWORK_TYPE_CISCO_ACI: NetworkTypeKey = 'CiscoACI';
export const NETWORK_TYPE_CILIUM: NetworkTypeKey = 'Cilium';
export const NETWORK_TYPE_CALICO: NetworkTypeKey = 'Calico';
export const NETWORK_TYPE_NONE: NetworkTypeKey = 'None';

export const NETWORK_TYPE_LABELS = (t: TFunction): Record<string, string> => ({
  [NETWORK_TYPE_OVN]: t('ai:Open Virtual Networking (OVN)'),
  [NETWORK_TYPE_SDN]: t('ai:Software-Defined Networking (SDN)'),
  [NETWORK_TYPE_CISCO_ACI]: t('ai:Cisco ACI'),
  [NETWORK_TYPE_CILIUM]: t('ai:Isovalent Cilium'),
  [NETWORK_TYPE_CALICO]: t('ai:Tigera Calico'),
  [NETWORK_TYPE_NONE]: t('ai:None (Custom CNI)'),
});

export const NETWORK_TYPE_FEATURE_IDS: Record<string, FeatureSupportLevelId> = {
  [NETWORK_TYPE_OVN]: 'OVN_NETWORK_TYPE',
  [NETWORK_TYPE_SDN]: 'SDN_NETWORK_TYPE',
  [NETWORK_TYPE_CISCO_ACI]: 'CISCO_ACI_NETWORK_TYPE',
  [NETWORK_TYPE_CILIUM]: 'CILIUM_NETWORK_TYPE',
  [NETWORK_TYPE_CALICO]: 'CALICO_NETWORK_TYPE',
  [NETWORK_TYPE_NONE]: 'NONE_NETWORK_TYPE',
};

export const isThirdPartyCNI = (networkType: string | undefined): boolean =>
  !!networkType && networkType !== NETWORK_TYPE_OVN && networkType !== NETWORK_TYPE_SDN;
