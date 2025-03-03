import React from 'react';
import CnvCheckbox from './CnvCheckbox';
import MtvOperatorCheckbox from './MtvOperatorCheckbox';
import MceCheckbox from './MceCheckbox';
import LvmCheckbox from './LvmCheckbox';
import OdfCheckbox from './OdfCheckbox';
import OpenShiftAICheckbox from './OpenShiftAICheckbox';
import OscCheckbox from './OscCheckbox';
import LsoCheckbox from './LsoCheckbox';
import NodeFeatureDiscoveryCheckbox from './NodeFeatureDiscoveryCheckbox';
import NmstateCheckbox from './NmstateCheckbox';
import ServerlessCheckbox from './ServerlessCheckbox';
import AuthorinoCheckbox from './AuthorinoCheckbox';
import PipelinesCheckbox from './PipelinesChekbox';
import ServiceMeshCheckbox from './ServicemeshCheckbox';
import NvidiaGpuCheckbox from './NvidiaGpuCheckbox';
import AmdGpuCheckbox from './AmdGpuCheckbox';
import KmmCheckbox from './KmmCheckbox';
import {
  FeatureId,
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
} from '../../../../common';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

interface OperatorProps {
  clusterId: string;
  openshiftVersion?: string;
  isVersionEqualsOrMajorThan4_15: boolean;
  isSNO: boolean;
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}

export interface ComponentItem {
  component: JSX.Element;
  label: string;
}

export const operatorComponentMap: Record<string, (props: OperatorProps) => JSX.Element> = {
  cnv: (props) => (
    <CnvCheckbox {...props} isVersionEqualsOrMajorThan4_15={props.isVersionEqualsOrMajorThan4_15} />
  ),
  mtv: (props) => <MtvOperatorCheckbox {...props} />,
  mce: (props) => <MceCheckbox {...props} />,
  lvm: (props) => <LvmCheckbox {...props} />,
  odf: (props) => <OdfCheckbox {...props} />,
  'openshift-ai': (props) => <OpenShiftAICheckbox {...props} />,
  osc: (props) => <OscCheckbox {...props} />,
  lso: (props) => <LsoCheckbox {...props} />,
  'node-feature-discovery': (props) => <NodeFeatureDiscoveryCheckbox {...props} />,
  nmstate: (props) => <NmstateCheckbox {...props} />,
  serverless: (props) => <ServerlessCheckbox {...props} />,
  authorino: (props) => <AuthorinoCheckbox {...props} />,
  pipelines: (props) => <PipelinesCheckbox {...props} />,
  servicemesh: (props) => <ServiceMeshCheckbox {...props} />,
  'nvidia-gpu': (props) => <NvidiaGpuCheckbox {...props} />,
  'amd-gpu': (props) => <AmdGpuCheckbox {...props} />,
  kmm: (props) => <KmmCheckbox {...props} />,
};

export const mapOperatorsToFieldIds: { [key: string]: string } = {
  [OPERATOR_NAME_ODF]: 'useOpenShiftDataFoundation',
  [OPERATOR_NAME_LVM]: 'useOdfLogicalVolumeManager',
  [OPERATOR_NAME_CNV]: 'useContainerNativeVirtualization',
  [OPERATOR_NAME_MCE]: 'useMultiClusterEngine',
  [OPERATOR_NAME_MTV]: 'useMigrationToolkitforVirtualization',
  [OPERATOR_NAME_OPENSHIFT_AI]: 'useOpenShiftAI',
  [OPERATOR_NAME_OSC]: 'useOsc',
  [OPERATOR_NAME_NODE_FEATURE_DISCOVERY]: 'useNodeFeatureDiscovery',
  [OPERATOR_NAME_NMSTATE]: 'useNmstate',
  [OPERATOR_NAME_LSO]: 'useLso',
  [OPERATOR_NAME_SERVERLESS]: 'useServerless',
  [OPERATOR_NAME_AUTHORINO]: 'useAuthorino',
  [OPERATOR_NAME_PIPELINES]: 'usePipelines',
  [OPERATOR_NAME_SERVICEMESH]: 'useServicemesh',
  [OPERATOR_NAME_NVIDIA_GPU]: 'useNvidiaGpu',
  [OPERATOR_NAME_AMD_GPU]: 'useAmdGpu',
  [OPERATOR_NAME_KMM]: 'useKmm',
};

export const mapOperatorIdToFeatureId: { [key: string]: FeatureId } = {
  [OPERATOR_NAME_ODF]: 'ODF',
  [OPERATOR_NAME_LVM]: 'LVM',
  [OPERATOR_NAME_CNV]: 'CNV',
  [OPERATOR_NAME_MCE]: 'MCE',
  [OPERATOR_NAME_MTV]: 'MTV',
  [OPERATOR_NAME_OPENSHIFT_AI]: 'OPENSHIFT_AI',
  [OPERATOR_NAME_OSC]: 'OSC',
  [OPERATOR_NAME_NODE_FEATURE_DISCOVERY]: 'NODE_FEATURE_DISCOVERY',
  [OPERATOR_NAME_NMSTATE]: 'NMSTATE',
  [OPERATOR_NAME_LSO]: 'LSO',
  [OPERATOR_NAME_SERVERLESS]: 'SERVERLESS',
  [OPERATOR_NAME_AUTHORINO]: 'AUTHORINO',
  [OPERATOR_NAME_PIPELINES]: 'PIPELINES',
  [OPERATOR_NAME_SERVICEMESH]: 'SERVICEMESH',
  [OPERATOR_NAME_NVIDIA_GPU]: 'NVIDIA_GPU',
};
