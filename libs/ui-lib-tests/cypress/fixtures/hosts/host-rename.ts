/* eslint-disable @typescript-eslint/naming-convention */

import { getHostInventory } from '../cluster/host-inventory';
import { hostValidationsInfo } from '../cluster/validation-info-host-renamed';

const hostRename = (originalHost, newName) => ({
  ...originalHost,
  requested_hostname: newName,
  domain_name_resolutions:
    '{"resolutions":[{"domain_name":"api.single-stack-mc.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"api-int.single-stack-mc.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"console-openshift-console.apps.single-stack-mc.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.single-stack-mc.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]}]}',
  ntp_sources:
    '[{"source_name":"ny-time.gofile.xyz","source_state":"unreachable"},{"source_name":"ntp32.kashra-server.com","source_state":"unreachable"},{"source_name":"t1.time.bf1.yahoo.com","source_state":"unreachable"},{"source_name":"time-ewr.0xt.ca","source_state":"unreachable"},{"source_name":"ntp3-1.mattnordhoff.net","source_state":"unreachable"},{"source_name":"2604:a880:800:a1::ec9:5001","source_state":"unreachable"},{"source_name":"2600:3c01::f03c:91ff:febc:67d4","source_state":"unreachable"},{"source_name":"t2.time.bf1.yahoo.com","source_state":"unreachable"}]',
  progress_stages: [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Rebooting',
    'Configuring',
    'Joined',
    'Done',
  ],
  status: 'known',
  status_info: 'Host is ready to be installed',
  inventory: JSON.stringify(getHostInventory(newName)),
  validations_info: JSON.stringify(hostValidationsInfo(newName)),
});

export { hostRename };
