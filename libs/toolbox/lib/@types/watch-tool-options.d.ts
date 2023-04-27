import { ChokidarWatchOptions } from './chokidar-type-aliases';

export default interface WatchToolOptions {
  ignored: ChokidarWatchOptions['ignored'];
  jobs: string[];
  sourcesDir: string | readonly string[];
}
