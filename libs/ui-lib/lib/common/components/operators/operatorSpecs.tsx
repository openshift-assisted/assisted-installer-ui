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
  Description?: React.ComponentType<{ openshiftVersion?: string }>;
  notStandalone?: boolean;
  Requirements?: React.ComponentType<{ cluster: Cluster }>;
};

export const getOperatorSpecs = (useLVMS?: boolean): { [key: string]: OperatorSpec } => {
  return {
    [OPERATOR_NAME_MTV]: {
      title: 'Migration Toolkit for Virtualization',
      featureId: 'MTV',
      Description: () => (
        <>
          This Toolkit (MTV) enables you to migrate virtual machines from VMware vSphere, Red Hat
          Virtualization, or OpenStack to OpenShift Virtualization running on Red Hat OpenShift.{' '}
          <ExternalLink href={MTV_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_AMD_GPU]: {
      title: 'AMD GPU',
      featureId: 'AMD_GPU',
      Requirements: () => <>Requires at least one supported AMD GPU</>,
      Description: () => (
        <>
          Automate the management of AMD software components needed to provision and monitor GPUs.
        </>
      ),
    },
    [OPERATOR_NAME_LSO]: {
      title: 'Local Storage Operator',
      featureId: 'LSO',
      Description: ({ openshiftVersion }) => (
        <>
          Allows provisioning of persistent storage by using local volumes.{' '}
          <ExternalLink href={getLsoLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_AUTHORINO]: {
      title: 'Authorino',
      featureId: 'AUTHORINO',
      Description: () => (
        <>
          Lightweight external authorization service for tailor-made Zero Trust API security.{' '}
          <ExternalLink href={AUTHORINO_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_CNV]: {
      title: 'OpenShift Virtualization',
      featureId: 'CNV',
      Requirements: () => (
        <>Enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all nodes</>
      ),
      Description: () => (
        <>
          Run virtual machines alongside containers on one platform.{' '}
          <ExternalLink href={CNV_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_FENCE_AGENTS_REMEDIATION]: {
      title: 'Fence Agents Remediation',
      featureId: 'FENCE_AGENTS_REMEDIATION',
      Description: () => (
        <>
          Externally fences failed nodes using power controllers.{' '}
          <ExternalLink href={FENCE_AGENTS_REMEDIATION_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_KMM]: {
      title: 'Kernel Module Management',
      featureId: 'KMM',
      Description: () => (
        <>
          Management of kernel modules. <ExternalLink href={KMM_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_KUBE_DESCHEDULER]: {
      title: 'Kube Descheduler',
      featureId: 'KUBE_DESCHEDULER',
      Description: () => (
        <>
          Evicts pods to reschedule them onto more suitable nodes.{' '}
          <ExternalLink href={NODE_HEALTHCHECK_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_MCE]: {
      title: 'Multicluster engine',
      featureId: 'MCE',
      Description: ({ openshiftVersion }) => (
        <>
          Create, import, and manage multiple clusters from this cluster.{' '}
          <ExternalLink href={getMceDocsLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_NMSTATE]: {
      title: 'NMState',
      featureId: 'NMSTATE',
      Description: ({ openshiftVersion }) => (
        <>
          Provides users with functionality to configure various network interface types, DNS, and
          routing on cluster nodes.{' '}
          <ExternalLink href={getNmstateLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_NODE_FEATURE_DISCOVERY]: {
      title: 'Node Feature Discovery',
      featureId: 'NODE_FEATURE_DISCOVERY',
      Description: ({ openshiftVersion }) => (
        <>
          Manage the detection of hardware features and configuration by labeling nodes with
          hardware-specific information.{' '}
          <ExternalLink href={getNodeFeatureDiscoveryLink(openshiftVersion)}>
            Learn more
          </ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_NODE_HEALTHCHECK]: {
      title: 'Node Healthcheck',
      featureId: 'NODE_HEALTHCHECK',
      Description: () => (
        <>
          Identify Unhealthy Nodes.{' '}
          <ExternalLink href={NODE_HEALTHCHECK_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_NODE_MAINTENANCE]: {
      title: 'Node Maintenance',
      featureId: 'NODE_MAINTENANCE',
      Description: () => (
        <>
          Place nodes in maintenance mode.{' '}
          <ExternalLink href={NODE_HEALTHCHECK_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_NVIDIA_GPU]: {
      title: 'NVIDIA GPU',
      featureId: 'NVIDIA_GPU',
      Requirements: () => <>Requires at least one supported NVIDIA GPU</>,
      Description: ({ openshiftVersion }) => (
        <>
          Automate the management of NVIDIA software components needed to provision and monitor
          GPUs. <ExternalLink href={getNvidiaGpuLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_ODF]: {
      title: 'OpenShift Data Foundation',
      featureId: 'ODF',
      Requirements: () => (
        <ExternalLink href={ODF_REQUIREMENTS_LINK}>
          Learn more about the requirements for OpenShift Data Foundation
        </ExternalLink>
      ),
      Description: () => (
        <>
          Persistent software-defined storage for hybrid applications.{' '}
          <ExternalLink href={ODF_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_OPENSHIFT_AI]: {
      title: 'OpenShift AI',
      featureId: 'OPENSHIFT_AI',
      Requirements: () => (
        <ExternalLink href={OPENSHIFT_AI_REQUIREMENTS_LINK}>Learn more</ExternalLink>
      ),
      Description: () => (
        <>
          Train, serve, monitor and manage AI/ML models and applications.{' '}
          <ExternalLink href={OPENSHIFT_AI_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_OSC]: {
      title: 'OpenShift sandboxed containers',
      featureId: 'OSC',
      Requirements: () => (
        <ExternalLink href={OSC_REQUIREMENTS_LINK}>
          Learn more about the requirements for OpenShift sandboxed containers
        </ExternalLink>
      ),
      Description: () => (
        <>
          OpenShift sandboxed containers support for OpenShift Container Platform provides users
          with built-in support for running Kata Containers as an additional optional runtime. It
          provides an additional virtualization machine(VM) isolation layer for pods.{' '}
          <ExternalLink href={OSC_LINK}>Learn more</ExternalLink>
        </>
      ),
    },
    [OPERATOR_NAME_PIPELINES]: {
      title: 'Pipelines',
      featureId: 'PIPELINES',
      Description: () => (
        <>
          Cloud-native continuous integration and delivery (CI/CD) solution for building pipelines
          using Tekton. <ExternalLink href={PIPELINES_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_SELF_NODE_REMEDIATION]: {
      title: 'Self Node Remediation',
      featureId: 'SELF_NODE_REMEDIATION',
      Description: () => (
        <>
          Allows nodes to reboot themselves when they become unhealthy.{' '}
          <ExternalLink href={SELF_NODE_REMEDIATION_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_SERVERLESS]: {
      title: 'Serverless',
      featureId: 'SERVERLESS',
      Description: () => (
        <>
          Deploy workflow applications based on the CNCF Serverless Workflow specification.{' '}
          <ExternalLink href={SERVERLESS_OPERATOR_LINK}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_SERVICEMESH]: {
      title: 'Service Mesh',
      featureId: 'SERVICEMESH',
      Description: ({ openshiftVersion }) => (
        <>
          Platform that provides behavioral insight and operational control over a service mesh.{' '}
          <ExternalLink href={getServiceMeshLink(openshiftVersion)}>Learn more</ExternalLink>
        </>
      ),
      notStandalone: true,
    },
    [OPERATOR_NAME_LVM]: {
      title: useLVMS ? 'Logical Volume Manager Storage' : 'Logical Volume Manager',
      featureId: 'LVM',
      Description: ({ openshiftVersion }) =>
        useLVMS ? (
          <>
            Storage virtualization that offers a more flexible approach for disk space management.{' '}
            <ExternalLink href={getLvmsDocsLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ) : (
          <>
            Storage virtualization that offers a more flexible approach for disk space management.
          </>
        ),
    },
  };
};

export const useOperatorSpecs = () => {
  const { getFeatureSupportLevel } = useNewFeatureSupportLevel();
  const useLVMS = getFeatureSupportLevel('LVM') === 'supported';
  return React.useMemo(() => getOperatorSpecs(useLVMS), [useLVMS]);
};
