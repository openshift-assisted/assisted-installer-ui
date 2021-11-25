import {
  ClusterFeatureUsage,
  FeatureId,
  FeatureSupportLevels,
  SupportLevel,
  SupportLevelMap,
} from '../../common';
import FeatureSupportLevelDataInterface from '../../common/contexts/FeatureSupportLevelDataInterface';

class FeatureSupportLevelData implements FeatureSupportLevelDataInterface {
  private _clusterUsedFeatureSupportLevels: SupportLevelMap = {};
  private _isClusterFullySupported: boolean | undefined;
  private normalizedVersion: string | undefined;
  private featureSupportLevels: {
    version?: SupportLevelMap;
  } = {};

  constructor(
    featureSupportLevels?: FeatureSupportLevels,
    private openshiftVersion?: string,
    clusterFeatureUsage?: string,
  ) {
    if (featureSupportLevels) {
      this.deserialize(featureSupportLevels, clusterFeatureUsage);
    }
  }

  public get isFullySupported() {
    return this._isClusterFullySupported;
  }

  public get clusterUsedFeatureSupportLevels() {
    return this._clusterUsedFeatureSupportLevels;
  }

  getFeatureSupportLevel(
    featureId: FeatureId,
    openshiftVersion?: string,
  ): SupportLevel | undefined {
    if (openshiftVersion) {
      const normalizedVersion = this.getNormalizedVersion(openshiftVersion);
      if (!normalizedVersion) {
        console.warn(`No feature support level information on version ${openshiftVersion}`);
        return undefined;
      }
      return this.featureSupportLevels[normalizedVersion][featureId];
    }
    if (!this.normalizedVersion) {
      return undefined;
    }
    return this.featureSupportLevels[this.normalizedVersion][featureId];
  }

  private getNormalizedVersion(version: string) {
    return Object.keys(this.featureSupportLevels).find((normalizedVersion) =>
      version.startsWith(normalizedVersion),
    );
  }

  private deserialize(
    featureSupportLevels: FeatureSupportLevels,
    clusterFeatureUsage?: string,
  ): void {
    this.initFeatureSupportLevels(featureSupportLevels);
    this.initClusterUsedFeatureSupplortLevels(clusterFeatureUsage);
  }

  private initFeatureSupportLevels(featureSupportLevels: FeatureSupportLevels) {
    for (const { openshiftVersion, features } of featureSupportLevels) {
      if (!openshiftVersion || !features) {
        continue;
      }
      this.featureSupportLevels[openshiftVersion] = {};
      for (const { featureId, supportLevel } of features) {
        if (!featureId || !supportLevel) {
          return;
        }
        this.featureSupportLevels[openshiftVersion][featureId] = supportLevel;
      }
    }
  }

  private initClusterUsedFeatureSupplortLevels(featureUsage: string | undefined) {
    if (!this.openshiftVersion || !featureUsage) {
      return;
    }
    this.normalizedVersion = this.getNormalizedVersion(this.openshiftVersion);
    if (!this.normalizedVersion) {
      console.warn(`No feature support level information on version ${this.normalizedVersion}`);
      return;
    }
    const clusterFeatureUsageObj: ClusterFeatureUsage = JSON.parse(featureUsage);
    const usedFeatureIds: string[] = Object.values(clusterFeatureUsageObj).map((item) => item.id);
    for (const featureId of usedFeatureIds) {
      this._clusterUsedFeatureSupportLevels[featureId] = this.featureSupportLevels[
        this.normalizedVersion
      ][featureId];
    }
    this._isClusterFullySupported = Object.keys(this._clusterUsedFeatureSupportLevels).length === 0;
  }
}

export default FeatureSupportLevelData;
