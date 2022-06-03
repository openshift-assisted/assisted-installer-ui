export const isSingleClusterMode = () => {
  return process.env.REACT_APP_BUILD_MODE === 'single-cluster';
};
export const getBasePermissions = () => {
  if (!process.env.REACT_APP_CLUSTER_PERMISSIONS) {
    return { canEdit: true };
  }
  return JSON.parse(process.env.REACT_APP_CLUSTER_PERMISSIONS);
};
export const OCM_CLUSTER_LIST_LINK = '/openshift'; // TODO(mlibra): Tweak it!!!
