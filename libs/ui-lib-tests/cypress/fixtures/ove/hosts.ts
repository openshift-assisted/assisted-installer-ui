import { hostDiscover } from '../hosts/host-discover';
import { hostRename } from '../hosts/host-rename';
import { hostReady } from '../hosts/host-ready';

const oveBoundHosts = [0, 1, 2].map((index) => ({
  ...hostDiscover(index),
  bootstrap: index === 0,
}));

const oveUnboundHosts = oveBoundHosts.map((host) => ({ ...host, cluster_id: undefined }));

const oveRenamedHosts = oveBoundHosts.map((host, index) =>
  hostRename(host, `${Cypress.env('HOST_RENAME')}-${index + 1}`),
);

const oveReadyHosts = oveRenamedHosts.map(hostReady);

export { oveBoundHosts, oveUnboundHosts, oveRenamedHosts, oveReadyHosts };
