import { test, expect } from 'vitest';
import { noProxyValidationSchema } from './validationSchemas';

test('noProxyValidationSchema accepts input', async () => {
  const valid = [
    '.x.com',
    '.x.com,.y.org, .z.net   , u.foo.bar',
    '.svc',
    'localhost',
    '9999',
    '.9999',
    'kraken',
    'a-x.com',
    '.x.com,',
  ];

  await Promise.all(
    valid.map((value) =>
      noProxyValidationSchema
        .validate(value)
        .catch(() => expect(value).toBe('was rejected but is valid')),
    ),
  );
});

test('noProxyValidationSchema rejects input', async () => {
  const invalid = ['.x.com.', '.x.com,.y.org., .z.net', '-x.com'];

  let counter = 0;
  await Promise.all(
    invalid.map((value) =>
      noProxyValidationSchema.validate(value).then(
        () => expect(value).toBe('should be rejected since it is invalid'),
        () => counter++,
      ),
    ),
  );

  expect(counter).toBe(invalid.length);
});
