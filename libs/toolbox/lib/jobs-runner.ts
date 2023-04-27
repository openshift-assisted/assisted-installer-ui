import { $ } from 'zx';
import type Runnable from './@types/runnable';

export default class JobsRunner implements Runnable {
  private _done: boolean;
  private readonly _jobs: string[];

  constructor(jobs: string[]) {
    this._done = true;
    this._jobs = jobs;
  }

  get isDone() {
    return this._done;
  }

  async run() {
    try {
      this._done = false;
      for await (const job of this._jobs) {
        await $`${job.split(' ')}`;
      }
    } finally {
      this._done = true;
    }
  }
}
