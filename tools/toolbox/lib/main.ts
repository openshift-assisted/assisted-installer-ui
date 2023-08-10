#!/usr/bin/env node
import { argv } from 'zx';
import { ChokidarWatchOptions } from './@types/chokidar-type-aliases';
import { changedTool, watchTool } from './tools.js';
import { EC_MISSING_TOOL } from './constants.js';
import { error } from './logger.js';

async function main() {
  const cmd = argv._[0] as string | undefined;
  switch (cmd) {
    case 'watch': {
      const ignored = argv.ignore as ChokidarWatchOptions['ignored'];
      const jobs = argv._.slice(1);
      const sourcesDir = argv.dir as string | readonly string[];
      watchTool({
        ignored,
        jobs,
        sourcesDir,
      });
      break;
    }
    case 'changed': {
      const cmd = argv._.slice(1)[0] ?? 'echo';
      const dir = (argv.dir as string) ?? '.';
      const verbose = Boolean(argv.verbose);
      const excludePattern = (argv.excludePattern as string) ?? '';
      let commit = 'HEAD';
      if (argv.commit) {
        commit = argv.commit as string;
      } else if (process.env.CI && process.env.TOOLBOX_COMMIT) {
        commit = process.env.TOOLBOX_COMMIT;
      }

      await changedTool({ dir, verbose, excludePattern, commit, cmd });
      break;
    }
    default: {
      if (!cmd) {
        error('Tool name is missing');
      } else {
        error(`No tool called ${cmd} in this toolbox yet.`);
      }
      process.exit(EC_MISSING_TOOL);
    }
  }
}

void main();
