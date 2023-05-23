// Dev mode
Cypress.env(
  'sshCmd',
  `ssh -o StrictHostKeyChecking=no -i
    ${Cypress.env('REMOTE_SSH_ID_FILE') || '~/.ssh/id_rsa'}
    ${Cypress.env('REMOTE_USER')}@${Cypress.env('REMOTE_HOST')}`,
);
// timeouts
Cypress.env('DEFAULT_API_REQUEST_TIMEOUT', 20 * 1000);
Cypress.env('DEFAULT_CREATE_CLUSTER_BUTTON_SHOW_TIMEOUT', 60 * 1000);
Cypress.env('DEFAULT_SAVE_BUTTON_TIMEOUT', 30 * 1000);
Cypress.env('HOST_REGISTRATION_TIMEOUT', 11 * 1000);
Cypress.env('HOST_DISCOVERY_TIMEOUT', 11 * 1000);
Cypress.env('HOST_READY_TIMEOUT', 11 * 1000);
Cypress.env('VALIDATE_CHANGES_TIMEOUT', 10 * 1000);
Cypress.env('START_INSTALLATION_TIMEOUT', 2.5 * 60 * 1000);
Cypress.env('INSTALL_PREPARATION_TIMEOUT', 5 * 60 * 1000);
Cypress.env('GENERATE_ISO_TIMEOUT', 2 * 60 * 1000);
Cypress.env('FILE_DOWNLOAD_TIMEOUT', 60 * 1000);
Cypress.env('ISO_DOWNLOAD_TIMEOUT', 60 * 60 * 1000);
Cypress.env('CLUSTER_CREATION_TIMEOUT', 9000000);
Cypress.env('CLUSTER_REGISTRATION_TIMEOUT', 20 * 60 * 1000);
Cypress.env('DAY2_HOST_INSTALLATION_TIMEOUT', 10 * 60 * 1000);
Cypress.env('HOST_STATUS_INSUFFICIENT_TIMEOUT', 300000);
Cypress.env('NETWORK_LATENCY_ALERT_MESSAGE_TIMEOUT', 300000);
Cypress.env('WAIT_FOR_PROGRESS_STATUS_INSTALLED', 1800000);
Cypress.env('KUBECONFIG_DOWNLOAD_TIMEOUT', 300000);
Cypress.env('WAIT_FOR_HEADER_TIMEOUT', 120000);
Cypress.env('WAIT_FOR_CONSOLE_TIMEOUT', 2900000);
Cypress.env('DNS_RESOLUTION_ALERT_MESSAGE_TIMEOUT', 900000);
// Deployment
Cypress.env('NUM_MASTERS', parseInt(Cypress.env('NUM_MASTERS')));
Cypress.env('NUM_WORKERS', parseInt(Cypress.env('NUM_WORKERS')));
Cypress.env('MASTER_HOST_ROW_MAX_INDEX', Number(Cypress.env('NUM_MASTERS')) * 2 - 2);
Cypress.env(
  'WORKER_HOST_ROW_MAX_INDEX',
  (Number(Cypress.env('NUM_MASTERS')) + Number(Cypress.env('NUM_WORKERS'))) * 2 - 2,
);
Cypress.env('DISCOVERY_IMAGE_GLOB_PATTERN', 'discovery_image_*.iso');
Cypress.env('DISCOVERY_IMAGE_PATH', '/var/lib/libvirt/images/0/cluster-discovery.iso');
Cypress.env('DEFAULT_CLUSTER_NAME', 'ocp-edge-cluster-0');
Cypress.env('OPENSHIFT_CONF', '/etc/NetworkManager/dnsmasq.d/openshift.conf');
Cypress.env('HYPERVISOR_IP', '192.168.123.1');
Cypress.env('BAREMETAL_QE3', 'r640-u09.qe3.kni.lab.eng.bos.redhat.com');
Cypress.env('HOST_ROLE_MASTER_LABEL', 'Control plane node');
Cypress.env('HOST_ROLE_WORKER_LABEL', 'Worker');
Cypress.env('VMWARE_ENV', false);
Cypress.env('VMWARE_SNO', false);
Cypress.env('IS_BAREMETAL', false);
