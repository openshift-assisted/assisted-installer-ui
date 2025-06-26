import React from 'react';
import { Cluster, SupportLevel } from '@openshift-assisted/types/assisted-installer-service';
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
  OPERATOR_NAME_NODE_MAINTENANCE,
  OPERATOR_NAME_KUBE_DESCHEDULER,
} from '../../config/constants';
import { ExternalLink } from '../ui';
import {
  AUTHORINO_OPERATOR_LINK,
  CNV_LINK,
  getKmmDocsLink,
  getKubeDeschedulerLink,
  getLsoLink,
  getLvmsDocsLink,
  getMceDocsLink,
  getNmstateLink,
  getNodeFeatureDiscoveryLink,
  getNvidiaGpuLink,
  getServiceMeshLink,
  MTV_LINK,
  NODE_MAINTENANCE_LINK,
  ODF_LINK,
  ODF_REQUIREMENTS_LINK,
  OPENSHIFT_AI_LINK,
  OPENSHIFT_AI_REQUIREMENTS_LINK,
  OSC_LINK,
  OSC_REQUIREMENTS_LINK,
  PIPELINES_OPERATOR_LINK,
  SERVERLESS_OPERATOR_LINK,
} from '../../config';
import { getMajorMinorVersion } from '../../utils';
import { GetFeatureSupportLevel, useNewFeatureSupportLevel } from '../newFeatureSupportLevels';
import {
  DESCRIPTION_AMD_GPU,
  DESCRIPTION_AUTHORINO,
  DESCRIPTION_LSO,
  DESCRIPTION_MTV,
  DESCRIPTION_CNV,
  DESCRIPTION_KMM,
  DESCRIPTION_KUBE_DESCHEDULER,
  DESCRIPTION_MCE,
  DESCRIPTION_NMSTATE,
  DESCRIPTION_NODE_FEATURE_DISCOVERY,
  DESCRIPTION_NODE_MAINTENANCE,
  DESCRIPTION_NVIDIA_GPU,
  DESCRIPTION_ODF,
  DESCRIPTION_OPENSHIFT_AI,
  DESCRIPTION_OSC,
  DESCRIPTION_PIPELINES,
  DESCRIPTION_SERVERLESS,
  DESCRIPTION_SERVICEMESH,
  DESCRIPTION_LVM,
} from './operatorDescriptions';

// TODO check if it's unused and it can be deleted in favor of "isMajorMinorVersionEqualOrGreater"
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

