import { $, echo, path, ProcessOutput, retry } from 'zx';
import chokidar from 'chokidar';
import JobsRunner from './jobs-runner.js';
import { info, warn, error } from './logger.js';
import {
  EC_NORMAL,
  EC_UNKNOWN,
  MAX_RETRIES_BEFORE_ABORT,
  DELAY_BETWEEN_EXIT_ATTEMPTS,
  WAIT_MS,
} from './constants.js';
import type WatchToolOptions from './@types/watch-tool-options';
import type ChangedToolOptions from './@types/changed-tool-options';
import type Runnable from './@types/runnable.js';
import type {
  ChokidarAllEventsListener,
  ChokidarFSWatcher,
} from './@types/chokidar-type-aliases.js';
import debounce from 'lodash-es/debounce.js';

export function watchTool(options: WatchToolOptions) {
  const { ignored, jobs, sourcesDir } = options;
  const watcher = chokidar.watch(sourcesDir, {
    ignored,
    persistent: true,
    awaitWriteFinish: true,
  });

  if (sourcesDir instanceof Array) {
    info(
      'Watching files in',
      sourcesDir.map((dir) => path.resolve(dir)),
    );
  } else {
    info('Watching files in', path.resolve(sourcesDir));
  }

  const job = new JobsRunner(jobs);
  process.on('SIGINT', (job: Runnable, watcher: ChokidarFSWatcher) => {
    return (signal: string) => {
      void watcher.close().then(async () => {
        warn(`\n${signal} received. Stop watching files...`);
        if (job.isDone) {
          process.exit(EC_NORMAL);
        } else {
          warn('Waiting for the last job to finish...');
          try {
            await retry(MAX_RETRIES_BEFORE_ABORT, DELAY_BETWEEN_EXIT_ATTEMPTS, () => job.isDone);
            process.exit(EC_NORMAL);
          } catch {
            process.abort();
          }
        }
      });
    };
  });

  const handleChangeDebounced = (job: Runnable) =>
    debounce<ChokidarAllEventsListener>(
      () => {
        if (job.isDone) {
          job.run().catch((po: ProcessOutput) => {
            if (!po.exitCode) return;
            warn(`The last job failed with exit code: ${po.exitCode}. Check its output above.`);
          });
        }
      },
      WAIT_MS,
      { trailing: true },
    );
  watcher.on('all', handleChangeDebounced(job));
}

export async function changedTool(options: ChangedToolOptions) {
  const { commit, dir, verbose, excludePattern, cmd } = options;
  $.verbose = verbose;
  const result =
    await $`git --no-pager diff --name-only --relative --diff-filter=d ${commit} -- ${dir}`;
  let changedFiles = result.toString().trim().split('\n').filter(Boolean);
  if (excludePattern.length > 0) {
    changedFiles = changedFiles.filter((fileName) => !new RegExp(excludePattern).test(fileName));
  }

  if (changedFiles.length > 0) {
    if (cmd === 'echo') {
      echo(changedFiles.join('\n'));
    } else {
      try {
        await $`${cmd.split(' ')} ${changedFiles}`;
      } catch (e) {
        const err = e as ProcessOutput;
        info(err.stdout.toString());
        error(err.stderr.toString());
        process.exit(err.exitCode ?? EC_UNKNOWN);
      }
    }
  }
  $.verbose = true;
}
