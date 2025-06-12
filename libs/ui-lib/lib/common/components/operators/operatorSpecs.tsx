import React from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { FeatureId } from '../../types';
import {
  OPERATOR_NAME_AMD_GPU,
  OPERATOR_NAME_AUTHORINO,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_KMM,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_MCE,
  OPERATOR_NAME_MTV,
  OPERATOR_NAME_NMSTATE,
  OPERATOR_NAME_NODE_FEATURE_DISCOVERY,
  OPERATOR_NAME_NVIDIA_GPU,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_OPENSHIFT_AI,
  OPERATOR_NAME_OSC,
  OPERATOR_NAME_PIPELINES,
  OPERATOR_NAME_SERVERLESS,
  OPERATOR_NAME_SERVICEMESH,
  OPERATOR_NAME_NODE_HEALTHCHECK,
  OPERATOR_NAME_SELF_NODE_REMEDIATION,
  OPERATOR_NAME_FENCE_AGENTS_REMEDIATION,
  OPERATOR_NAME_NODE_MAINTENANCE,
  OPERATOR_NAME_KUBE_DESCHEDULER,
} from '../../config/constants';
import { ExternalLink } from '../ui';
import {
  AUTHORINO_OPERATOR_LINK,
  CNV_LINK,
  FENCE_AGENTS_REMEDIATION_LINK,
  getKubeDeschedulerLink,
  getLsoLink,
  getLvmsDocsLink,
  getMceDocsLink,
  getNmstateLink,
  getNodeFeatureDiscoveryLink,
  getNvidiaGpuLink,
  getServiceMeshLink,
  KMM_LINK,
  MTV_LINK,
  NODE_HEALTHCHECK_LINK,
  ODF_LINK,
  ODF_REQUIREMENTS_LINK,
  OPENSHIFT_AI_LINK,
  OPENSHIFT_AI_REQUIREMENTS_LINK,
  OSC_LINK,
  OSC_REQUIREMENTS_LINK,
  PIPELINES_OPERATOR_LINK,
  SELF_NODE_REMEDIATION_LINK,
  SERVERLESS_OPERATOR_LINK,
} from '../../config';
import { getMajorMinorVersion } from '../../utils';
import { useNewFeatureSupportLevel } from '../newFeatureSupportLevels';
import {
  DESCRIPTION_AMD_GPU,
  DESCRIPTION_AUTHORINO,
  DESCRIPTION_LSO,
  DESCRIPTION_MTV,
  DESCRIPTION_CNV,
  DESCRIPTION_FENCE_AGENTS_REMEDIATION,
  DESCRIPTION_KMM,
  DESCRIPTION_KUBE_DESCHEDULER,
  DESCRIPTION_MCE,
  DESCRIPTION_NMSTATE,
  DESCRIPTION_NODE_FEATURE_DISCOVERY,
  DESCRIPTION_NODE_HEALTHCHECK,
  DESCRIPTION_NODE_MAINTENANCE,
  DESCRIPTION_NVIDIA_GPU,
  DESCRIPTION_ODF,
  DESCRIPTION_OPENSHIFT_AI,
  DESCRIPTION_OSC,
  DESCRIPTION_PIPELINES,
  DESCRIPTION_SELF_NODE_REMEDIATION,
  DESCRIPTION_SERVERLESS,
  DESCRIPTION_SERVICEMESH,
  DESCRIPTION_LVM,
} from './operatorDescriptions';

export const isOCPVersionEqualsOrMore = (
  openshiftVersion: string,
  ocpVersionToCompare: string,
): boolean => {
  const [majorA, minorA] = getMajorMinorVersion(openshiftVersion).split('.');
  const [majorB, minorB] = ocpVersionToCompare.split('.');
  return (
    Number(majorA) > Number(majorB) ||
    (Number(majorA) === Number(majorB) && Number(minorA) >= Number(minorB))
  );
};

export type OperatorSpec = {
  title: string;
  featureId: FeatureId;
  descriptionText?: string;
  Description?: React.ComponentType<{ openshiftVersion?: string }>;
  notStandalone?: boolean;
  Requirements?: React.ComponentType<{ cluster: Cluster }>;
  category: string;
};

