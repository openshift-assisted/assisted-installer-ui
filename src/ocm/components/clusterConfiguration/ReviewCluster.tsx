import React from 'react';
import { Table, TableBody, TableVariant } from '@patternfly/react-table';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import {
  Cluster,
  Host,
  Inventory,
  stringToJSON,
  fileSize,
  getEnabledHosts,
  DetailList,
  DetailItem,
} from '../../../common';
import { RenderIf } from '../../../common/components/ui/';
import { getSimpleHardwareInfo } from '../../../common/components/hosts/hardwareInfo';
import { ClusterValidations, HostsValidations } from './ReviewValidations';
import { VSPHERE_CONFIG_LINK } from '../../../common';
import { selectClusterNetworkCIDR } from '../../selectors/clusterSelectors';
import { FeatureSupportLevelContext } from '../../../common/components/featureSupportLevels';
import {
  ReviewClusterFeatureSupportLevels,
  getClusterUsedFeaturesSupportLevels,
  isFullySupported,
} from '../featureSupportLevels';
import './ReviewCluster.css';

const ReviewHostsInventory: React.FC<{ hosts?: Host[] }> = ({ hosts = [] }) => {
  const rows = React.useMemo(() => {
    const summary = getEnabledHosts(hosts).reduce(
      (summary, host) => {
        summary.count++;
        const inventory = stringToJSON<Inventory>(host.inventory);
        if (inventory) {
          const hwInfo = getSimpleHardwareInfo(inventory);
          summary.cores += hwInfo.cores;
          summary.memory += hwInfo.memory;
          summary.fs += hwInfo.disks;
        }
        return summary;
      },
      {
        count: 0,
        cores: 0,
        memory: 0,
        fs: 0,
      },
    );

    return [
      {
        cells: ['Hosts', summary.count],
      },
      {
        cells: ['Cores', summary.cores],
      },
      {
        cells: ['Memory', fileSize(summary.memory, 2, 'iec')],
      },
      {
        cells: ['Storage', fileSize(summary.fs, 2, 'si')],
      },
    ];
  }, [hosts]);

  return (
    <Table
      rows={rows}
      cells={['', '']}
      variant={TableVariant.compact}
      borders={false}
      aria-label="Cluster summary table"
      className="review-hosts-table"
    >
      <TableBody />
    </Table>
  );
};

const PlatformIntegrationNote: React.FC<{}> = () => {
  return (
    <p>
      <ExclamationTriangleIcon color={warningColor.value} size="sm" /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
      <a href={VSPHERE_CONFIG_LINK} target="_blank" rel="noopener noreferrer">
        Learn more <i className="fas fa-external-link-alt" />
      </a>
    </p>
  );
};
const getFeatureSupportLevelTitle = (fullySupported: boolean): string => {
  const supportLevel: string = fullySupported ? 'Full' : 'Limited';
  return `Cluster support level: ${supportLevel}`;
};

const ReviewCluster: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const featureSupportLevelData = React.useContext(FeatureSupportLevelContext);

  const clusterFeatureSupportLevels = React.useMemo(() => {
    return getClusterUsedFeaturesSupportLevels(cluster, featureSupportLevelData);
  }, [cluster, featureSupportLevelData]);

  const fullySupported: boolean = React.useMemo<boolean>(() => {
    if (!clusterFeatureSupportLevels) {
      return false;
    }
    return isFullySupported(clusterFeatureSupportLevels);
  }, [clusterFeatureSupportLevels]);
  return (
    <DetailList>
      <DetailItem title="Cluster address" value={`${cluster.name}.${cluster.baseDnsDomain}`} />
      <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
      <DetailItem title="Management network CIDR" value={selectClusterNetworkCIDR(cluster)} />
      <DetailItem title="Cluster summary" value={<ReviewHostsInventory hosts={cluster.hosts} />} />
      <DetailItem
        title="Cluster validations"
        value={<ClusterValidations validationsInfo={cluster.validationsInfo} />}
      />
      <DetailItem title="Host validations" value={<HostsValidations hosts={cluster.hosts} />} />
      <RenderIf condition={cluster.platform?.type !== 'baremetal'}>
        <DetailItem title="Platform integration" value={<PlatformIntegrationNote />} />
      </RenderIf>
      <RenderIf condition={!!clusterFeatureSupportLevels}>
        <DetailItem
          title={getFeatureSupportLevelTitle(fullySupported)}
          value={
            <ReviewClusterFeatureSupportLevels
              clusterFeatureSupportLevels={clusterFeatureSupportLevels}
            />
          }
        />
      </RenderIf>
    </DetailList>
  );
};

export default ReviewCluster;
