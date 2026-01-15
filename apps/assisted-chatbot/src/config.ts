const envs: { [key: string]: string } = {
  integration: 'https://api.integration.openshift.com',
  staging: 'https://api.stage.openshift.com',
  production: 'https://api.openshift.com',
};

const ENV_OVERRIDE_LOCALSTORAGE_KEY = 'ocmOverridenEnvironment';

const parseEnvQueryParam = (): string | undefined => {
  const queryParams = new URLSearchParams(window.location.search);
  const envVal = queryParams.get('env');
  return envVal && envs[envVal] ? envVal : undefined;
};

export const getBaseUrl = (): string => {
  let envOverrideStorageItem: string | null = null;
  try {
    envOverrideStorageItem = localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('failed to get override item', e);
  }
  const queryEnv = parseEnvQueryParam() || envOverrideStorageItem;
  if (queryEnv && envs[queryEnv]) {
    try {
      localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, queryEnv);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('failed to store override item', e);
    }
    return envs[queryEnv];
  }
  const defaultEnv =
    window.location.host.includes('dev') || window.location.host.includes('foo')
      ? 'staging'
      : 'production';
  return envs[defaultEnv];
};
