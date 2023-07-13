const day2FlowIds = {
  day1: {
    ocmSubscriptionId: 'ocm-subscription-id',
    ocmClusterId: 'ocm-cluster-id',
    aiClusterId: 'day2flow-day1-ai-cluster-id',
    infraEnvId: 'day2flow-day1-ai-infraEnv-id',
  },
  day2: {
    aiClusterId: 'day2flow-day2-ai-cluster-id',
    infraEnvIds: {
      x86_64: 'day2flow-day2-ai-infraEnv-id-x86_64',
      arm64: 'day2flow-day2-ai-infraEnv-id-arm64',
    },
  },
};

export { day2FlowIds };
