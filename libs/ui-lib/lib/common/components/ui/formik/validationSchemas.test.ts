import { test, describe, expect } from 'vitest';
import {
  baseDomainValidationSchema,
  dnsNameValidationSchema,
  hostPrefixValidationSchema,
  ipBlockValidationSchema,
  ipValidationSchema,
  macAddressValidationSchema,
  nameValidationSchema,
  noProxyValidationSchema,
  pullSecretValidationSchema,
} from './validationSchemas';
import { TFunction } from 'react-i18next';
import { CLUSTER_NAME_MAX_LENGTH } from './constants';

const t: TFunction = (t: string) => t;

describe('validationSchemas', () => {
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

  test('nameValidationSchema for clusters', async () => {
    const usedClusterNames = ['cluster-one', 'cluster-two'];
    const valid = [
      'cluster-one-foo',
      'cluster',
      'aa',
      'a9',
      '0a',
      'a'.repeat(CLUSTER_NAME_MAX_LENGTH),
    ];
    const invalid = [
      'cluster$',
      'cluster-',
      's',
      '-a',
      'x.y',
      'a@',
      'a%',
      'b'.repeat(CLUSTER_NAME_MAX_LENGTH + 1),
      ...usedClusterNames,
    ];

    const validationSchema = nameValidationSchema(t, usedClusterNames, '', true, false);

    await Promise.all(
      valid.map((value) =>
        validationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        validationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('pullSecretValidationSchema', async () => {
    const valid = ['', '{"auths": {}}'];
    const invalid = ['{}', '{"foo":"bar"}', '"auths":"{}"', '{"auths": "foo"}'];

    await Promise.all(
      valid.map((value) =>
        pullSecretValidationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        pullSecretValidationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('ipValidationSchema', async () => {
    const valid = [
      '1.1.1.1',
      '0.0.0.0',
      '255.255.255.255',
      '2345:0425:2CA1:0000:0000:0567:5673:23b5',
      '2345:0425:2CA1:0::0567:5673:23b5',
      '::',
    ];
    const invalid = [
      '',
      '1.1.1.1.',
      '1.1.1',
      '1.1.1.',
      '255.255.255.256',
      '1.1.1.a',
      '1.1.1.*',
      '2345:0425:2CA1:0:0:0567:5673:',
    ];

    await Promise.all(
      valid.map((value) =>
        ipValidationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        ipValidationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('macAddressValidationSchema', async () => {
    const valid = ['', '00:00:0A:BB:28:FC', '00:00:0A:BB:28:fc'];
    const invalid = [
      ':00:0A:BB:28:FC',
      '0:00:0A:BB:28:FC',
      '00:00:0A:BB:28:FG',
      '00:00:0A:BB:28:Fg',
      '00:00:0A:BB:28:',
      '00000ABB28FC',
      '00:00:0A:BB:28',
      '00:00:0A:BB:28 FC',
      '00:00:0A:BB:28-FC',
    ];

    await Promise.all(
      valid.map((value) =>
        macAddressValidationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        macAddressValidationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('ipBlockValidationSchema', async () => {
    const valid = ['192.1.1.0/24', '192.1.0.0/16', '193.0.0.0/8'];
    const invalid = [
      '',
      '192.168.1.0',
      '192.168.1.0/24',
      '192.1.1.0/16',
      '192.0.0.0/8' /* Overlap */,
    ];

    const validationSchema = ipBlockValidationSchema(['192.168.1.0']);
    await Promise.all(
      valid.map((value) =>
        validationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        validationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('dnsNameValidationSchema', async () => {
    const valid = ['', 'aa.com', 'aa.com.com.com.com', 'aa.com.' + 'b'.repeat(63)];
    const invalid = [
      '00:00:0A:BB:28:FC',
      '192.1.1.1',
      '.aa.com',
      'aa.com.',
      'a',
      'aa',
      'aa,com',
      'aa.com.' + 'b'.repeat(63 + 1),
      'aa.com/bb',
    ];

    await Promise.all(
      valid.map((value) =>
        dnsNameValidationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        dnsNameValidationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('hostPrefixValidationSchema for IPv4', async () => {
    const valid = [16, 25];
    const invalid = ['', 'a', 0, 1, 33, 15, 26];

    const validationSchema = hostPrefixValidationSchema('192.168.0.0/16');
    await Promise.all(
      valid.map((value) =>
        validationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        validationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('hostPrefixValidationSchema for IPv6', async () => {
    const valid = [8, 32, 128];
    const invalid = ['', 'a', 0, 1, 7, 129];

    const validationSchema = hostPrefixValidationSchema('2002::1234:abcd:ffff:c0a8:101/64');
    await Promise.all(
      valid.map((value) =>
        validationSchema
          .validate(value)
          .catch((msg: string) => expect(value).toBe(`was rejected but is valid: ${msg}`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        validationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });

  test('baseDomainNameValidationSchema', async () => {
    const valid = [
      'a.com',
      'co',
      '1c',
      '1-c',
      '1--c',
      'aaa',
      'abc.def',
      'a-aa.com',
      'a--aa.com',
      'aa.com.com.com.com',
      'red.cat--rahul.com',
    ];
    const invalid = [
      'a',
      '-',
      'a-',
      '-aaa.com.',
      'aaa-.com',
      'a.c',
      'aaa.c',
      'DNSnamescancontainonlyalphabeticalcharactersa-znumericcharacters0-9theminussign-andtheperiod',
      'DNSnamescancontainonlyalphabeticalcharactersa-znumericcharacters0-9theminussign-andtheperiod.com',
    ];

    await Promise.all(
      valid.map((value) =>
        baseDomainValidationSchema
          .validate(value)
          .catch(() => expect(value).toBe(`was rejected but is valid`)),
      ),
    );

    let counter = 0;
    await Promise.all(
      invalid.map((value) =>
        baseDomainValidationSchema.validate(value).then(
          () => expect(value).toBe('should be rejected since it is invalid'),
          () => counter++,
        ),
      ),
    );

    expect(counter).toBe(invalid.length);
  });
});
