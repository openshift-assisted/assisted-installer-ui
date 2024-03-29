export interface StateSliceMeta {
  /** @default idle */
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  /** @default null */
  updatedAt?: string | null;
  /** @default null */
  currentRequestId?: string | null;
}

export interface StateSlice<D = unknown, E = unknown> {
  data: D;
  error: E;
}
export interface StateSliceWithMeta<D = unknown, E = unknown> extends StateSlice<D, E> {
  meta: StateSliceMeta;
}
