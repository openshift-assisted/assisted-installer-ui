/* eslint-disable @typescript-eslint/naming-convention */

const defaultConfig = {
    cluster_network_cidr: '10.128.0.0/14',
    cluster_network_host_prefix: 23,
    inactive_deletion_hours: 480,
    ntp_source: '',
    service_network_cidr: '172.30.0.0/16',
    cluster_networks_dualstack: [
        { cidr: '10.128.0.0/14', host_prefix: 23 },
        {
            cidr: 'fd01::/48',
            host_prefix: 64,
        },
    ],
    cluster_networks_ipv4: [{ cidr: '10.128.0.0/14', host_prefix: 23 }],
    forbidden_hostnames: [
        'localhost',
        'localhost.localdomain',
        'localhost4',
        'localhost4.localdomain4',
        'localhost6',
        'localhost6.localdomain6',
    ],
    service_networks_dualstack: [{ cidr: '172.30.0.0/16' }, { cidr: 'fd02::/112' }],
    service_networks_ipv4: [{ cidr: '172.30.0.0/16' }],
};

export default defaultConfig;
