import { hostDiscover } from '../hosts/host-discover';
import { hostRename } from '../hosts/host-rename';
import { hostReady } from '../hosts/host-ready';

// SNO host
const oveBoundSNOHost = [{ ...hostDiscover(0), bootstrap: true }];
const oveUnboundSNOHost = [{ ...oveBoundSNOHost[0], cluster_id: undefined }];
const oveRenamedSNOHost = [hostRename(oveBoundSNOHost[0], `${Cypress.expose('HOST_RENAME')}-1`)];
const oveReadySNOHost = [hostReady(oveRenamedSNOHost[0])];

// MNO hosts
const oveBoundHosts = [0, 1, 2].map((index) => ({
  ...hostDiscover(index),
  bootstrap: index === 0,
}));

const oveUnboundHosts = oveBoundHosts.map((host) => ({ ...host, cluster_id: undefined }));

const oveRenamedHosts = oveBoundHosts.map((host, index) =>
  hostRename(host, `${Cypress.expose('HOST_RENAME')}-${index + 1}`),
);

const oveReadyHosts = oveRenamedHosts.map(hostReady);

const ovePreparingHosts = oveReadyHosts.map((host) => ({
  ...host,
  status: 'preparing-for-installation',
  status_info: 'Host finished successfully to prepare for installation',
}));

const oveInstallingHosts = oveReadyHosts.map((host) => ({
  ...host,
  status: 'installing',
  status_info: 'Installation is in progress',
}));

export {
  // mno
  oveBoundHosts,
  oveUnboundHosts,
  oveRenamedHosts,
  oveReadyHosts,
  ovePreparingHosts,
  oveInstallingHosts,
  // sno
  oveBoundSNOHost,
  oveUnboundSNOHost,
  oveRenamedSNOHost,
  oveReadySNOHost,
};
