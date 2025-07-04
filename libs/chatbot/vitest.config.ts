import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  resolve: { mainFields: ['module', 'jsnext:main', 'jsnext'] },
  test: {
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, './lib/_test-helpers/vitest-setup.ts')],
    server: {
      deps: {
        inline: [/@patternfly/],
      },
    },
  },
});
