import { describe, it, expect } from 'vitest';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';
import { OperatorsValues } from '@openshift-assisted/common';

// Test the counting logic that was implemented in OperatorsSelect
function calculateSelectedOperators(
  values: OperatorsValues,
  bundles: Bundle[],
  opSpecs: Record<string, unknown>,
): string[] {
  // Calculate all selected operators (direct selections + bundle selections)
  const bundleOperators = values.selectedBundles.flatMap(
    (bundleId) => bundles.find((b) => b.id === bundleId)?.operators || [],
  );

  const allSelectedOperators = values.selectedOperators
    .concat(bundleOperators)
    .filter((op, index, array) => array.indexOf(op) === index); // Remove duplicates

  return allSelectedOperators.filter((opKey) => !!opSpecs[opKey]);
}

describe('OperatorsSelect counting logic', () => {
  const mockBundles: Bundle[] = [
    {
      id: 'virtualization',
      title: 'Virtualization',
      description: 'Virtualization bundle',
      operators: ['cnv', 'nmstate', 'mtv'],
    },
    {
      id: 'openshift-ai',
      title: 'OpenShift AI',
      description: 'AI bundle',
      operators: ['nvidia-gpu', 'authorino', 'odf'],
    },
  ];

  const mockOpSpecs = {
    lvm: { title: 'LVM' },
    odf: { title: 'ODF' },
    cnv: { title: 'CNV' },
    nmstate: { title: 'NMState' },
    mtv: { title: 'MTV' },
    'nvidia-gpu': { title: 'NVIDIA GPU' },
    authorino: { title: 'Authorino' },
  };

  it('should count only manually selected operators when no bundles are selected', () => {
    const values: OperatorsValues = {
      selectedOperators: ['lvm', 'odf'],
      selectedBundles: [],
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(2);
    expect(result).toContain('lvm');
    expect(result).toContain('odf');
  });

  it('should count bundle operators when a bundle is selected', () => {
    const values: OperatorsValues = {
      selectedOperators: ['lvm'], // 1 manually selected
      selectedBundles: ['virtualization'], // bundle with 3 operators: cnv, nmstate, mtv
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(4);
    expect(result).toContain('lvm');
    expect(result).toContain('cnv');
    expect(result).toContain('nmstate');
    expect(result).toContain('mtv');
  });

  it('should not double-count operators that are both manually selected and in a bundle', () => {
    const values: OperatorsValues = {
      selectedOperators: ['lvm', 'cnv'], // cnv is also in the bundle
      selectedBundles: ['virtualization'], // bundle with: cnv, nmstate, mtv
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(4);
    expect(result).toContain('lvm');
    expect(result).toContain('cnv');
    expect(result).toContain('nmstate');
    expect(result).toContain('mtv');
    // cnv should only appear once in the result
    expect(result.filter((op) => op === 'cnv')).toHaveLength(1);
  });

  it('should only count operators that have valid specs', () => {
    const values: OperatorsValues = {
      selectedOperators: ['lvm', 'invalid-operator'], // invalid-operator not in opSpecs
      selectedBundles: [],
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(1);
    expect(result).toContain('lvm');
    expect(result).not.toContain('invalid-operator');
  });

  it('should handle multiple bundles correctly', () => {
    const values: OperatorsValues = {
      selectedOperators: ['lvm'],
      selectedBundles: ['virtualization', 'openshift-ai'], // Two bundles
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(7); // lvm + 3 from virtualization + 3 from openshift-ai
    expect(result).toContain('lvm');
    expect(result).toContain('cnv');
    expect(result).toContain('nmstate');
    expect(result).toContain('mtv');
    expect(result).toContain('nvidia-gpu');
    expect(result).toContain('authorino');
    expect(result).toContain('odf');
  });

  it('should handle overlapping operators in multiple bundles', () => {
    const values: OperatorsValues = {
      selectedOperators: [],
      selectedBundles: ['virtualization', 'openshift-ai'], // Both bundles have 'odf' (but only virtualization has it in our mock)
    };

    // Let's modify the virtualization bundle to include odf to test overlap
    const bundlesWithOverlap: Bundle[] = [
      {
        id: 'virtualization',
        title: 'Virtualization',
        description: 'Virtualization bundle',
        operators: ['cnv', 'nmstate', 'mtv', 'odf'], // Added odf
      },
      {
        id: 'openshift-ai',
        title: 'OpenShift AI',
        description: 'AI bundle',
        operators: ['nvidia-gpu', 'authorino', 'odf'], // odf is in both bundles
      },
    ];

    const result = calculateSelectedOperators(values, bundlesWithOverlap, mockOpSpecs);

    expect(result).toHaveLength(6); // cnv, nmstate, mtv, odf, nvidia-gpu, authorino (odf not double-counted)
    expect(result.filter((op) => op === 'odf')).toHaveLength(1); // odf should only appear once
  });

  it('should handle empty selections correctly', () => {
    const values: OperatorsValues = {
      selectedOperators: [],
      selectedBundles: [],
    };

    const result = calculateSelectedOperators(values, mockBundles, mockOpSpecs);

    expect(result).toHaveLength(0);
  });
});
