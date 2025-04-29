import React from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonVariant, Divider, Flex, FlexItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArrayRenderProps, useField } from 'formik';
import cloneDeep from 'lodash-es/cloneDeep.js';
import { LoadingState, useAlerts } from '../../../../../common';
import ConfirmationModal from '../../../../../common/components/ui/ConfirmationModal';
import { ClustersAPI } from '../../../../services/apis';
import { getApiErrorMessage, handleApiError } from '../../../../../common/api';
import { CustomManifest } from './CustomManifest';
import { getEmptyManifest, getManifestName } from './utils';
import { CustomManifestValues } from '../data/dataTypes';
import { selectCurrentClusterPermissionsState } from '../../../../store/slices/current-cluster/selectors';
import { AgentClusterInstallK8sResource } from '../../../../../cim';

const fieldName = 'manifests';

type CustomManifestsArrayProps = {
  clusterId: string;
  yamlOnly?: boolean;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  onRemoveManifest?: (manifestId: number) => Promise<void>;
} & FieldArrayRenderProps;
type ExpandedManifests = { [manifestIdx: number]: boolean };

const getExpandedManifestsInitialValue = (numManifests: number): ExpandedManifests => {
  const ret: Record<number, boolean> = {};
  for (let i = 0; i < numManifests; ++i) {
    ret[i] = false;
  }
  return ret;
};

const getExpandedManifestsDefaultValue = (numManifests: number): ExpandedManifests => {
  const ret = getExpandedManifestsInitialValue(numManifests);
  if (numManifests === 1) {
    ret[0] = true;
  }
  return ret;
};

export const CustomManifestsArray = ({
  push,
  remove,
  clusterId,
  onRemoveManifest,
  ...props
}: CustomManifestsArrayProps) => {
  const [{ value }, { error }] = useField<CustomManifestValues[]>({
    name: fieldName,
  });
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const [expandedManifests, setExpandedManifests] = React.useState<ExpandedManifests>(
    getExpandedManifestsDefaultValue(value.length),
  );
  const [manifestIdxToRemove, setManifestIdxToRemove] = React.useState<number | null>(null);
  const { addAlert } = useAlerts();

  const onAddManifest = React.useCallback(() => {
    const newExpandedManifests = getExpandedManifestsInitialValue(value.length + 1);
    newExpandedManifests[value.length] = true;
    setExpandedManifests(newExpandedManifests);
    push(getEmptyManifest());
  }, [value.length, push]);

  const removeManifest = React.useCallback(
    async (manifestIdx: number) => {
      if (onRemoveManifest) {
        return onRemoveManifest(manifestIdx);
      }
      const manifestToRemove = value[manifestIdx];
      if ((manifestToRemove['folder'] as string) !== '' && manifestToRemove['filename'] !== '') {
        try {
          await ClustersAPI.removeCustomManifest(
            clusterId,
            manifestToRemove['folder'] as string,
            manifestToRemove['filename'],
          );
          remove(manifestIdx);
        } catch (e) {
          handleApiError(e, () =>
            addAlert({
              title: 'Manifest could not be deleted',
              message: getApiErrorMessage(e),
            }),
          );
        }
      }
    },
    [onRemoveManifest, value, clusterId, remove, addAlert],
  );

  const onConfirm = React.useCallback(async (): Promise<void> => {
    if (manifestIdxToRemove !== null) {
      await removeManifest(manifestIdxToRemove);
      setManifestIdxToRemove(null);
    }
  }, [manifestIdxToRemove, removeManifest]);

  if (value === undefined) {
    return <LoadingState />;
  }

  return (
    <>
      {value.map((_data, manifestIdx) => {
        const onToggleExpand = (isExpanded: boolean) => {
          const newExpandedManifests = cloneDeep(expandedManifests);
          newExpandedManifests[manifestIdx] = isExpanded;
          setExpandedManifests(newExpandedManifests);
        };
        return (
          <React.Fragment key={manifestIdx}>
            <CustomManifest
              manifestIdx={manifestIdx}
              onToggleExpand={onToggleExpand}
              isExpanded={expandedManifests[manifestIdx]}
              isDisabled={isViewerMode}
              onRemove={() => setManifestIdxToRemove(manifestIdx)}
              fieldName={fieldName}
              enableRemoveManifest={value.length > 1}
              {...props}
            />

            <Divider />
          </React.Fragment>
        );
      })}

      {
        <Flex>
          <FlexItem>
            <Button
              icon={<PlusCircleIcon />}
              variant="link"
              isInline
              onClick={onAddManifest}
              data-testid="add-manifest"
              isDisabled={!!error}
            >
              Add another manifest
            </Button>
          </FlexItem>
        </Flex>
      }

      {manifestIdxToRemove !== null && (
        <ConfirmationModal
          title={`Delete ${getManifestName(manifestIdxToRemove)}?`}
          titleIconVariant="warning"
          confirmationButtonText="Delete"
          confirmationButtonVariant={ButtonVariant.danger}
          content={
            <>
              <p>{`All the data entered for ${getManifestName(
                manifestIdxToRemove,
              )} will be lost`}</p>
            </>
          }
          onClose={() => setManifestIdxToRemove(null)}
          onConfirm={() => void onConfirm()}
        />
      )}
    </>
  );
};
