/* eslint-disable @typescript-eslint/naming-convention */

export const tangServerValues = {
  Url: 'http://redhat.com',
  Thumbprint: 'WOjQYkyK7DxY_T5pMncMO5w0f6E',
};

export const diskEncryptionValues = {
  mode: 'tang',
  enable_on: 'masters',
  tang_servers: '[{"url":"http://redhat.com","thumbprint":"WOjQYkyK7DxY_T5pMncMO5w0f6E"}]',
};
