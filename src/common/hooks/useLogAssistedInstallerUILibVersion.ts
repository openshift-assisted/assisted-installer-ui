import { useEffect } from 'react';
import { getAssistedUiLibVersion } from '../config/constants';

const version = getAssistedUiLibVersion();

export default function useAssistedInstallerUILibVersion() {
  useEffect(() => {
    console.log(`openshift-assisted-ui-lib v${version}`);
  }, []);

  return version;
}
