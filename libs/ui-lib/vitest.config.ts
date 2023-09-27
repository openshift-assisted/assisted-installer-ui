import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { mainFields: ['module', 'jsnext:main', 'jsnext'] },
  test: {
    environment: 'happy-dom',
    server: {
      deps: {
        inline: [/@patternfly/],
      },
    },
  },
});
