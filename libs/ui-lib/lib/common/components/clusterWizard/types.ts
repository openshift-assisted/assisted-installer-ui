import type {
  DiskEncryption,
  Host,
  Cluster,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';

import {
  ValidationGroup as ClusterValidationGroup,
  Validation as ClusterValidation,
} from '../../types/clusters';
import {
  ValidationGroup as HostValidationGroup,
  Validation as HostValidation,
} from '../../types/hosts';
import { TangServer } from '../clusterConfiguration/DiskEncryptionFields/DiskEncryptionValues';
import { WizardStepsValidationMap } from './validationsInfoUtils';

export type ClusterDetailsValues = {
  name: string;
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
  useRedHatDnsService: boolean;
  enableDiskEncryptionOnMasters: boolean;
  enableDiskEncryptionOnWorkers: boolean;
  enableDiskEncryptionOnArbiters: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  diskEncryptionTangServers: TangServer[];
  diskEncryption: DiskEncryption;
  cpuArchitecture: string;
  platform: PlatformType;
  customOpenshiftSelect: string | null;
  userManagedNetworking: boolean;
  controlPlaneCount: number;
};

export type HostsValidationsProps<S extends string, V extends string[]> = {
  hosts?: Host[];
  setCurrentStepId: (stepId: S) => void;
  wizardStepNames: { [key in S]: string };
  allClusterWizardSoftValidationIds: V;
  wizardStepsValidationsMap: WizardStepsValidationMap<S>;
};

export type ClusterValidationsProps<S extends string> = {
  validationsInfo?: Cluster['validationsInfo'];
  setCurrentStepId: (stepId: S) => void;
  wizardStepNames: { [key in S]: string };
  wizardStepsValidationsMap: WizardStepsValidationMap<S>;
};

export type FailingValidationsProps<S extends string> = {
  validation: HostValidation | ClusterValidation;
  setCurrentStepId: (stepId: S) => void;
  clusterGroup?: ClusterValidationGroup;
  hostGroup?: HostValidationGroup;
  severity?: 'danger' | 'warning';
  wizardStepNames: { [key in S]: string };
  wizardStepsValidationsMap: WizardStepsValidationMap<S>;
  host?: Host;
};

export type ValidationActionLinkProps<S extends string> = {
  step: S;
  setCurrentStepId: (stepId: S) => void;
  wizardStepNames: { [key in S]: string };
};

export type ClusterOperatorProps = {
  cluster: Cluster;
};

export type ItemDropdown = {
  label: string;
  value: string;
}[];
