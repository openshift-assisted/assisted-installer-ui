import { hostDiscover } from '../hosts/host-discover';
import { hostRename } from '../hosts/host-rename';

const oveBoundHosts = [0, 1, 2].map((index) => ({
  ...hostDiscover(index),
  bootstrap: index === 0,
}));

const oveUnboundHosts = oveBoundHosts.map((host) => ({ ...host, cluster_id: undefined }));

const oveRenamedHosts = oveBoundHosts.map((host, index) =>
  hostRename(host, `${Cypress.env('HOST_RENAME')}-${index + 1}`),
);

export { oveBoundHosts, oveUnboundHosts, oveRenamedHosts };
