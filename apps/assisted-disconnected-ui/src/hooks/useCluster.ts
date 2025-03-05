import * as React from 'react';
import { ClustersAPI } from '@openshift-assisted/ui-lib/common';

export const useCluster = (): [string | undefined, boolean, boolean] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [clusterId, setClusterId] = React.useState<string>();
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const fetchAsync = async () => {
      try {
        const result = await ClustersAPI.list();
        if (result.data.length) {
          setClusterId(result.data[0].id);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAsync();
  }, []);

  return [clusterId, isLoading, error];
};
