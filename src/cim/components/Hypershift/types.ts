import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { StatusCondition } from '../../types/k8s/shared';

export type NodePoolK8sResource = K8sResourceCommon & {
  spec: {
    clusterName: string;
    replicas: number;
    management: {
      autoRepair?: boolean;
      replace?: {
        rollingUpdate: {
          maxSurge: number;
          maxUnavailable: number;
        };
        strategy: 'RollingUpdate' | 'OnDelete';
      };
      upgradeType: 'Replace' | 'InPlace';
    };
    autoScaling?: {
      min: number;
      max: number;
    };
    platform: {
      type: string;
      agent?: {
        agentLabelSelector?: {
          matchLabels?: {
            [key: string]: string;
          };
        };
      };
      aws?: {
        instanceProfile: string;
        instanceType: string;
        rootVolume: {
          size: number;
          type: string;
        };
        securityGroups: { id: string }[];
        subnet: { id: string };
      };
    };
    release: {
      image: string;
    };
  };
  status?: {
    conditions?: StatusCondition<string>[];
    replicas?: number;
    version?: string;
  };
};

export type HostedClusterK8sResource = K8sResourceCommon & {
  spec: {
    autoscaling?: {
      maxNodeProvisionTime?: string;
      maxNodesTotal?: number;
      maxPodGracePeriod?: number;
      podPriorityThreshold?: number;
    };
    clusterID?: string;
    controllerAvailabilityPolicy?: string;
    dns: {
      baseDomain: string;
      privateZoneID?: string;
      publicZoneID?: string;
    };
    etcd?: {
      managementType: 'Managed' | 'Unmanaged';
      managed?: Record<string, unknown>;
      unmanaged?: Record<string, unknown>;
    };
    networking?: {
      apiServer?: {
        advertiseAddress?: string;
        allowedCIDRBlocks?: string;
        port?: number;
      };
      clusterNetwork?: {
        cidr: string;
        hostPrefix?: number;
      }[];
      machineCIDR?: string;
      machineNetwork?: {
        cidr: string;
      }[];
      networkType: 'OpenShiftSDN' | 'Calico' | 'OVNKubernetes' | 'Other';
      podCIDR?: string;
      serviceCIDR?: string;
      serviceNetwork?: {
        cidr: string;
      }[];
    };
    fips?: boolean;
    infraID?: string;
    infrastructureAvailabilityPolicy?: string;
    issuerURL?: string;
    olmCatalogPlacement?: 'management' | 'guest';
    release: {
      image: string;
    };
    secretEncryption?: Record<string, unknown>;
    services: {
      service: 'APIServer' | 'OAuthServer' | 'OIDC' | 'Konnectivity' | 'Ignition' | 'OVNSbDb';
      servicePublishingStrategy: {
        loadBalancer?: {
          hostname?: string;
        };
        nodePort?: {
          address: string;
          port?: number;
        };
        route?: {
          hostname?: string;
        };
        type: 'LoadBalancer' | 'NodePort' | 'Route' | 'None' | 'S3';
      };
    }[];
    platform: {
      agent?: {
        agentNamespace: string;
      };
      aws?: {
        cloudProviderConfig: {
          subnet: {
            id: string;
          };
          vpc: string;
          zone: string;
        };
        controlPlaneOperatorCreds: { name?: string };
        endpointAccess: 'Public';
        kubeCloudControllerCreds: { name?: string };
        nodePoolManagementCreds: { name?: string };
        region: 'us-west-2';
        resourceTags: [
          {
            key: 'kubernetes.io/cluster/feng-hs-scale-74zxh';
            value: 'owned';
          },
        ];
      };
      powervs?: Record<string, unknown>;
      azure?: Record<string, unknown>;
      type?: 'AWS' | 'None' | 'IBMCloud' | 'Agent' | 'KubeVirt' | 'Azure' | 'PowerVS';
    };
    sshKey: {
      name: string;
    };
    pullSecret: {
      name: string;
    };
  };
  status?: {
    conditions?: StatusCondition<string>[];
    kubeconfig?: {
      name: string;
    };
    kubeadminPassword?: {
      name: string;
    };
    ignitionEndpoint?: string;
    oauthCallbackURLTemplate?: string;
    version?: {
      desired: {
        image: string;
      };
      history: {
        acceptedRisks?: string;
        completionTime: string;
        image: string;
        startedTime: string;
        state: string;
        verified: boolean;
        version?: string;
      }[];
      observedGeneration: number;
    };
  };
};

export type AgentMachineK8sResource = K8sResourceCommon & {
  status?: {
    agentRef?: {
      name: string;
      namespace: string;
    };
  };
};
