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
import {
  OPERATOR_NAME_AUTHORINO,
  OPERATOR_NAME_CNV,
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

interface OperatorProps {
  clusterId: string;
  openshiftVersion?: string;
  isVersionEqualsOrMajorThan4_15: boolean;
  isSNO: boolean;
  disabledReason?: string;
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
  mce: (props) => (
    <MceCheckbox
      clusterId={props.clusterId}
      isVersionEqualsOrMajorThan4_15={props.isVersionEqualsOrMajorThan4_15}
      openshiftVersion={props.openshiftVersion}
    />
  ),
  lvm: (props) => <LvmCheckbox {...props} />,
  odf: (props) => <OdfCheckbox {...props} />,
  'openshift-ai': (props) => <OpenShiftAICheckbox {...props} />,
  osc: () => <OscCheckbox />,
  lso: () => <LsoCheckbox />,
  'node-feature-discovery': () => <NodeFeatureDiscoveryCheckbox />,
  nmstate: (props) => <NmstateCheckbox {...props} />,
  serverless: (props) => <ServerlessCheckbox {...props} />,
  authorino: (props) => <AuthorinoCheckbox {...props} />,
  pipelines: (props) => <PipelinesCheckbox {...props} />,
  servicemesh: (props) => <ServiceMeshCheckbox {...props} />,
  'nvidia-gpu': (props) => <NvidiaGpuCheckbox {...props} />,
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
};
