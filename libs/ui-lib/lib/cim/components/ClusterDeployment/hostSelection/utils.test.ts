import { describe, expect, test, vi } from 'vitest';

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({}));

import { ProvisionRequirements, provisionRequirementsSatisfied } from './utils';
import { AgentRoleCounts } from '../types';

const makeCounts = (overrides: Partial<AgentRoleCounts>): AgentRoleCounts => ({
  master: 0,
  arbiter: 0,
  worker: 0,
  autoAssign: 0,
  ...overrides,
});

describe('provisionRequirementsSatisfied', () => {
  describe('normal cluster (3 control-plane, 0 arbiter)', () => {
    const requirements: ProvisionRequirements = { controlPlaneAgents: 3 };

    test('3 auto-assign hosts are enough', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 3 }), requirements)).toBe(
        true,
      );
    });

    test('2 auto-assign hosts are not enough', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 2 }), requirements)).toBe(
        false,
      );
    });

    test('1 explicit master + 2 auto-assign is enough', () => {
      expect(
        provisionRequirementsSatisfied(makeCounts({ master: 1, autoAssign: 2 }), requirements),
      ).toBe(true);
    });

    test('4 explicit masters is over-pinned', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ master: 4 }), requirements)).toBe(false);
    });

    test('extra auto-assign hosts beyond the minimum are allowed', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 5 }), requirements)).toBe(
        true,
      );
    });
  });

  describe('TNA cluster (2 control-plane, 1 arbiter)', () => {
    const requirements: ProvisionRequirements = { controlPlaneAgents: 2, arbiterAgents: 1 };

    test('3 auto-assign hosts are enough', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 3 }), requirements)).toBe(
        true,
      );
    });

    test('an explicit worker does not count as flexible capacity', () => {
      expect(
        provisionRequirementsSatisfied(makeCounts({ autoAssign: 2, worker: 1 }), requirements),
      ).toBe(false);
    });

    test('1 explicit arbiter + 2 auto-assign is enough', () => {
      expect(
        provisionRequirementsSatisfied(makeCounts({ arbiter: 1, autoAssign: 2 }), requirements),
      ).toBe(true);
    });

    test('2 explicit arbiters is over-pinned', () => {
      expect(
        provisionRequirementsSatisfied(makeCounts({ arbiter: 2, autoAssign: 1 }), requirements),
      ).toBe(false);
    });
  });

  describe('SNO cluster (1 control-plane, 0 arbiter)', () => {
    const requirements: ProvisionRequirements = { controlPlaneAgents: 1 };

    test('exactly 1 auto-assign host is enough', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 1 }), requirements)).toBe(
        true,
      );
    });

    test('2 auto-assign hosts exceed the exact cap', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ autoAssign: 2 }), requirements)).toBe(
        false,
      );
    });

    test('1 explicit master is enough', () => {
      expect(provisionRequirementsSatisfied(makeCounts({ master: 1 }), requirements)).toBe(true);
    });
  });
});
