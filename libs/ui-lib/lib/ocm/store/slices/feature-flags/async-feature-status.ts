import { AssistedInstallerFeatureType } from '../../../../common';

export interface AsyncFeatureStatus {
  name: AssistedInstallerFeatureType;
  isEnabled(): Promise<boolean>;
}

export function toAsyncFeatureStatus([name, isEnabled]: [string, boolean]): AsyncFeatureStatus {
  return {
    name: name as AssistedInstallerFeatureType,
    isEnabled(): Promise<boolean> {
      return Promise.resolve(isEnabled);
    },
  };
}
