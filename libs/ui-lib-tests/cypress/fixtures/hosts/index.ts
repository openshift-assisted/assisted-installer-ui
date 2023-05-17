import { hasWizardSignal } from '../../support/utils';
import { hostDiscover } from './host-discover';
import { hostRename } from './host-rename';
import { hostReady } from './host-ready';

const hostIds = [
  '1e40aa5d-0b69-4122-a562-bff1e35e7071',
  '2e40aa5d-0b69-4122-a562-bff1e35e7072',
  '3e40aa5d-0b69-4122-a562-bff1e35e7073',
  '4e40aa5d-0b69-4122-a562-bff1e35e7074',
  '5e40aa5d-0b69-4122-a562-bff1e35e7075',
];

const hostIPs = ['192.168.122.0/24', 'IP2', 'IP3', 'IP4', 'IP5'];

const discoveredHosts = Array(5)
  .fill(null)
  .map((_value, index) => hostDiscover(index));

const getDiscoveredHostsCount = () => {
  const signals = ['HOST_DISCOVERED_1', 'HOST_DISCOVERED_2', 'HOST_DISCOVERED_3'];
  const firstUndiscoveredIndex = signals.findIndex((signal) => !hasWizardSignal(signal));
  if (firstUndiscoveredIndex === -1) {
    return 3;
  }
  return firstUndiscoveredIndex;
};

const getRenamedHost = (hostIndex: number) => {
  return hostRename(discoveredHosts[hostIndex], `${Cypress.env('HOST_RENAME')}-${hostIndex + 1}`);
};

const getUpdatedHosts = () => {
  const discoveredHostsCount = getDiscoveredHostsCount();
  if (discoveredHostsCount === 0) {
    return [];
  }

  const lastSignal: string = Cypress.env('AI_LAST_SIGNAL');

  let transformer: (index: number) => Record<string, unknown>;
  if (/HOST_DISCOVERED_\d/.test(lastSignal)) {
    transformer = (index) => discoveredHosts[index];
  } else if (hasWizardSignal('READY_TO_INSTALL')) {
    transformer = (index) => hostReady(getRenamedHost(index));
  } else {
    transformer = getRenamedHost;
  }

  return new Array(discoveredHostsCount).fill(0).map((_, index) => {
    const updates = {};
    return {
      ...transformer(index),
      bootstrap: index === 0,
      ...updates,
    };
  });
};

export { hostIds, hostIPs, getUpdatedHosts };
