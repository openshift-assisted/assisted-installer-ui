import type {
  WatchOptions as ChokidarWatchOptions,
  FSWatcher as ChokidarFSWatcher,
} from 'chokidar';

type ChokidarAllEventsListener = (
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
  path: string,
  stats?: import('node:fs').Stats,
) => void;

export { ChokidarAllEventsListener, ChokidarFSWatcher, ChokidarWatchOptions };
