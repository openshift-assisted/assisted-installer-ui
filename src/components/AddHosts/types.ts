/* The type is reverse engineered.
   The OCM object contains additional data.
 */
export type OcmClusterType = {
  id: string;
  external_id: string; // UUID
  cluster_id: string;

  name: string;
  display_name: string;
  openshift_version: string;

  managed: boolean;
  canEdit: boolean;
  canDelete: boolean;
  shouldRedirect: boolean;

  state: string; // i.e: ready

  cloud_provider?: {
    kind: string;
    id: string; // baremetal
  };
  console?: {
    url: string;
  };
  api?: {
    url: string;
  };
  nodes?: {
    total: number;
    master: number;
    compute: number;
  };
  dns?: {
    base_domain: string;
  };
  network?: {
    machine_cidr: string;
    service_cidr: string;
    pod_cidr: string;
  };
};
