import { chalk } from 'zx';

export const info = (...args: unknown[]) => console.log(chalk.cyan(...args));
export const warn = (...args: unknown[]) => console.log(chalk.yellow(...args));
export const error = (...args: unknown[]) => console.log(chalk.redBright(...args));
