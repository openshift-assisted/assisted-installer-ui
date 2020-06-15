import { Host } from '../../api/types';

export const canEditRole = (status: Host['status']) =>
  ['discovering', 'known', 'disconnected', 'disabled', 'insufficient'].includes(status);
