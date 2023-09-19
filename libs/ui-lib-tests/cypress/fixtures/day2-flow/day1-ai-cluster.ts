import { day2FlowIds } from '../constants';

const { aiClusterId } = day2FlowIds.day1;

const aiCluster = {
  id: day2FlowIds.day1.aiClusterId,
  openshift_cluster_id: aiClusterId,
  additional_ntp_source: 'clock.redhat.com',
  ams_subscription_id: day2FlowIds.day1.ocmSubscriptionId,
  api_vip: '192.168.127.100',
  api_vips: [
    {
      cluster_id: aiClusterId,
      ip: '192.168.127.100',
      verification: 'succeeded',
    },
  ],
  base_dns_domain: 'redhat.com',
  cluster_networks: [
    {
      cidr: '172.30.0.0/16',
      cluster_id: aiClusterId,
      host_prefix: 23,
    },
  ],
  connectivity_majority_groups:
    '{"192.168.127.0/24":["68c3e3ac-3d88-47e8-81de-1d047b8f79fc","a8e1a572-2136-4ea9-9327-a2f3ed0bc862","bda910cc-324e-4396-8c4d-59d972859d01"],"192.168.145.0/24":["68c3e3ac-3d88-47e8-81de-1d047b8f79fc","a8e1a572-2136-4ea9-9327-a2f3ed0bc862","bda910cc-324e-4396-8c4d-59d972859d01"],"IPv4":["68c3e3ac-3d88-47e8-81de-1d047b8f79fc","a8e1a572-2136-4ea9-9327-a2f3ed0bc862","bda910cc-324e-4396-8c4d-59d972859d01"],"IPv6":["68c3e3ac-3d88-47e8-81de-1d047b8f79fc","a8e1a572-2136-4ea9-9327-a2f3ed0bc862","bda910cc-324e-4396-8c4d-59d972859d01"]}',
  controller_logs_collected_at: '2023-06-22T15:05:16.331Z',
  controller_logs_started_at: '2023-06-22T14:48:12.827Z',
  cpu_architecture: 'x86_64',
  created_at: '2023-06-22T14:16:30.309623Z',
  deleted_at: null,
  disk_encryption: { enable_on: 'none', mode: 'tpmv2' },
  email_domain: 'redhat.com',
  enabled_host_count: 3,
  feature_usage:
    '{"Additional NTP Source":{"data":{"source_count":1},"id":"ADDITIONAL_NTP_SOURCE","name":"Additional NTP Source"},"Hyperthreading":{"data":{"hyperthreading_enabled":"all"},"id":"HYPERTHREADING","name":"Hyperthreading"},"OVN network type":{"id":"OVN_NETWORK_TYPE","name":"OVN network type"},"Requested hostname":{"data":{"host_count":1},"id":"REQUESTED_HOSTNAME","name":"Requested hostname"}}',
  high_availability_mode: 'Full',
  host_networks: [
    {
      cidr: '192.168.127.0/24',
      host_ids: [
        '68c3e3ac-3d88-47e8-81de-1d047b8f79fc',
        'a8e1a572-2136-4ea9-9327-a2f3ed0bc862',
        'bda910cc-324e-4396-8c4d-59d972859d01',
      ],
    },
    {
      cidr: '192.168.145.0/24',
      host_ids: [
        '68c3e3ac-3d88-47e8-81de-1d047b8f79fc',
        'a8e1a572-2136-4ea9-9327-a2f3ed0bc862',
        'bda910cc-324e-4396-8c4d-59d972859d01',
      ],
    },
  ],
  hosts: [
    {
      checked_in_at: '2023-06-22T14:22:37.303Z',
      cluster_id: aiClusterId,
      connectivity:
        '{"remote_hosts":[{"host_id":"a8e1a572-2136-4ea9-9327-a2f3ed0bc862","l2_connectivity":[{"outgoing_ip_address":"192.168.127.11","outgoing_nic":"ens3","remote_ip_address":"192.168.127.10","remote_mac":"02:00:00:20:77:4e","successful":true},{"outgoing_ip_address":"192.168.145.11","outgoing_nic":"ens4","remote_ip_address":"192.168.127.10","remote_mac":"02:00:00:eb:1a:80","successful":true},{"outgoing_ip_address":"192.168.127.11","outgoing_nic":"ens3","remote_ip_address":"192.168.145.10","remote_mac":"02:00:00:20:77:4e","successful":true},{"outgoing_ip_address":"192.168.145.11","outgoing_nic":"ens4","remote_ip_address":"192.168.145.10","remote_mac":"02:00:00:eb:1a:80","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.485,"remote_ip_address":"192.168.127.10","successful":true},{"average_rtt_ms":0.394,"remote_ip_address":"192.168.145.10","successful":true}]},{"host_id":"bda910cc-324e-4396-8c4d-59d972859d01","l2_connectivity":[{"outgoing_ip_address":"192.168.145.11","outgoing_nic":"ens4","remote_ip_address":"192.168.127.12","remote_mac":"02:00:00:28:54:24","successful":true},{"outgoing_ip_address":"192.168.127.11","outgoing_nic":"ens3","remote_ip_address":"192.168.127.12","remote_mac":"02:00:00:76:01:20","successful":true},{"outgoing_ip_address":"192.168.145.11","outgoing_nic":"ens4","remote_ip_address":"192.168.145.12","remote_mac":"02:00:00:28:54:24","successful":true},{"outgoing_ip_address":"192.168.127.11","outgoing_nic":"ens3","remote_ip_address":"192.168.145.12","remote_mac":"02:00:00:76:01:20","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.283,"remote_ip_address":"192.168.127.12","successful":true},{"average_rtt_ms":0.203,"remote_ip_address":"192.168.145.12","successful":true}]}]}',
      created_at: '2023-06-22T14:17:35.146219Z',
      deleted_at: null,
      discovery_agent_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-agent-rhel8:v1.0.0-264',
      disks_info:
        '{"/dev/disk/by-id/wwn-0x05abcdba1606bf77":{"disk_speed":{"speed_ms":7,"tested":true},"path":"/dev/disk/by-id/wwn-0x05abcdba1606bf77"}}',
      domain_name_resolutions:
        '{"resolutions":[{"domain_name":"api.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"api-int.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"console-openshift-console.apps.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com.","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"quay.io","ipv4_addresses":["52.0.72.224","52.44.162.2","23.20.135.143","54.166.80.25","3.224.204.235","34.237.31.230","34.237.27.205","18.214.152.215"],"ipv6_addresses":["2600:1f18:483:cf00:438a:498:d6eb:1039","2600:1f18:483:cf00:bbc4:d075:7b91:3e6a","2600:1f18:483:cf01:d5f4:94ce:f190:aeaf","2600:1f18:483:cf02:b4e:66bb:38:5d66","2600:1f18:483:cf01:33f6:d7d4:a9b1:e3ce","2600:1f18:483:cf01:6456:d087:d0c8:2d01","2600:1f18:483:cf02:e10b:8bbe:7d4c:1871","2600:1f18:483:cf02:68bb:2416:361c:5b8a"]}]}',
      href: '/api/assisted-install/v2/infra-envs/d3250480-d66d-4da1-ba75-4d65eb2a325b/hosts/68c3e3ac-3d88-47e8-81de-1d047b8f79fc',
      id: '68c3e3ac-3d88-47e8-81de-1d047b8f79fc',
      images_status:
        '{"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64":{"download_rate":52.149746418949675,"name":"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64","result":"success","size_bytes":433480982,"time":8.312235663},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d":{"download_rate":157.22635123640427,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d","result":"success","size_bytes":529011693,"time":3.36465032},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa":{"download_rate":158.06869488450673,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa","result":"success","size_bytes":551876877,"time":3.491373655},"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275":{"download_rate":47.507459370298555,"name":"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275","result":"success","size_bytes":403083234,"time":8.4846304}}',
      infra_env_id: day2FlowIds.day1.infraEnvId,
      installation_disk_id: '/dev/disk/by-id/wwn-0x05abcdba1606bf77',
      installation_disk_path: '/dev/sda',
      installer_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275',
      inventory:
        '{"bmc_address":"0.0.0.0","bmc_v6address":"::/0","boot":{"current_boot_mode":"bios"},"cpu":{"architecture":"x86_64","count":4,"flags":["fpu","vme","de","pse","tsc","msr","pae","mce","cx8","apic","sep","mtrr","pge","mca","cmov","pat","pse36","clflush","mmx","fxsr","sse","sse2","ss","syscall","nx","pdpe1gb","rdtscp","lm","constant_tsc","arch_perfmon","rep_good","nopl","xtopology","cpuid","tsc_known_freq","pni","pclmulqdq","vmx","ssse3","fma","cx16","pdcm","pcid","sse4_1","sse4_2","x2apic","movbe","popcnt","tsc_deadline_timer","aes","xsave","avx","f16c","rdrand","hypervisor","lahf_lm","abm","3dnowprefetch","cpuid_fault","invpcid_single","pti","ssbd","ibrs","ibpb","stibp","tpr_shadow","vnmi","flexpriority","ept","vpid","ept_ad","fsgsbase","tsc_adjust","bmi1","hle","avx2","smep","bmi2","erms","invpcid","rtm","mpx","rdseed","adx","smap","clflushopt","xsaveopt","xsavec","xgetbv1","xsaves","arat","umip","md_clear","arch_capabilities"],"frequency":3792,"model_name":"Intel(R) Xeon(R) E-2244G CPU @ 3.80GHz"},"disks":[{"by_id":"/dev/disk/by-id/wwn-0x05abcdba1606bf77","by_path":"/dev/disk/by-path/pci-0000:00:05.0-scsi-0:0:0:0","drive_type":"HDD","has_uuid":true,"hctl":"0:0:0:0","id":"/dev/disk/by-id/wwn-0x05abcdba1606bf77","installation_eligibility":{"eligible":true,"not_eligible_reasons":null},"model":"QEMU_HARDDISK","name":"sda","path":"/dev/sda","serial":"05abcdba1606bf77","size_bytes":100000000000,"vendor":"QEMU","wwn":"0x05abcdba1606bf77"},{"by_id":"/dev/disk/by-id/wwn-0x05abcd2733ee0108","by_path":"/dev/disk/by-path/pci-0000:00:08.0-scsi-0:0:0:4","drive_type":"ODD","has_uuid":true,"hctl":"3:0:0:4","id":"/dev/disk/by-id/wwn-0x05abcd2733ee0108","installation_eligibility":{"not_eligible_reasons":["Disk is removable","Disk is too small (disk only has 109 MB, but 20 GB are required)","Drive type is ODD, it must be one of HDD, SSD, Multipath."]},"is_installation_media":true,"model":"QEMU_CD-ROM","name":"sr0","path":"/dev/sr0","removable":true,"serial":"05abcd2733ee0108","size_bytes":109244416,"vendor":"QEMU","wwn":"0x05abcd2733ee0108"}],"gpus":[{"address":"0000:00:02.0"}],"hostname":"day2-flow-master-1","interfaces":[{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.127.11/24"],"ipv6_addresses":[],"mac_address":"02:00:00:f9:36:db","mtu":1500,"name":"ens3","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"},{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.145.11/24"],"ipv6_addresses":[],"mac_address":"02:00:00:39:87:5a","mtu":1500,"name":"ens4","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"}],"memory":{"physical_bytes":17179869184,"physical_bytes_method":"dmidecode","usable_bytes":16797458432},"routes":[{"destination":"0.0.0.0","family":2,"gateway":"192.168.127.1","interface":"ens3","metric":100},{"destination":"0.0.0.0","family":2,"gateway":"192.168.145.1","interface":"ens4","metric":101},{"destination":"10.88.0.0","family":2,"interface":"cni-podman0"},{"destination":"192.168.127.0","family":2,"interface":"ens3","metric":100},{"destination":"192.168.145.0","family":2,"interface":"ens4","metric":101},{"destination":"::1","family":10,"interface":"lo","metric":256},{"destination":"fe80::","family":10,"interface":"cni-podman0","metric":256},{"destination":"fe80::","family":10,"interface":"ens3","metric":1024},{"destination":"fe80::","family":10,"interface":"ens4","metric":1024}],"system_vendor":{"manufacturer":"Red Hat","product_name":"KVM","virtual":true},"tpm_version":"none"}',
      kind: 'Host',
      logs_collected_at: '2023-06-22T14:21:41.265Z',
      logs_info: 'completed',
      logs_started_at: '2023-06-22T14:21:40.888Z',
      ntp_sources:
        '[{"source_name":"ipv4.ntp2.rbauman.com","source_state":"unreachable"},{"source_name":"65-100-46-164.dia.static.qwest.net","source_state":"unreachable"},{"source_name":"time.cloudflare.com","source_state":"unreachable"},{"source_name":"50.205.57.38","source_state":"unreachable"},{"source_name":"10.11.160.238","source_state":"unreachable"}]',
      progress: {
        current_stage: 'Done',
        installation_percentage: 100,
        stage_started_at: '2023-06-22T14:35:16.298Z',
        stage_updated_at: '2023-06-22T14:35:16.298Z',
      },
      progress_stages: [
        'Starting installation',
        'Installing',
        'Writing image to disk',
        'Rebooting',
        'Configuring',
        'Joined',
        'Done',
      ],
      registered_at: '2023-06-22T14:17:35.142Z',
      requested_hostname: 'day2-flow-master-1',
      role: 'master',
      stage_started_at: '0001-01-01T00:00:00.000Z',
      stage_updated_at: '0001-01-01T00:00:00.000Z',
      status: 'installed',
      status_info: 'Done',
      status_updated_at: '2023-06-22T14:35:16.302Z',
      suggested_role: 'master',
      timestamp: 1687443757,
      updated_at: '2023-06-22T14:35:16.302835Z',
      user_name: 'rh-ee-someone',
      validations_info:
        '{"hardware":[{"id":"has-inventory","status":"success","message":"Valid inventory exists for the host"},{"id":"has-min-cpu-cores","status":"success","message":"Sufficient CPU cores"},{"id":"has-min-memory","status":"success","message":"Sufficient minimum RAM"},{"id":"has-min-valid-disks","status":"success","message":"Sufficient disk capacity"},{"id":"has-cpu-cores-for-role","status":"success","message":"Sufficient CPU cores for role master"},{"id":"has-memory-for-role","status":"success","message":"Sufficient RAM for role master"},{"id":"hostname-unique","status":"success","message":"Hostname day2-flow-master-1 is unique in cluster"},{"id":"hostname-valid","status":"success","message":"Hostname day2-flow-master-1 is allowed"},{"id":"sufficient-installation-disk-speed","status":"success","message":"Speed of installation disk is sufficient"},{"id":"compatible-with-cluster-platform","status":"success","message":"Host is compatible with cluster platform baremetal"},{"id":"no-skip-installation-disk","status":"success","message":"No request to skip formatting of the installation disk"},{"id":"no-skip-missing-disk","status":"success","message":"All disks that have skipped formatting are present in the host inventory"}],"network":[{"id":"machine-cidr-defined","status":"success","message":"Machine Network CIDR is defined"},{"id":"belongs-to-machine-cidr","status":"success","message":"Host belongs to all machine network CIDRs"},{"id":"belongs-to-majority-group","status":"success","message":"Host has connectivity to the majority of hosts in the cluster"},{"id":"valid-platform-network-settings","status":"success","message":"Platform KVM is allowed"},{"id":"container-images-available","status":"success","message":"All required container images were either pulled successfully or no attempt was made to pull them"},{"id":"sufficient-network-latency-requirement-for-role","status":"success","message":"Network latency requirement has been satisfied."},{"id":"sufficient-packet-loss-requirement-for-role","status":"success","message":"Packet loss requirement has been satisfied."},{"id":"has-default-route","status":"success","message":"Host has been configured with at least one default route."},{"id":"api-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api.day2-flow.redhat.com domain was successful or not required"},{"id":"api-int-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api-int.day2-flow.redhat.com domain was successful or not required"},{"id":"apps-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the *.apps.day2-flow.redhat.com domain was successful or not required"},{"id":"release-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the quay.io domain was successful or not required"},{"id":"dns-wildcard-not-configured","status":"success","message":"DNS wildcard check was successful"},{"id":"non-overlapping-subnets","status":"success","message":"Host subnets are not overlapping"},{"id":"no-ip-collisions-in-network","status":"success","message":"No IP collisions were detected by host 68c3e3ac-3d88-47e8-81de-1d047b8f79fc"}],"operators":[{"id":"cnv-requirements-satisfied","status":"success","message":"cnv is disabled"},{"id":"lso-requirements-satisfied","status":"success","message":"lso is disabled"},{"id":"lvm-requirements-satisfied","status":"success","message":"lvm is disabled"},{"id":"mce-requirements-satisfied","status":"success","message":"mce is disabled"},{"id":"odf-requirements-satisfied","status":"success","message":"odf is disabled"}]}',
    },
    {
      bootstrap: true,
      checked_in_at: '2023-06-22T14:48:40.250Z',
      cluster_id: aiClusterId,
      connectivity:
        '{"remote_hosts":[{"host_id":"68c3e3ac-3d88-47e8-81de-1d047b8f79fc","l2_connectivity":[{"outgoing_ip_address":"192.168.145.10","outgoing_nic":"ens4","remote_ip_address":"192.168.127.11","remote_mac":"02:00:00:39:87:5a","successful":true},{"outgoing_ip_address":"192.168.127.10","outgoing_nic":"ens3","remote_ip_address":"192.168.127.11","remote_mac":"02:00:00:f9:36:db","successful":true},{"outgoing_ip_address":"192.168.145.10","outgoing_nic":"ens4","remote_ip_address":"192.168.145.11","remote_mac":"02:00:00:39:87:5a","successful":true},{"outgoing_ip_address":"192.168.127.10","outgoing_nic":"ens3","remote_ip_address":"192.168.145.11","remote_mac":"02:00:00:f9:36:db","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.19,"remote_ip_address":"192.168.127.11","successful":true},{"average_rtt_ms":0.237,"remote_ip_address":"192.168.145.11","successful":true}]},{"host_id":"bda910cc-324e-4396-8c4d-59d972859d01","l2_connectivity":[{"outgoing_ip_address":"192.168.145.10","outgoing_nic":"ens4","remote_ip_address":"192.168.127.12","remote_mac":"02:00:00:28:54:24","successful":true},{"outgoing_ip_address":"192.168.127.10","outgoing_nic":"ens3","remote_ip_address":"192.168.127.12","remote_mac":"02:00:00:76:01:20","successful":true},{"outgoing_ip_address":"192.168.145.10","outgoing_nic":"ens4","remote_ip_address":"192.168.145.12","remote_mac":"02:00:00:28:54:24","successful":true},{"outgoing_ip_address":"192.168.127.10","outgoing_nic":"ens3","remote_ip_address":"192.168.145.12","remote_mac":"02:00:00:76:01:20","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.203,"remote_ip_address":"192.168.127.12","successful":true},{"average_rtt_ms":0.199,"remote_ip_address":"192.168.145.12","successful":true}]}]}',
      created_at: '2023-06-22T14:17:34.959566Z',
      deleted_at: null,
      discovery_agent_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-agent-rhel8:v1.0.0-264',
      disks_info:
        '{"/dev/disk/by-id/wwn-0x05abcde84d64ebc7":{"disk_speed":{"speed_ms":9,"tested":true},"path":"/dev/disk/by-id/wwn-0x05abcde84d64ebc7"}}',
      domain_name_resolutions:
        '{"resolutions":[{"domain_name":"api.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"api-int.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"console-openshift-console.apps.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com.","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"quay.io","ipv4_addresses":["18.214.152.215","34.237.27.205","34.237.31.230","3.224.204.235","54.166.80.25","23.20.135.143","52.44.162.2","52.0.72.224"],"ipv6_addresses":["2600:1f18:483:cf02:68bb:2416:361c:5b8a","2600:1f18:483:cf02:e10b:8bbe:7d4c:1871","2600:1f18:483:cf01:6456:d087:d0c8:2d01","2600:1f18:483:cf01:33f6:d7d4:a9b1:e3ce","2600:1f18:483:cf02:b4e:66bb:38:5d66","2600:1f18:483:cf01:d5f4:94ce:f190:aeaf","2600:1f18:483:cf00:bbc4:d075:7b91:3e6a","2600:1f18:483:cf00:438a:498:d6eb:1039"]}]}',
      href: '/api/assisted-install/v2/infra-envs/d3250480-d66d-4da1-ba75-4d65eb2a325b/hosts/a8e1a572-2136-4ea9-9327-a2f3ed0bc862',
      id: 'a8e1a572-2136-4ea9-9327-a2f3ed0bc862',
      images_status:
        '{"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64":{"download_rate":51.22706431168724,"name":"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64","result":"success","size_bytes":433480982,"time":8.461952443},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d":{"download_rate":156.71635685993658,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d","result":"success","size_bytes":529011693,"time":3.375599737},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa":{"download_rate":162.83619620615494,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa","result":"success","size_bytes":551876877,"time":3.389153578},"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275":{"download_rate":35.69148298740821,"name":"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275","result":"success","size_bytes":403083234,"time":11.293541211}}',
      infra_env_id: day2FlowIds.day1.infraEnvId,
      installation_disk_id: '/dev/disk/by-id/wwn-0x05abcde84d64ebc7',
      installation_disk_path: '/dev/sda',
      installer_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275',
      inventory:
        '{"bmc_address":"0.0.0.0","bmc_v6address":"::/0","boot":{"current_boot_mode":"bios"},"cpu":{"architecture":"x86_64","count":4,"flags":["fpu","vme","de","pse","tsc","msr","pae","mce","cx8","apic","sep","mtrr","pge","mca","cmov","pat","pse36","clflush","mmx","fxsr","sse","sse2","ss","syscall","nx","pdpe1gb","rdtscp","lm","constant_tsc","arch_perfmon","rep_good","nopl","xtopology","cpuid","tsc_known_freq","pni","pclmulqdq","vmx","ssse3","fma","cx16","pdcm","pcid","sse4_1","sse4_2","x2apic","movbe","popcnt","tsc_deadline_timer","aes","xsave","avx","f16c","rdrand","hypervisor","lahf_lm","abm","3dnowprefetch","cpuid_fault","invpcid_single","pti","ssbd","ibrs","ibpb","stibp","tpr_shadow","vnmi","flexpriority","ept","vpid","ept_ad","fsgsbase","tsc_adjust","bmi1","hle","avx2","smep","bmi2","erms","invpcid","rtm","mpx","rdseed","adx","smap","clflushopt","xsaveopt","xsavec","xgetbv1","xsaves","arat","umip","md_clear","arch_capabilities"],"frequency":3792,"model_name":"Intel(R) Xeon(R) E-2244G CPU @ 3.80GHz"},"disks":[{"by_id":"/dev/disk/by-id/wwn-0x05abcde84d64ebc7","by_path":"/dev/disk/by-path/pci-0000:00:05.0-scsi-0:0:0:0","drive_type":"HDD","has_uuid":true,"hctl":"0:0:0:0","id":"/dev/disk/by-id/wwn-0x05abcde84d64ebc7","installation_eligibility":{"eligible":true,"not_eligible_reasons":null},"model":"QEMU_HARDDISK","name":"sda","path":"/dev/sda","serial":"05abcde84d64ebc7","size_bytes":100000000000,"vendor":"QEMU","wwn":"0x05abcde84d64ebc7"},{"by_id":"/dev/disk/by-id/wwn-0x05abcd386848f784","by_path":"/dev/disk/by-path/pci-0000:00:08.0-scsi-0:0:0:4","drive_type":"ODD","has_uuid":true,"hctl":"3:0:0:4","id":"/dev/disk/by-id/wwn-0x05abcd386848f784","installation_eligibility":{"not_eligible_reasons":["Disk is removable","Disk is too small (disk only has 109 MB, but 20 GB are required)","Drive type is ODD, it must be one of HDD, SSD, Multipath."]},"is_installation_media":true,"model":"QEMU_CD-ROM","name":"sr0","path":"/dev/sr0","removable":true,"serial":"05abcd386848f784","size_bytes":109244416,"vendor":"QEMU","wwn":"0x05abcd386848f784"}],"gpus":[{"address":"0000:00:02.0"}],"hostname":"day2-flow-master-0","interfaces":[{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.127.10/24"],"ipv6_addresses":[],"mac_address":"02:00:00:20:77:4e","mtu":1500,"name":"ens3","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"},{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.145.10/24"],"ipv6_addresses":[],"mac_address":"02:00:00:eb:1a:80","mtu":1500,"name":"ens4","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"}],"memory":{"physical_bytes":17179869184,"physical_bytes_method":"dmidecode","usable_bytes":16797433856},"routes":[{"destination":"0.0.0.0","family":2,"gateway":"192.168.127.1","interface":"ens3","metric":100},{"destination":"0.0.0.0","family":2,"gateway":"192.168.145.1","interface":"ens4","metric":101},{"destination":"10.88.0.0","family":2,"interface":"cni-podman0"},{"destination":"192.168.127.0","family":2,"interface":"ens3","metric":100},{"destination":"192.168.145.0","family":2,"interface":"ens4","metric":101},{"destination":"::1","family":10,"interface":"lo","metric":256},{"destination":"fe80::","family":10,"interface":"cni-podman0","metric":256},{"destination":"fe80::","family":10,"interface":"ens3","metric":1024},{"destination":"fe80::","family":10,"interface":"ens4","metric":1024}],"system_vendor":{"manufacturer":"Red Hat","product_name":"KVM","virtual":true},"tpm_version":"none"}',
      kind: 'Host',
      logs_collected_at: '2023-06-22T14:48:14.345Z',
      logs_info: 'completed',
      logs_started_at: '2023-06-22T14:48:13.833Z',
      ntp_sources:
        '[{"source_name":"50.205.57.38","source_state":"unreachable"},{"source_name":"time.cloudflare.com","source_state":"unreachable"},{"source_name":"65-100-46-164.dia.static.qwest.net","source_state":"unreachable"},{"source_name":"ipv4.ntp2.rbauman.com","source_state":"unreachable"},{"source_name":"clock.corp.redhat.com","source_state":"unreachable"}]',
      progress: {
        current_stage: 'Done',
        installation_percentage: 100,
        stage_started_at: '2023-06-22T14:55:46.390Z',
        stage_updated_at: '2023-06-22T14:55:46.390Z',
      },
      progress_stages: [
        'Starting installation',
        'Installing',
        'Writing image to disk',
        'Waiting for control plane',
        'Waiting for bootkube',
        'Waiting for controller',
        'Rebooting',
        'Configuring',
        'Joined',
        'Done',
      ],
      registered_at: '2023-06-22T14:17:34.955Z',
      requested_hostname: 'day2-flow-master-0',
      role: 'master',
      stage_started_at: '0001-01-01T00:00:00.000Z',
      stage_updated_at: '0001-01-01T00:00:00.000Z',
      status: 'installed',
      status_info: 'Done',
      status_updated_at: '2023-06-22T14:55:46.394Z',
      suggested_role: 'master',
      timestamp: 1687445320,
      updated_at: '2023-06-22T14:55:46.395026Z',
      user_name: 'rh-ee-someone',
      validations_info:
        '{"hardware":[{"id":"has-inventory","status":"success","message":"Valid inventory exists for the host"},{"id":"has-min-cpu-cores","status":"success","message":"Sufficient CPU cores"},{"id":"has-min-memory","status":"success","message":"Sufficient minimum RAM"},{"id":"has-min-valid-disks","status":"success","message":"Sufficient disk capacity"},{"id":"has-cpu-cores-for-role","status":"success","message":"Sufficient CPU cores for role master"},{"id":"has-memory-for-role","status":"success","message":"Sufficient RAM for role master"},{"id":"hostname-unique","status":"success","message":"Hostname day2-flow-master-0 is unique in cluster"},{"id":"hostname-valid","status":"success","message":"Hostname day2-flow-master-0 is allowed"},{"id":"sufficient-installation-disk-speed","status":"success","message":"Speed of installation disk is sufficient"},{"id":"compatible-with-cluster-platform","status":"success","message":"Host is compatible with cluster platform baremetal"},{"id":"no-skip-installation-disk","status":"success","message":"No request to skip formatting of the installation disk"},{"id":"no-skip-missing-disk","status":"success","message":"All disks that have skipped formatting are present in the host inventory"}],"network":[{"id":"machine-cidr-defined","status":"success","message":"Machine Network CIDR is defined"},{"id":"belongs-to-machine-cidr","status":"success","message":"Host belongs to all machine network CIDRs"},{"id":"belongs-to-majority-group","status":"success","message":"Host has connectivity to the majority of hosts in the cluster"},{"id":"valid-platform-network-settings","status":"success","message":"Platform KVM is allowed"},{"id":"container-images-available","status":"success","message":"All required container images were either pulled successfully or no attempt was made to pull them"},{"id":"sufficient-network-latency-requirement-for-role","status":"success","message":"Network latency requirement has been satisfied."},{"id":"sufficient-packet-loss-requirement-for-role","status":"success","message":"Packet loss requirement has been satisfied."},{"id":"has-default-route","status":"success","message":"Host has been configured with at least one default route."},{"id":"api-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api.day2-flow.redhat.com domain was successful or not required"},{"id":"api-int-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api-int.day2-flow.redhat.com domain was successful or not required"},{"id":"apps-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the *.apps.day2-flow.redhat.com domain was successful or not required"},{"id":"release-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the quay.io domain was successful or not required"},{"id":"dns-wildcard-not-configured","status":"success","message":"DNS wildcard check was successful"},{"id":"non-overlapping-subnets","status":"success","message":"Host subnets are not overlapping"},{"id":"no-ip-collisions-in-network","status":"success","message":"No IP collisions were detected by host a8e1a572-2136-4ea9-9327-a2f3ed0bc862"}],"operators":[{"id":"cnv-requirements-satisfied","status":"success","message":"cnv is disabled"},{"id":"lso-requirements-satisfied","status":"success","message":"lso is disabled"},{"id":"lvm-requirements-satisfied","status":"success","message":"lvm is disabled"},{"id":"mce-requirements-satisfied","status":"success","message":"mce is disabled"},{"id":"odf-requirements-satisfied","status":"success","message":"odf is disabled"}]}',
    },
    {
      checked_in_at: '2023-06-22T14:22:44.568Z',
      cluster_id: aiClusterId,
      connectivity:
        '{"remote_hosts":[{"host_id":"68c3e3ac-3d88-47e8-81de-1d047b8f79fc","l2_connectivity":[{"outgoing_ip_address":"192.168.145.12","outgoing_nic":"ens4","remote_ip_address":"192.168.127.11","remote_mac":"02:00:00:39:87:5a","successful":true},{"outgoing_ip_address":"192.168.127.12","outgoing_nic":"ens3","remote_ip_address":"192.168.127.11","remote_mac":"02:00:00:f9:36:db","successful":true},{"outgoing_ip_address":"192.168.145.12","outgoing_nic":"ens4","remote_ip_address":"192.168.145.11","remote_mac":"02:00:00:39:87:5a","successful":true},{"outgoing_ip_address":"192.168.127.12","outgoing_nic":"ens3","remote_ip_address":"192.168.145.11","remote_mac":"02:00:00:f9:36:db","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.159,"remote_ip_address":"192.168.127.11","successful":true},{"average_rtt_ms":0.158,"remote_ip_address":"192.168.145.11","successful":true}]},{"host_id":"a8e1a572-2136-4ea9-9327-a2f3ed0bc862","l2_connectivity":[{"outgoing_ip_address":"192.168.127.12","outgoing_nic":"ens3","remote_ip_address":"192.168.127.10","remote_mac":"02:00:00:20:77:4e","successful":true},{"outgoing_ip_address":"192.168.145.12","outgoing_nic":"ens4","remote_ip_address":"192.168.127.10","remote_mac":"02:00:00:eb:1a:80","successful":true},{"outgoing_ip_address":"192.168.127.12","outgoing_nic":"ens3","remote_ip_address":"192.168.145.10","remote_mac":"02:00:00:20:77:4e","successful":true},{"outgoing_ip_address":"192.168.145.12","outgoing_nic":"ens4","remote_ip_address":"192.168.145.10","remote_mac":"02:00:00:eb:1a:80","successful":true}],"l3_connectivity":[{"average_rtt_ms":0.211,"remote_ip_address":"192.168.127.10","successful":true},{"average_rtt_ms":0.201,"remote_ip_address":"192.168.145.10","successful":true}]}]}',
      created_at: '2023-06-22T14:17:42.688155Z',
      deleted_at: null,
      discovery_agent_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-agent-rhel8:v1.0.0-264',
      disks_info:
        '{"/dev/disk/by-id/wwn-0x05abcd7ce0f0f6f3":{"disk_speed":{"speed_ms":6,"tested":true},"path":"/dev/disk/by-id/wwn-0x05abcd7ce0f0f6f3"}}',
      domain_name_resolutions:
        '{"resolutions":[{"domain_name":"api.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"api-int.day2-flow.redhat.com","ipv4_addresses":["192.168.127.100"],"ipv6_addresses":[]},{"domain_name":"console-openshift-console.apps.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com.","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"validateNoWildcardDNS.day2-flow.redhat.com","ipv4_addresses":[],"ipv6_addresses":[]},{"domain_name":"quay.io","ipv4_addresses":["18.214.152.215","34.237.27.205","52.206.40.42","3.224.204.235","52.0.72.224","34.237.31.230","23.20.135.143","52.44.162.2"],"ipv6_addresses":["2600:1f18:483:cf02:e10b:8bbe:7d4c:1871","2600:1f18:483:cf00:438a:498:d6eb:1039","2600:1f18:483:cf01:6456:d087:d0c8:2d01","2600:1f18:483:cf00:521a:3ba6:1b12:e130","2600:1f18:483:cf02:b4e:66bb:38:5d66","2600:1f18:483:cf02:68bb:2416:361c:5b8a","2600:1f18:483:cf00:bbc4:d075:7b91:3e6a","2600:1f18:483:cf01:33f6:d7d4:a9b1:e3ce"]}]}',
      href: '/api/assisted-install/v2/infra-envs/d3250480-d66d-4da1-ba75-4d65eb2a325b/hosts/bda910cc-324e-4396-8c4d-59d972859d01',
      id: 'bda910cc-324e-4396-8c4d-59d972859d01',
      images_status:
        '{"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64":{"download_rate":48.312381815924,"name":"quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64","result":"success","size_bytes":433480982,"time":8.972461421},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d":{"download_rate":173.56217420791066,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:19721546a4e3355d8721e67006b75e64918125e10d4d0840d64d5a8b1e43209d","result":"success","size_bytes":529011693,"time":3.047966502},"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa":{"download_rate":150.71744745741245,"name":"quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:4805fe0719ffc3d86f97c3c476196e1de7dfb5df0d15255c3852c2ea52bd1eaa","result":"success","size_bytes":551876877,"time":3.661665496},"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275":{"download_rate":92.78272786138002,"name":"registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275","result":"success","size_bytes":403083234,"time":4.344377917}}',
      infra_env_id: day2FlowIds.day1.infraEnvId,
      installation_disk_id: '/dev/disk/by-id/wwn-0x05abcd7ce0f0f6f3',
      installation_disk_path: '/dev/sda',
      installer_version:
        'registry-proxy.engineering.redhat.com/rh-osbs/openshift4-assisted-installer-rhel8:v1.0.0-275',
      inventory:
        '{"bmc_address":"0.0.0.0","bmc_v6address":"::/0","boot":{"current_boot_mode":"bios"},"cpu":{"architecture":"x86_64","count":4,"flags":["fpu","vme","de","pse","tsc","msr","pae","mce","cx8","apic","sep","mtrr","pge","mca","cmov","pat","pse36","clflush","mmx","fxsr","sse","sse2","ss","syscall","nx","pdpe1gb","rdtscp","lm","constant_tsc","arch_perfmon","rep_good","nopl","xtopology","cpuid","tsc_known_freq","pni","pclmulqdq","vmx","ssse3","fma","cx16","pdcm","pcid","sse4_1","sse4_2","x2apic","movbe","popcnt","tsc_deadline_timer","aes","xsave","avx","f16c","rdrand","hypervisor","lahf_lm","abm","3dnowprefetch","cpuid_fault","invpcid_single","pti","ssbd","ibrs","ibpb","stibp","tpr_shadow","vnmi","flexpriority","ept","vpid","ept_ad","fsgsbase","tsc_adjust","bmi1","hle","avx2","smep","bmi2","erms","invpcid","rtm","mpx","rdseed","adx","smap","clflushopt","xsaveopt","xsavec","xgetbv1","xsaves","arat","umip","md_clear","arch_capabilities"],"frequency":3792,"model_name":"Intel(R) Xeon(R) E-2244G CPU @ 3.80GHz"},"disks":[{"by_id":"/dev/disk/by-id/wwn-0x05abcd7ce0f0f6f3","by_path":"/dev/disk/by-path/pci-0000:00:05.0-scsi-0:0:0:0","drive_type":"HDD","has_uuid":true,"hctl":"0:0:0:0","id":"/dev/disk/by-id/wwn-0x05abcd7ce0f0f6f3","installation_eligibility":{"eligible":true,"not_eligible_reasons":null},"model":"QEMU_HARDDISK","name":"sda","path":"/dev/sda","serial":"05abcd7ce0f0f6f3","size_bytes":100000000000,"vendor":"QEMU","wwn":"0x05abcd7ce0f0f6f3"},{"by_id":"/dev/disk/by-id/wwn-0x05abcdbad25db2d6","by_path":"/dev/disk/by-path/pci-0000:00:08.0-scsi-0:0:0:4","drive_type":"ODD","has_uuid":true,"hctl":"5:0:0:4","id":"/dev/disk/by-id/wwn-0x05abcdbad25db2d6","installation_eligibility":{"not_eligible_reasons":["Disk is removable","Disk is too small (disk only has 109 MB, but 20 GB are required)","Drive type is ODD, it must be one of HDD, SSD, Multipath."]},"is_installation_media":true,"model":"QEMU_CD-ROM","name":"sr0","path":"/dev/sr0","removable":true,"serial":"05abcdbad25db2d6","size_bytes":109244416,"vendor":"QEMU","wwn":"0x05abcdbad25db2d6"}],"gpus":[{"address":"0000:00:02.0"}],"hostname":"day2-flow-master-2","interfaces":[{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.127.12/24"],"ipv6_addresses":[],"mac_address":"02:00:00:76:01:20","mtu":1500,"name":"ens3","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"},{"flags":["up","broadcast","multicast"],"has_carrier":true,"ipv4_addresses":["192.168.145.12/24"],"ipv6_addresses":[],"mac_address":"02:00:00:28:54:24","mtu":1500,"name":"ens4","product":"0x0001","speed_mbps":-1,"type":"physical","vendor":"0x1af4"}],"memory":{"physical_bytes":17179869184,"physical_bytes_method":"dmidecode","usable_bytes":16797433856},"routes":[{"destination":"0.0.0.0","family":2,"gateway":"192.168.127.1","interface":"ens3","metric":100},{"destination":"0.0.0.0","family":2,"gateway":"192.168.145.1","interface":"ens4","metric":101},{"destination":"10.88.0.0","family":2,"interface":"cni-podman0"},{"destination":"192.168.127.0","family":2,"interface":"ens3","metric":100},{"destination":"192.168.145.0","family":2,"interface":"ens4","metric":101},{"destination":"::1","family":10,"interface":"lo","metric":256},{"destination":"fe80::","family":10,"interface":"cni-podman0","metric":256},{"destination":"fe80::","family":10,"interface":"ens3","metric":1024},{"destination":"fe80::","family":10,"interface":"ens4","metric":1024}],"system_vendor":{"manufacturer":"Red Hat","product_name":"KVM","virtual":true},"tpm_version":"none"}',
      kind: 'Host',
      logs_collected_at: '2023-06-22T14:21:49.512Z',
      logs_info: 'completed',
      logs_started_at: '2023-06-22T14:21:49.298Z',
      ntp_sources:
        '[{"source_name":"65-100-46-164.dia.static.qwest.net","source_state":"unreachable"},{"source_name":"static.36.62.78.5.clients.your-server.de","source_state":"unreachable"},{"source_name":"tick.mdacore.net","source_state":"unreachable"},{"source_name":"time.cloudflare.com","source_state":"unreachable"},{"source_name":"tick.eoni.com","source_state":"unreachable"},{"source_name":"50.205.57.38","source_state":"unreachable"},{"source_name":"ns2.iu13.org","source_state":"unreachable"},{"source_name":"ipv4.ntp2.rbauman.com","source_state":"unreachable"},{"source_name":"ntp2.ntp-001.prod.iad2.dc.redhat.com","source_state":"unreachable"}]',
      progress: {
        current_stage: 'Done',
        installation_percentage: 100,
        stage_started_at: '2023-06-22T14:35:16.369Z',
        stage_updated_at: '2023-06-22T14:35:16.369Z',
      },
      progress_stages: [
        'Starting installation',
        'Installing',
        'Writing image to disk',
        'Rebooting',
        'Configuring',
        'Joined',
        'Done',
      ],
      registered_at: '2023-06-22T14:17:42.683Z',
      requested_hostname: 'day2-flow-master-2',
      role: 'master',
      stage_started_at: '0001-01-01T00:00:00.000Z',
      stage_updated_at: '0001-01-01T00:00:00.000Z',
      status: 'installed',
      status_info: 'Done',
      status_updated_at: '2023-06-22T14:35:16.376Z',
      suggested_role: 'master',
      timestamp: 1687443764,
      updated_at: '2023-06-22T14:35:16.377961Z',
      user_name: 'rh-ee-someone',
      validations_info:
        '{"hardware":[{"id":"has-inventory","status":"success","message":"Valid inventory exists for the host"},{"id":"has-min-cpu-cores","status":"success","message":"Sufficient CPU cores"},{"id":"has-min-memory","status":"success","message":"Sufficient minimum RAM"},{"id":"has-min-valid-disks","status":"success","message":"Sufficient disk capacity"},{"id":"has-cpu-cores-for-role","status":"success","message":"Sufficient CPU cores for role master"},{"id":"has-memory-for-role","status":"success","message":"Sufficient RAM for role master"},{"id":"hostname-unique","status":"success","message":"Hostname day2-flow-master-2 is unique in cluster"},{"id":"hostname-valid","status":"success","message":"Hostname day2-flow-master-2 is allowed"},{"id":"sufficient-installation-disk-speed","status":"success","message":"Speed of installation disk is sufficient"},{"id":"compatible-with-cluster-platform","status":"success","message":"Host is compatible with cluster platform baremetal"},{"id":"no-skip-installation-disk","status":"success","message":"No request to skip formatting of the installation disk"},{"id":"no-skip-missing-disk","status":"success","message":"All disks that have skipped formatting are present in the host inventory"}],"network":[{"id":"machine-cidr-defined","status":"success","message":"Machine Network CIDR is defined"},{"id":"belongs-to-machine-cidr","status":"success","message":"Host belongs to all machine network CIDRs"},{"id":"belongs-to-majority-group","status":"success","message":"Host has connectivity to the majority of hosts in the cluster"},{"id":"valid-platform-network-settings","status":"success","message":"Platform KVM is allowed"},{"id":"container-images-available","status":"success","message":"All required container images were either pulled successfully or no attempt was made to pull them"},{"id":"sufficient-network-latency-requirement-for-role","status":"success","message":"Network latency requirement has been satisfied."},{"id":"sufficient-packet-loss-requirement-for-role","status":"success","message":"Packet loss requirement has been satisfied."},{"id":"has-default-route","status":"success","message":"Host has been configured with at least one default route."},{"id":"api-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api.day2-flow.redhat.com domain was successful or not required"},{"id":"api-int-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the api-int.day2-flow.redhat.com domain was successful or not required"},{"id":"apps-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the *.apps.day2-flow.redhat.com domain was successful or not required"},{"id":"release-domain-name-resolved-correctly","status":"success","message":"Domain name resolution for the quay.io domain was successful or not required"},{"id":"dns-wildcard-not-configured","status":"success","message":"DNS wildcard check was successful"},{"id":"non-overlapping-subnets","status":"success","message":"Host subnets are not overlapping"},{"id":"no-ip-collisions-in-network","status":"success","message":"No IP collisions were detected by host bda910cc-324e-4396-8c4d-59d972859d01"}],"operators":[{"id":"cnv-requirements-satisfied","status":"success","message":"cnv is disabled"},{"id":"lso-requirements-satisfied","status":"success","message":"lso is disabled"},{"id":"lvm-requirements-satisfied","status":"success","message":"lvm is disabled"},{"id":"mce-requirements-satisfied","status":"success","message":"mce is disabled"},{"id":"odf-requirements-satisfied","status":"success","message":"odf is disabled"}]}',
    },
  ],
  href: `/api/assisted-install/v2/clusters/${aiClusterId}`,
  hyperthreading: 'all',
  ignition_endpoint: {},
  image_info: { created_at: '0001-01-01T00:00:00Z', expires_at: '0001-01-01T00:00:00.000Z' },
  ingress_vip: '192.168.127.101',
  ingress_vips: [
    {
      cluster_id: aiClusterId,
      ip: '192.168.127.101',
      verification: 'succeeded',
    },
  ],
  install_completed_at: '2023-06-22T15:06:25.057Z',
  install_started_at: '2023-06-22T14:19:31.314Z',
  ip_collisions: '{}',
  kind: 'Cluster',
  logs_info: 'collecting',
  machine_networks: [{ cidr: '192.168.127.0/24', cluster_id: aiClusterId }],
  monitored_operators: [
    {
      cluster_id: aiClusterId,
      name: 'console',
      operator_type: 'builtin',
      status: 'available',
      status_info: 'All is well',
      status_updated_at: '2023-06-22T14:58:16.584Z',
      timeout_seconds: 3600,
      version: '4.12.21',
    },
    {
      cluster_id: aiClusterId,
      name: 'cvo',
      operator_type: 'builtin',
      status: 'available',
      status_info: 'Done applying 4.12.21',
      status_updated_at: '2023-06-22T15:06:16.367Z',
      timeout_seconds: 3600,
      version: '4.12.21',
    },
  ],
  name: 'day2-flow',
  network_type: 'OVNKubernetes',
  ocp_release_image: 'quay.io/openshift-release-dev/ocp-release:4.12.21-x86_64',
  openshift_version: '4.12.21',
  org_id: '11009103',
  platform: { is_external: false, type: 'baremetal' },
  progress: {
    finalizing_stage_percentage: 100,
    installing_stage_percentage: 100,
    preparing_for_installation_stage_percentage: 100,
    total_percentage: 100,
  },
  pull_secret_set: true,
  schedulable_masters: false,
  schedulable_masters_forced_true: true,
  service_networks: [{ cidr: '10.128.0.0/14', cluster_id: aiClusterId }],
  ssh_public_key:
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDLS3xF3O0GrMTTRRmx/TGRHFzI5BlJ9YJ4WMROFyrw0bYUuEsA1ya28dz2h+BzO4tHemns/AycosA1A5H5ygTYgdUh3AgHnBSPdGpD44Cd6yCnhoqghflE0OOoMSLJGQGqbHzs4154szvSMhGJXsOI1LeZ0wjzswkm5egySKS0AAtdEN3J0Il2UUHVxGHahEEj6M3R8F79oDHKiElsCUWywcu4oOt0LWMa+tkUPriKwguWIhM+u/awe0mbE9fDuZ7QBmWM1TVFdl+7DYo3w6n99ed2Dfu9aqK2DyTd5Gvo3X8We4NR9EMNaz8sRjMwShcU+LyFNvgMaDHU5mh+OKgsHfjKm8licOV6YfS281XoZzNdYjcCVXkwKut8c/9qqYk0e3K5ZfQ0lcCdFRzAfyBHJPc06FPexWT9Q22ij7aaxmoFerJucHBcZoGdmVHPi5kDcCusohF5TJ//Ou7PQOaS6ldT3C01PTXUxMlVKzAUKTI7LbdLrfoO/xp61tIWQU8= root@edge-13.edge.lab.eng.rdu2.redhat.com',
  status: 'installed',
  status_info: 'Cluster is installed',
  status_updated_at: '2023-06-22T15:06:25.057Z',
  total_host_count: 3,
  updated_at: '2023-06-22T15:06:25.058021Z',
  user_managed_networking: false,
  user_name: 'rh-ee-someone',
  validations_info:
    '{"configuration":[{"id":"pull-secret-set","status":"success","message":"The pull secret is set."}],"hosts-data":[{"id":"all-hosts-are-ready-to-install","status":"success","message":"All hosts in the cluster are ready to install."},{"id":"sufficient-masters-count","status":"success","message":"The cluster has the exact amount of dedicated control plane nodes."}],"network":[{"id":"api-vips-defined","status":"success","message":"API virtual IPs are defined."},{"id":"api-vips-valid","status":"success","message":"api vips 192.168.127.100 belongs to the Machine CIDR and is not in use."},{"id":"cluster-cidr-defined","status":"success","message":"The Cluster Network CIDR is defined."},{"id":"dns-domain-defined","status":"success","message":"The base domain is defined."},{"id":"ingress-vips-defined","status":"success","message":"Ingress virtual IPs are defined."},{"id":"ingress-vips-valid","status":"success","message":"ingress vips 192.168.127.101 belongs to the Machine CIDR and is not in use."},{"id":"machine-cidr-defined","status":"success","message":"The Machine Network CIDR is defined."},{"id":"machine-cidr-equals-to-calculated-cidr","status":"success","message":"The Cluster Machine CIDR is equivalent to the calculated CIDR."},{"id":"network-prefix-valid","status":"success","message":"The Cluster Network prefix is valid."},{"id":"network-type-valid","status":"success","message":"The cluster has a valid network type"},{"id":"networks-same-address-families","status":"success","message":"Same address families for all networks."},{"id":"no-cidrs-overlapping","status":"success","message":"No CIDRS are overlapping."},{"id":"ntp-server-configured","status":"success","message":"No ntp problems found"},{"id":"service-cidr-defined","status":"success","message":"The Service Network CIDR is defined."}],"operators":[{"id":"cnv-requirements-satisfied","status":"success","message":"cnv is disabled"},{"id":"lso-requirements-satisfied","status":"success","message":"lso is disabled"},{"id":"lvm-requirements-satisfied","status":"success","message":"lvm is disabled"},{"id":"mce-requirements-satisfied","status":"success","message":"mce is disabled"},{"id":"odf-requirements-satisfied","status":"success","message":"odf is disabled"}]}',
  vip_dhcp_allocation: false,
};

export { aiCluster };
