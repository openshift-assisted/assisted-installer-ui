import React from 'react';
import { alertsSlice } from '../../common/reducers';
import { Cluster, ListManifests, Manifest } from '../../common/api/types';
import { ClustersAPI } from '../services/apis';
import { getApiErrorMessage, handleApiError } from '../api';
import { getErrorMessage } from '../../common/utils';
import { ListManifestsExtended } from '../components/clusterConfiguration/manifestsConfiguration/data/dataTypes';

const { addAlert } = alertsSlice.actions;

export const convertBlobToString = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(blob, 'UTF-8');
    reader.onload = (readerEvent) => {
      const content = readerEvent.target?.result;
      resolve(content as string);
    };
  });
};

const getManifestsInfo = async (customManifests: ListManifests, clusterId: string) => {
  const manifestsExtended: ListManifestsExtended = [];
  for (const manifest of customManifests) {
    try {
      const { data: yamlContent } = await ClustersAPI.getManifestContent(
        clusterId,
        manifest.folder || 'manifests',
        manifest.fileName || '',
      );
      const yamlString = await convertBlobToString(yamlContent);
      manifestsExtended.push({
        folder: manifest.folder || 'manifests',
        fileName: manifest.fileName || '',
        yamlContent: yamlString,
      });
    } catch (e) {
      manifestsExtended.push({
        folder: manifest.folder || 'manifests',
        fileName: manifest.fileName || '',
        yamlContent: '',
      });
    }
  }
  return manifestsExtended;
};

const useClusterCustomManifests = (
  clusterId: Cluster['id'],
  extendedVersion: boolean,
  refresh = true,
) => {
  const [customManifests, setCustomManifests] = React.useState<ListManifestsExtended>();
  const [error, setError] = React.useState('');
  const [extendedManifestsLoaded, setExtendedManifestsLoaded] = React.useState<boolean>(false);

  const fetchCustomManifests = React.useCallback(async () => {
    try {
      if (clusterId !== '') {
        const { data } = await ClustersAPI.getManifests(clusterId);
        if (extendedVersion) {
          await getManifestsInfo(data, clusterId).then((manifests) => {
            setCustomManifests(manifests);
            setExtendedManifestsLoaded(true);
          });
        } else {
          const manifestsExtended = data.map((manifest: Manifest) => ({
            folder: manifest.folder || 'manifests',
            fileName: manifest.fileName || '',
            yamlContent: '',
          }));
          setCustomManifests(manifestsExtended);
        }
      }
    } catch (e) {
      setError(getErrorMessage(e));
      // report error systematically at one place show defaults instead
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to retrieve cluster custom manifests',
          message: getApiErrorMessage(e),
        }),
      );
    }
  }, [clusterId, extendedVersion]);

  React.useEffect(() => {
    if (refresh) {
      void fetchCustomManifests();
    }
  }, [fetchCustomManifests, refresh]);

  return {
    customManifests,
    error,
    isLoading: !error && !customManifests && (extendedVersion ? !extendedManifestsLoaded : true),
  };
};

export default useClusterCustomManifests;
