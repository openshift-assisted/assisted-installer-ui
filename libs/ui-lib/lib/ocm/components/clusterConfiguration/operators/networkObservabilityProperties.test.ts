import { describe, expect, it } from 'vitest';
import {
  parseNetworkObservabilityProperties,
  serializeNetworkObservabilityProperties,
  validateNetworkObservabilityProperties,
} from './networkObservabilityProperties';

describe('networkObservabilityProperties', () => {
  it('parses defaults when properties are missing', () => {
    expect(parseNetworkObservabilityProperties(undefined)).toEqual({
      createFlowCollector: false,
      sampling: 50,
    });
  });

  it('serializes operator-only install without sampling', () => {
    expect(
      serializeNetworkObservabilityProperties({
        createFlowCollector: false,
        sampling: 50,
      }),
    ).toBe('{"createFlowCollector":false}');
  });

  it('serializes FlowCollector install with sampling', () => {
    expect(
      serializeNetworkObservabilityProperties({
        createFlowCollector: true,
        sampling: 25,
      }),
    ).toBe('{"createFlowCollector":true,"sampling":25}');
  });

  it('rejects invalid sampling when FlowCollector is enabled', () => {
    const properties = serializeNetworkObservabilityProperties({
      createFlowCollector: true,
      sampling: 0,
    });

    expect(validateNetworkObservabilityProperties(properties)).toBe(
      'Sampling rate must be at least 1 when creating a FlowCollector.',
    );
  });

  it('allows operator-only install without validating sampling', () => {
    const properties = serializeNetworkObservabilityProperties({
      createFlowCollector: false,
      sampling: 0,
    });

    expect(validateNetworkObservabilityProperties(properties)).toBeUndefined();
  });
});
