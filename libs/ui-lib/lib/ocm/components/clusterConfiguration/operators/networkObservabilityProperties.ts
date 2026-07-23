export const NETWORK_OBSERVABILITY_OPERATOR_ID = 'network-observability';

export type NetworkObservabilityProperties = {
  createFlowCollector: boolean;
  sampling: number;
};

export const DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES: NetworkObservabilityProperties = {
  createFlowCollector: false,
  sampling: 50,
};

export const parseNetworkObservabilityProperties = (
  propertiesJson: string | undefined,
): NetworkObservabilityProperties => {
  if (!propertiesJson) {
    return { ...DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES };
  }

  try {
    const parsed: unknown = JSON.parse(propertiesJson);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ...DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES };
    }

    const record = parsed as Record<string, unknown>;
    const createFlowCollector =
      record.createFlowCollector === true || record.createFlowCollector === 'true';

    let sampling = DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES.sampling;
    const samplingValue = record.sampling;
    if (typeof samplingValue === 'number') {
      sampling = samplingValue;
    } else if (typeof samplingValue === 'string') {
      sampling = parseInt(samplingValue, 10);
    }

    return {
      createFlowCollector,
      sampling: Number.isFinite(sampling)
        ? sampling
        : DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES.sampling,
    };
  } catch {
    return { ...DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES };
  }
};

export const serializeNetworkObservabilityProperties = (
  properties: NetworkObservabilityProperties,
): string => {
  if (!properties.createFlowCollector) {
    return JSON.stringify({ createFlowCollector: false });
  }

  return JSON.stringify({
    createFlowCollector: true,
    sampling: properties.sampling,
  });
};

export const validateNetworkObservabilityProperties = (
  propertiesJson: string | undefined,
): string | undefined => {
  if (!propertiesJson) {
    return undefined;
  }

  let parsed: NetworkObservabilityProperties;
  try {
    parsed = parseNetworkObservabilityProperties(propertiesJson);
  } catch {
    return 'Invalid operator configuration.';
  }

  if (parsed.createFlowCollector && parsed.sampling < 1) {
    return 'Sampling rate must be at least 1 when creating a FlowCollector.';
  }

  return undefined;
};
