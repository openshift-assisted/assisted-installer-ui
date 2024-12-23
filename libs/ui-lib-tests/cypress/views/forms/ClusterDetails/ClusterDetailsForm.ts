import { BaseDomainField } from './Fields/BaseDomainField';
import { ClusterNameField } from './Fields/ClusterNameField';
import { CustomManifestsField } from './Fields/CustomManifestsField';
import { ExternalPartnerIntegrationsField } from './Fields/ExternalPartnerIntegrationsField';
import { HostsNetworkConfigurationField } from './Fields/HostsNetworkConfigurationField';
import { OpenShiftVersionField } from './Fields/OpenShiftVersionField';
import { PullSecretField } from './Fields/PullSecretField';
import { CpuArchitectureField } from './Fields/CpuArchitectureField';
import { SnoField } from './Fields/SnoField';
import { ControlPlaneNodesField } from './Fields/ControlPlaneNodesField';

export class ClusterDetailsForm {
  static readonly alias = `@${ClusterDetailsForm.name}`;
  static readonly selector = '#wizard-cluster-details__form';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ClusterDetailsForm.selector, ancestorAlias).as(ClusterDetailsForm.name);
    return ClusterDetailsForm;
  }

  static get externalPartnerIntegrationsField() {
    return ExternalPartnerIntegrationsField.init(ClusterDetailsForm.alias);
  }

  static get customManifestsField() {
    return CustomManifestsField.init(ClusterDetailsForm.alias);
  }

  static get clusterNameField() {
    return ClusterNameField.init(ClusterDetailsForm.alias);
  }

  static get baseDomainField() {
    return BaseDomainField.init(ClusterDetailsForm.alias);
  }

  static get openshiftVersionField() {
    return OpenShiftVersionField.init(ClusterDetailsForm.alias);
  }

  static get hostsNetworkConfigurationField() {
    return HostsNetworkConfigurationField.init(ClusterDetailsForm.alias);
  }

  static get pullSecretField() {
    return PullSecretField.init(ClusterDetailsForm.alias);
  }

  static get cpuArchitectureField() {
    return CpuArchitectureField.init(ClusterDetailsForm.alias);
  }

  static get snoField() {
    return SnoField.init(ClusterDetailsForm.alias);
  }

  static get controlPlaneNodesField() {
    return ControlPlaneNodesField.init(ClusterDetailsForm.alias);
  }
}