export const getOperatorSpecs = (useLVMS?: boolean): { [key: string]: OperatorSpec } => {
  return {
    [OPERATOR_NAME_MTV]: {
      title: 'Migration Toolkit for Virtualization',
      featureId: 'MTV',
      descriptionText: DESCRIPTION_MTV,
      Description: () => (
        <>
          {DESCRIPTION_MTV} <ExternalLink href={MTV_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'Virtualization',
    },
    [OPERATOR_NAME_AMD_GPU]: {
      title: 'AMD GPU',
      featureId: 'AMD_GPU',
      descriptionText: DESCRIPTION_AMD_GPU,
      Requirements: () => <>Requires at least one supported AMD GPU</>,
      Description: () => <>{DESCRIPTION_AMD_GPU}</>,
      category: 'AI',
    },
    [OPERATOR_NAME_LSO]: {
      title: 'Local Storage Operator',
      featureId: 'LSO',
      descriptionText: DESCRIPTION_LSO,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_LSO}{' '}
          <ExternalLink href={getLsoLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Storage',
    },
    [OPERATOR_NAME_AUTHORINO]: {
      title: 'Authorino',
      featureId: 'AUTHORINO',
      descriptionText: DESCRIPTION_AUTHORINO,
      Description: () => (
        <>
          {DESCRIPTION_AUTHORINO}{' '}
          <ExternalLink href={AUTHORINO_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Other',
    },
    [OPERATOR_NAME_CNV]: {
      title: 'OpenShift Virtualization',
      featureId: 'CNV',
      descriptionText: DESCRIPTION_CNV,
      Requirements: () => (
        <>Enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all nodes</>
      ),
      Description: () => (
        <>
          {DESCRIPTION_CNV} <ExternalLink href={CNV_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'Virtualization',
    },
    [OPERATOR_NAME_FENCE_AGENTS_REMEDIATION]: {
      title: 'Fence Agents Remediation',
      featureId: 'FENCE_AGENTS_REMEDIATION',
      descriptionText: DESCRIPTION_FENCE_AGENTS_REMEDIATION,
      Description: () => (
        <>
          {DESCRIPTION_FENCE_AGENTS_REMEDIATION}{' '}
          <ExternalLink href={FENCE_AGENTS_REMEDIATION_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Remediation',
    },
    [OPERATOR_NAME_KMM]: {
      title: 'Kernel Module Management',
      featureId: 'KMM',
      descriptionText: DESCRIPTION_KMM,
      Description: () => (
        <>
          {DESCRIPTION_KMM} <ExternalLink href={KMM_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'Other',
    },
    [OPERATOR_NAME_KUBE_DESCHEDULER]: {
      title: 'Kube Descheduler',
      featureId: 'KUBE_DESCHEDULER',
      descriptionText: DESCRIPTION_KUBE_DESCHEDULER,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_KUBE_DESCHEDULER}{' '}
          <ExternalLink href={getKubeDeschedulerLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Other',
    },
    [OPERATOR_NAME_MCE]: {
      title: 'Multicluster engine',
      featureId: 'MCE',
      descriptionText: DESCRIPTION_MCE,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_MCE}{' '}
          <ExternalLink href={getMceDocsLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      category: 'Other',
    },
    [OPERATOR_NAME_NMSTATE]: {
      title: 'NMState',
      featureId: 'NMSTATE',
      descriptionText: DESCRIPTION_NMSTATE,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_NMSTATE}{' '}
          <ExternalLink href={getNmstateLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      category: 'Network',
    },
    [OPERATOR_NAME_NODE_FEATURE_DISCOVERY]: {
      title: 'Node Feature Discovery',
      featureId: 'NODE_FEATURE_DISCOVERY',
      descriptionText: DESCRIPTION_NODE_FEATURE_DISCOVERY,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_NODE_FEATURE_DISCOVERY}{' '}
          <ExternalLink href={getNodeFeatureDiscoveryLink(openshiftVersion)}>
            Learn more
          </ExternalLink>
        </>
      ),
      category: 'Other',
    },
    [OPERATOR_NAME_NODE_HEALTHCHECK]: {
      title: 'Node Healthcheck',
      featureId: 'NODE_HEALTHCHECK',
      descriptionText: DESCRIPTION_NODE_HEALTHCHECK,
      Description: () => (
        <>
          {DESCRIPTION_NODE_HEALTHCHECK}{' '}
          <ExternalLink href={NODE_HEALTHCHECK_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Remediation',
    },
    [OPERATOR_NAME_NODE_MAINTENANCE]: {
      title: 'Node Maintenance',
      featureId: 'NODE_MAINTENANCE',
      descriptionText: DESCRIPTION_NODE_MAINTENANCE,
      Description: () => (
        <>
          {DESCRIPTION_NODE_MAINTENANCE}{' '}
          <ExternalLink href={NODE_HEALTHCHECK_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Other',
    },
    [OPERATOR_NAME_NVIDIA_GPU]: {
      title: 'NVIDIA GPU',
      featureId: 'NVIDIA_GPU',
      descriptionText: DESCRIPTION_NVIDIA_GPU,
      Requirements: () => <>Requires at least one supported NVIDIA GPU</>,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_NVIDIA_GPU}
          <ExternalLink href={getNvidiaGpuLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      category: 'AI',
    },
    [OPERATOR_NAME_ODF]: {
      title: 'OpenShift Data Foundation',
      featureId: 'ODF',
      descriptionText: DESCRIPTION_ODF,
      Requirements: () => (
        <ExternalLink href={ODF_REQUIREMENTS_LINK}>
          Learn more about the requirements for OpenShift Data Foundation
        </ExternalLink>
      ),
      Description: () => (
        <>
          {DESCRIPTION_ODF} <ExternalLink href={ODF_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'Storage',
    },
    [OPERATOR_NAME_OPENSHIFT_AI]: {
      title: 'OpenShift AI',
      featureId: 'OPENSHIFT_AI',
      descriptionText: DESCRIPTION_OPENSHIFT_AI,
      Requirements: () => (
        <ExternalLink href={OPENSHIFT_AI_REQUIREMENTS_LINK}>Learn more</ExternalLink>
      ),
      Description: () => (
        <>
          {DESCRIPTION_OPENSHIFT_AI}{' '}
          <ExternalLink href={OPENSHIFT_AI_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'AI',
    },
    [OPERATOR_NAME_OSC]: {
      title: 'OpenShift sandboxed containers',
      featureId: 'OSC',
      descriptionText: DESCRIPTION_OSC,
      Requirements: () => (
        <ExternalLink href={OSC_REQUIREMENTS_LINK}>
          Learn more about the requirements for OpenShift sandboxed containers
        </ExternalLink>
      ),
      Description: () => (
        <>
          {DESCRIPTION_OSC} <ExternalLink href={OSC_LINK}>Learn more</ExternalLink>
        </>
      ),
      category: 'Other',
    },
    [OPERATOR_NAME_PIPELINES]: {
      title: 'Pipelines',
      featureId: 'PIPELINES',
      descriptionText: DESCRIPTION_PIPELINES,
      Description: () => (
        <>
          {DESCRIPTION_PIPELINES}{' '}
          <ExternalLink href={PIPELINES_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Other',
    },
    [OPERATOR_NAME_SELF_NODE_REMEDIATION]: {
      title: 'Self Node Remediation',
      featureId: 'SELF_NODE_REMEDIATION',
      descriptionText: DESCRIPTION_SELF_NODE_REMEDIATION,
      Description: () => (
        <>
          {DESCRIPTION_SELF_NODE_REMEDIATION}{' '}
          <ExternalLink href={SELF_NODE_REMEDIATION_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Remediation',
    },
    [OPERATOR_NAME_SERVERLESS]: {
      title: 'Serverless',
      featureId: 'SERVERLESS',
      descriptionText: DESCRIPTION_SERVERLESS,
      Description: () => (
        <>
          {DESCRIPTION_SERVERLESS}{' '}
          <ExternalLink href={SERVERLESS_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Other',
    },
    [OPERATOR_NAME_SERVICEMESH]: {
      title: 'Service Mesh',
      featureId: 'SERVICEMESH',
      descriptionText: DESCRIPTION_SERVICEMESH,
      Description: ({ openshiftVersion }) => (
        <>
          {DESCRIPTION_SERVICEMESH}{' '}
          <ExternalLink href={getServiceMeshLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
      category: 'Network',
    },
    [OPERATOR_NAME_LVM]: {
      title: useLVMS ? 'Logical Volume Manager Storage' : 'Logical Volume Manager',
      featureId: 'LVM',
      descriptionText: DESCRIPTION_LVM,
      Description: ({ openshiftVersion }) =>
        useLVMS ? (
          <>
            {DESCRIPTION_LVM}{' '}
            <ExternalLink href={getLvmsDocsLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ) : (
          <>{DESCRIPTION_LVM}</>
        ),
      category: 'Storage',
    },
  };
};

export const useOperatorSpecs = () => {
  const { getFeatureSupportLevel } = useNewFeatureSupportLevel();
  const useLVMS = getFeatureSupportLevel('LVM') === 'supported';
  return React.useMemo(() => getOperatorSpecs(useLVMS), [useLVMS]);
};