export const highlightMatch = (text: string, searchTerm?: string): React.ReactNode => {
  if (!searchTerm) return text;
  const escapeSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapeSearchTerm})`, 'gi');

  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i}>{part}</mark> : part,
  );
};

export const HighlightedText = ({ text, searchTerm }: { text: string; searchTerm?: string }) => (
  <>{highlightMatch(text, searchTerm)}</>
);

export type OperatorSpec = {
  operatorKey: string;
  title: string;
  featureId: FeatureId;
  descriptionText?: string;
  Description?: React.ComponentType<{ openshiftVersion?: string; searchTerm?: string }>;
  notStandalone?: boolean;
  Requirements?: React.ComponentType<{ cluster: Cluster }>;
  category: string;
  supportLevel?: SupportLevel | undefined;
};

export const getOperatorSpecs = (
  getFeatureSupportLevel: GetFeatureSupportLevel,
  useLVMS?: boolean,
): { [category: string]: OperatorSpec[] } => {
  return {
    [categories[Category.STORAGE]]: [
      {
        operatorKey: OPERATOR_NAME_LSO,
        title: 'Local Storage Operator',
        featureId: 'LSO',
        descriptionText: DESCRIPTION_LSO,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_LSO} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getLsoLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.STORAGE],
        supportLevel: getFeatureSupportLevel('LSO'),
      },
      {
        operatorKey: OPERATOR_NAME_LVM,
        title: useLVMS ? 'Logical Volume Manager Storage' : 'Logical Volume Manager',
        featureId: 'LVM',
        descriptionText: DESCRIPTION_LVM,
        Description: ({ openshiftVersion, searchTerm }) =>
          useLVMS ? (
            <>
              <HighlightedText text={DESCRIPTION_LVM} searchTerm={searchTerm} />{' '}
              <ExternalLink href={getLvmsDocsLink(openshiftVersion)}>Learn more</ExternalLink>
            </>
          ) : (
            <>{DESCRIPTION_LVM}</>
          ),
        category: categories[Category.STORAGE],
        supportLevel: getFeatureSupportLevel('LVM'),
      },
      {
        operatorKey: OPERATOR_NAME_ODF,
        title: 'OpenShift Data Foundation',
        featureId: 'ODF',
        descriptionText: DESCRIPTION_ODF,
        Requirements: () => (
          <ExternalLink href={ODF_REQUIREMENTS_LINK}>
            Learn more about the requirements for OpenShift Data Foundation
          </ExternalLink>
        ),
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_ODF} searchTerm={searchTerm} />{' '}
            <ExternalLink href={ODF_LINK}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.STORAGE],
        supportLevel: getFeatureSupportLevel('ODF'),
      },
    ],
    [categories[Category.VIRT]]: [
      {
        operatorKey: OPERATOR_NAME_CNV,
        title: 'OpenShift Virtualization',
        featureId: 'CNV',
        descriptionText: DESCRIPTION_CNV,
        Requirements: () => (
          <>Enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all nodes</>
        ),
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_CNV} searchTerm={searchTerm} />{' '}
            <ExternalLink href={CNV_LINK}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.VIRT],
        supportLevel: getFeatureSupportLevel('CNV'),
      },
      {
        operatorKey: OPERATOR_NAME_MTV,
        title: 'Migration Toolkit for Virtualization',
        featureId: 'MTV',
        descriptionText: DESCRIPTION_MTV,
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_MTV} searchTerm={searchTerm} />{' '}
            <ExternalLink href={MTV_LINK}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.VIRT],
        supportLevel: getFeatureSupportLevel('MTV'),
      },
    ],
    [categories[Category.AI]]: [
      {
        operatorKey: OPERATOR_NAME_OPENSHIFT_AI,
        title: 'OpenShift AI',
        featureId: 'OPENSHIFT_AI',
        descriptionText: DESCRIPTION_OPENSHIFT_AI,
        Requirements: () => (
          <ExternalLink href={OPENSHIFT_AI_REQUIREMENTS_LINK}>Learn more</ExternalLink>
        ),
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_OPENSHIFT_AI} searchTerm={searchTerm} />{' '}
            <ExternalLink href={OPENSHIFT_AI_LINK}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.AI],
        supportLevel: getFeatureSupportLevel('OPENSHIFT_AI'),
      },
      {
        operatorKey: OPERATOR_NAME_AMD_GPU,
        title: 'AMD GPU',
        featureId: 'AMD_GPU',
        descriptionText: DESCRIPTION_AMD_GPU,
        Requirements: () => <>Requires at least one supported AMD GPU</>,
        Description: ({ searchTerm }) => (
          <>
            {' '}
            <HighlightedText text={DESCRIPTION_AMD_GPU} searchTerm={searchTerm} />{' '}
          </>
        ),
        category: categories[Category.AI],
        supportLevel: getFeatureSupportLevel('AMD_GPU'),
      },
      {
        operatorKey: OPERATOR_NAME_NVIDIA_GPU,
        title: 'NVIDIA GPU',
        featureId: 'NVIDIA_GPU',
        descriptionText: DESCRIPTION_NVIDIA_GPU,
        Requirements: () => <>Requires at least one supported NVIDIA GPU</>,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_NVIDIA_GPU} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getNvidiaGpuLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.AI],
        supportLevel: getFeatureSupportLevel('NVIDIA_GPU'),
      },
    ],
    [categories[Category.NETWORK]]: [
      {
        operatorKey: OPERATOR_NAME_NMSTATE,
        title: 'NMState',
        featureId: 'NMSTATE',
        descriptionText: DESCRIPTION_NMSTATE,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_NMSTATE} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getNmstateLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.NETWORK],
        supportLevel: getFeatureSupportLevel('NMSTATE'),
      },
      {
        operatorKey: OPERATOR_NAME_SERVICEMESH,
        title: 'Service Mesh',
        featureId: 'SERVICEMESH',
        descriptionText: DESCRIPTION_SERVICEMESH,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_SERVICEMESH} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getServiceMeshLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.NETWORK],
        supportLevel: getFeatureSupportLevel('SERVICEMESH'),
      },
    ],
    [categories[Category.OTHER]]: [
      {
        operatorKey: OPERATOR_NAME_AUTHORINO,
        title: 'Authorino',
        featureId: 'AUTHORINO',
        descriptionText: DESCRIPTION_AUTHORINO,
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_AUTHORINO} searchTerm={searchTerm} />{' '}
            <ExternalLink href={AUTHORINO_OPERATOR_LINK}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('AUTHORINO'),
      },
      {
        operatorKey: OPERATOR_NAME_NODE_FEATURE_DISCOVERY,
        title: 'Node Feature Discovery',
        featureId: 'NODE_FEATURE_DISCOVERY',
        descriptionText: DESCRIPTION_NODE_FEATURE_DISCOVERY,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_NODE_FEATURE_DISCOVERY} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getNodeFeatureDiscoveryLink(openshiftVersion)}>
              Learn more
            </ExternalLink>
          </>
        ),
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('NODE_FEATURE_DISCOVERY'),
      },
      {
        operatorKey: OPERATOR_NAME_PIPELINES,
        title: 'Pipelines',
        featureId: 'PIPELINES',
        descriptionText: DESCRIPTION_PIPELINES,
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_PIPELINES} searchTerm={searchTerm} />{' '}
            <ExternalLink href={PIPELINES_OPERATOR_LINK}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('PIPELINES'),
      },
      {
        operatorKey: OPERATOR_NAME_SERVERLESS,
        title: 'Serverless',
        featureId: 'SERVERLESS',
        descriptionText: DESCRIPTION_SERVERLESS,
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_SERVERLESS} searchTerm={searchTerm} />{' '}
            <ExternalLink href={SERVERLESS_OPERATOR_LINK}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('SERVERLESS'),
      },
      {
        operatorKey: OPERATOR_NAME_KMM,
        title: 'Kernel Module Management',
        featureId: 'KMM',
        descriptionText: DESCRIPTION_KMM,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_KMM} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getKmmDocsLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('KMM'),
      },
      {
        operatorKey: OPERATOR_NAME_MCE,
        title: 'Multicluster engine',
        featureId: 'MCE',
        descriptionText: DESCRIPTION_MCE,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_MCE} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getMceDocsLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('MCE'),
      },
      {
        operatorKey: OPERATOR_NAME_OSC,
        title: 'OpenShift sandboxed containers',
        featureId: 'OSC',
        descriptionText: DESCRIPTION_OSC,
        Requirements: () => (
          <ExternalLink href={OSC_REQUIREMENTS_LINK}>
            Learn more about the requirements for OpenShift sandboxed containers
          </ExternalLink>
        ),
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_OSC} searchTerm={searchTerm} />{' '}
            <ExternalLink href={OSC_LINK}>Learn more</ExternalLink>
          </>
        ),
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('OSC'),
      },
      {
        operatorKey: OPERATOR_NAME_KUBE_DESCHEDULER,
        title: 'Kube Descheduler',
        featureId: 'KUBE_DESCHEDULER',
        descriptionText: DESCRIPTION_KUBE_DESCHEDULER,
        Description: ({ openshiftVersion, searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_KUBE_DESCHEDULER} searchTerm={searchTerm} />{' '}
            <ExternalLink href={getKubeDeschedulerLink(openshiftVersion)}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('KUBE_DESCHEDULER'),
      },

      {
        operatorKey: OPERATOR_NAME_NODE_MAINTENANCE,
        title: 'Node Maintenance',
        featureId: 'NODE_MAINTENANCE',
        descriptionText: DESCRIPTION_NODE_MAINTENANCE,
        Description: ({ searchTerm }) => (
          <>
            <HighlightedText text={DESCRIPTION_NODE_MAINTENANCE} searchTerm={searchTerm} />{' '}
            <ExternalLink href={NODE_MAINTENANCE_LINK}>Learn more</ExternalLink>
          </>
        ),
        notStandalone: true,
        category: categories[Category.OTHER],
        supportLevel: getFeatureSupportLevel('NODE_MAINTENANCE'),
      },
    ],
  };
};

export const useOperatorSpecs = () => {
  const { getFeatureSupportLevel } = useNewFeatureSupportLevel();
  const useLVMS = getFeatureSupportLevel('LVM') === 'supported';

  // Grouped by category
  const byCategory = React.useMemo(
    () => getOperatorSpecs(getFeatureSupportLevel, useLVMS),
    [getFeatureSupportLevel, useLVMS],
  );

  // Flat map operatorKey -> spec
  const byKey: Record<string, OperatorSpec> = React.useMemo(() => {
    return Object.values(byCategory).reduce((acc, specs) => {
      specs.forEach((spec) => {
        acc[spec.operatorKey] = spec;
      });
      return acc;
    }, {} as Record<string, OperatorSpec>);
  }, [byCategory]);

  return { byCategory, byKey };
};

export const getOperatorTitleByFeatureId = (featureId: FeatureId): string | undefined => {
  const allSpecs = getOperatorSpecs(() => undefined);

  for (const categorySpecs of Object.values(allSpecs)) {
    const spec = categorySpecs.find((s) => s.featureId === featureId);
    if (spec) {
      return spec.title;
    }
  }

  return undefined;
};

enum Category {
  STORAGE,
  VIRT,
  AI,
  NETWORK,
  OTHER,
}

export const categories: { [key in Category]: string } = {
  [Category.STORAGE]: 'Storage',
  [Category.VIRT]: 'Virtualization',
  [Category.AI]: 'AI',
  [Category.NETWORK]: 'Network',
  [Category.OTHER]: 'Other',
};
