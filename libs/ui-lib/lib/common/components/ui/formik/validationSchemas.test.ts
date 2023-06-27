import { test } from 'vitest';
import { noProxyValidationSchema } from './validationSchemas';

test('noProxyValidationSchema runs', async () => {
  await noProxyValidationSchema.validate('.y.com');
});
