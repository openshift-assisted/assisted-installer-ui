import React from 'react';
import { Button, ButtonVariant, Divider, Flex, FlexItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { FieldArrayRenderProps, useField } from 'formik';
import cloneDeep from 'lodash-es/cloneDeep.js';
import { AgentClusterInstallK8sResource } from '../../../cim';
import { LoadingState, ConfirmationModal } from '../ui';
import { CustomManifest } from './CustomManifest';
import { CustomManifestValues } from './types';
import { getEmptyManifest, getManifestName } from './utils';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const fieldName = 'manifests';

type CustomManifestsArrayProps = {
  yamlOnly?: boolean;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  onRemoveManifest?: (manifestId: number) => Promise<void>;
  isViewerMode?: boolean;
  isLoading?: boolean;
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
  onRemoveManifest,
  isViewerMode,
  isLoading,
  ...props
}: CustomManifestsArrayProps) => {
  const { t } = useTranslation();

  const [{ value }, { error }] = useField<CustomManifestValues[]>({
    name: fieldName,
  });
  const [expandedManifests, setExpandedManifests] = React.useState<ExpandedManifests>(
    getExpandedManifestsDefaultValue(value.length),
  );
  const [manifestIdxToRemove, setManifestIdxToRemove] = React.useState<number | null>(null);

  const onAddManifest = React.useCallback(() => {
    const newExpandedManifests = getExpandedManifestsInitialValue(value.length + 1);
    newExpandedManifests[value.length] = true;
    setExpandedManifests(newExpandedManifests);
    push(getEmptyManifest());
  }, [value.length, push]);

  const onConfirm = React.useCallback(async (): Promise<void> => {
    if (manifestIdxToRemove !== null) {
      onRemoveManifest && (await onRemoveManifest(manifestIdxToRemove));
      remove(manifestIdxToRemove);
      setManifestIdxToRemove(null);
    }
  }, [manifestIdxToRemove, onRemoveManifest, remove]);

  if (isLoading) {
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
              isDisabled={!!isViewerMode}
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
              {t('ai:Add another manifest')}
            </Button>
          </FlexItem>
        </Flex>
      }

      {manifestIdxToRemove !== null && (
        <ConfirmationModal
          title={t('ai:Delete {{name}}?', { name: getManifestName(manifestIdxToRemove, t) })}
          titleIconVariant="warning"
          confirmationButtonText={t('ai:Delete')}
          confirmationButtonVariant={ButtonVariant.danger}
          content={
            <>
              <p>
                {t('ai:All the data entered for {{name}} will be lost', {
                  name: getManifestName(manifestIdxToRemove, t),
                })}
              </p>
            </>
          }
          onClose={() => setManifestIdxToRemove(null)}
          onConfirm={() => void onConfirm()}
        />
      )}
    </>
  );
};
