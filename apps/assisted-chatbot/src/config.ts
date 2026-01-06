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
  const queryEnv =
    parseEnvQueryParam() || localStorage.getItem(ENV_OVERRIDE_LOCALSTORAGE_KEY);
  if (queryEnv && envs[queryEnv]) {
    localStorage.setItem(ENV_OVERRIDE_LOCALSTORAGE_KEY, queryEnv);
    return envs[queryEnv];
  }
  const defaultEnv =
    window.location.host.includes('dev') || window.location.host.includes('foo')
      ? 'staging'
      : 'production';
  return envs[defaultEnv];
};
