// export const CLUSTER_STEP_DETAIL = 'cluster-detail';
export const CLUSTER_STEP_CONFIGURATION = 'cluster-configuration';
export const CLUSTER_STEP_NETWORKING = 'networking';

// Keep the correct order
export const CLUSTER_STEPS_ORDER = {
  // [CLUSTER_STEP_DETAIL]: 0,
  [CLUSTER_STEP_CONFIGURATION]: 0,
  [CLUSTER_STEP_NETWORKING]: 1,
};
export const CLUSTER_STEPS_INDEXED = Object.keys(CLUSTER_STEPS_ORDER).sort(
  (keyA, keyB) => CLUSTER_STEPS_ORDER[keyA] - CLUSTER_STEPS_ORDER[keyB],
);
