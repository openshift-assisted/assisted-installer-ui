import {
  ClusterFeatureUsage,
  FeatureId,
  FeatureSupportLevels,
  SupportLevel,
  SupportLevelMap,
} from '../../common';
import FeatureSupportLevelDataInterface from '../../common/contexts/FeatureSupportLevelDataInterface';

class FeatureSupportLevelData implements FeatureSupportLevelDataInterface {
  private clusterSupportLevels: SupportLevelMap = {};
  private versionSupportLevels: SupportLevelMap = {};
  private clusterFeatureIds: FeatureId[] = [];
  private _isFullySupported: boolean | undefined;
  constructor(
    private globalFeatureSupportLevels: FeatureSupportLevels,
    private _openshiftVersion?: string,
    clusterFeatureUsage?: string,
  ) {
    if (clusterFeatureUsage) {
      this.initClusterFeatureIds(JSON.parse(clusterFeatureUsage) as ClusterFeatureUsage);
    }
    this.update();
  }

  public set openshiftVersion(openshiftVersion: string | undefined) {
    if (openshiftVersion !== this._openshiftVersion) {
      this._openshiftVersion = openshiftVersion;
      this.update();
    }
  }

  public get openshiftVersion(): string | undefined {
    return this._openshiftVersion;
  }

  public get isFullySupported() {
    return this._isFullySupported;
  }

  public get clusterSupportLevelMap(): SupportLevelMap {
    return this.clusterSupportLevels;
  }

  getVersionSupportLevel(featureId: FeatureId): SupportLevel | undefined {
    return this.versionSupportLevels[featureId];
  }

  getClusterSupportLevel(featureId: FeatureId): SupportLevel | undefined {
    return this.clusterSupportLevels[featureId];
  }

  private initClusterFeatureIds(clusterFeatureUsage: ClusterFeatureUsage): void {
    this.clusterFeatureIds = Object.values(clusterFeatureUsage).map((item) => item.id);
  }

  private update(): void {
    this.updateVersionSupportLevels();
    this.updateClusterSupportLevels();
  }

  private updateVersionSupportLevels(): void {
    const versionSupportLevels = this.globalFeatureSupportLevels.find((item) => {
      if (!item.openshiftVersion) {
        return false;
      }
      return this._openshiftVersion?.startsWith(item.openshiftVersion);
    })?.features;
    if (!versionSupportLevels) {
      return;
    }
    for (const featureSupportLevel of versionSupportLevels) {
      if (!featureSupportLevel.featureId) {
        return;
      }
      this.versionSupportLevels[featureSupportLevel.featureId] = featureSupportLevel.supportLevel;
    }
  }

  private updateClusterSupportLevels(): void {
    for (const featureId of this.clusterFeatureIds) {
      if (featureId in this.versionSupportLevels) {
        this.clusterSupportLevels[featureId] = this.versionSupportLevels[featureId];
      }
    }
    this._isFullySupported = Object.keys(this.clusterSupportLevels).length === 0;
  }
}

export default FeatureSupportLevelData;
