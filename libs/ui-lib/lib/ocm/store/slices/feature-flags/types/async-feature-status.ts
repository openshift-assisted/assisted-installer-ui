import { AssistedInstallerFeatureType } from '../../../../../common';

export interface AsyncFeatureStatus {
  name: AssistedInstallerFeatureType;
  isEnabled(): Promise<boolean>;
}
