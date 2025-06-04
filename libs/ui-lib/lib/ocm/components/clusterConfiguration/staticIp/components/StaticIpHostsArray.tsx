import React from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Divider,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Grid,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { FieldArray, FieldArrayRenderProps, useField } from 'formik';
import cloneDeep from 'lodash-es/cloneDeep.js';
import { getFormikArrayItemFieldName, LoadingState } from '../../../../../common';
import ConfirmationModal from '../../../../../common/components/ui/ConfirmationModal';
import { HostStaticNetworkConfig } from '@openshift-assisted/types/assisted-installer-service';
import {
  selectCurrentClusterPermissionsState,
  selectIsCurrentClusterSNO,
} from '../../../../store/slices/current-cluster/selectors';

const fieldName = 'hosts';

export type HostComponentProps = {
  fieldName: string;
  hostIdx: number;
  isDisabled: boolean;
};

export type HostArrayProps<HostFieldType> = {
  emptyHostData: HostFieldType;
  enableCopyAboveConfiguration?: boolean;
  CollapsedHostComponent: React.FC<HostComponentProps>;
  ExpandedHostComponent: React.FC<HostComponentProps>;
};

type HostsProps<HostFieldType> = HostArrayProps<HostFieldType> & FieldArrayRenderProps;

type SingleHostProps<HostFieldType> = {
  hostIdx: number;
  onRemove: () => void;
  onToggleExpand: (isExpanded: boolean) => void;
  isExpanded: boolean;
  isDisabled: boolean;
  emptyHostData: HostFieldType;
  CollapsedHostComponent: React.FC<HostComponentProps>;
  ExpandedHostComponent: React.FC<HostComponentProps>;
  fieldName: string;
  enableRemoveHost: boolean;
};

export const RemoveItemButton: React.FC<{
  onRemove: () => void;
  showRemoveButton: boolean;
  dataTestId: string;
}> = ({ onRemove, showRemoveButton, dataTestId }) => (
  //use css visibility instead of conditional rendering to avoid button jumping when hovering
  <Button icon={<MinusCircleIcon onClick={onRemove} data-testid={dataTestId} />}
    aria-label="remove host"
    style={{ visibility: showRemoveButton ? 'visible' : 'hidden' }}
    variant="plain"
   />
);

const getHostName = (hostIdx: number) => `Host ${hostIdx + 1}`;

const SingleHost = <HostFieldType,>({
  fieldName,
  hostIdx,
  onRemove,
  onToggleExpand,
  isExpanded,
  isDisabled,
  CollapsedHostComponent,
  ExpandedHostComponent,
  enableRemoveHost,
}: SingleHostProps<HostFieldType>) => {
  //TODO: fix RemovableField reusable component to support this use case
  const [showRemoveButton, setShowRemoveButton] = React.useState(false);
  const updateShowRemoveButton = (value: boolean) => {
    if (isDisabled) {
      return;
    }
    if (!enableRemoveHost) {
      setShowRemoveButton(false);
    } else {
      setShowRemoveButton(value);
    }
  };
  const hostFieldName = getFormikArrayItemFieldName(fieldName, hostIdx);
  return (
    <Grid
      onMouseEnter={() => updateShowRemoveButton(true)}
      onMouseLeave={() => updateShowRemoveButton(false)}
      hasGutter
    >
      <Flex>
        <FlexItem>
          <ExpandableSectionToggle
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            direction="down"
            data-testid={`toggle-host-${hostIdx}`}
          >
            {getHostName(hostIdx)}
          </ExpandableSectionToggle>
        </FlexItem>
        {!isDisabled && enableRemoveHost && (
          <FlexItem align={{ default: 'alignRight' }}>
            <RemoveItemButton
              onRemove={onRemove}
              showRemoveButton={showRemoveButton}
              dataTestId={`remove-host-${hostIdx}`}
            />
          </FlexItem>
        )}
      </Flex>

      {isExpanded ? (
        <ExpandableSection isDetached key={hostIdx} isExpanded>
          <ExpandedHostComponent
            fieldName={hostFieldName}
            hostIdx={hostIdx}
            isDisabled={isDisabled}
          />
        </ExpandableSection>
      ) : (
        <CollapsedHostComponent
          fieldName={hostFieldName}
          hostIdx={hostIdx}
          isDisabled={isDisabled}
        />
      )}
    </Grid>
  );
};

type ExpandedHosts = { [hostIdx: number]: boolean };

const getExpandedHostsInitialValue = (numHosts: number): ExpandedHosts => {
  const ret: Record<number, boolean> = {};
  for (let i = 0; i < numHosts; ++i) {
    ret[i] = false;
  }
  return ret;
};

const getExpandedHostsDefaultValue = (numHosts: number): ExpandedHosts => {
  const ret = getExpandedHostsInitialValue(numHosts);
  if (numHosts === 1) {
    ret[0] = true;
  }
  return ret;
};

const Hosts = <HostFieldType,>({
  push,
  remove,
  enableCopyAboveConfiguration = false,
  emptyHostData,
  ...props
}: HostsProps<HostFieldType>) => {
  const [field, { error }] = useField<HostFieldType[]>({
    name: fieldName,
  });
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const canAddHosts = !useSelector(selectIsCurrentClusterSNO) && !isViewerMode;
  const [expandedHosts, setExpandedHosts] = React.useState<ExpandedHosts>(
    getExpandedHostsDefaultValue(field.value.length),
  );
  const [copyConfiguration, setCopyConfiguration] = React.useState<boolean>(
    enableCopyAboveConfiguration,
  );
  const [hostIdxToRemove, setHostIdxToRemove] = React.useState<number | null>(null);

  if (field.value === undefined) {
    return <LoadingState />;
  }

  const onAddHost = () => {
    const newHostData = cloneDeep(emptyHostData);
    if (copyConfiguration) {
      (newHostData as HostStaticNetworkConfig).networkYaml = cloneDeep(
        (field.value[field.value.length - 1] as HostStaticNetworkConfig).networkYaml,
      );
    }
    const newExpandedHosts = getExpandedHostsInitialValue(field.value.length + 1);
    newExpandedHosts[field.value.length] = true;
    setExpandedHosts(newExpandedHosts);
    push(newHostData);
  };

  return (
    <>
      {field.value.map((_data, hostIdx) => {
        const onToggleExpand = (isExpanded: boolean) => {
          const newExpandedHosts = cloneDeep(expandedHosts);
          newExpandedHosts[hostIdx] = isExpanded;
          setExpandedHosts(newExpandedHosts);
        };
        return (
          <React.Fragment key={hostIdx}>
            <SingleHost
              hostIdx={hostIdx}
              onToggleExpand={onToggleExpand}
              isExpanded={expandedHosts[hostIdx]}
              isDisabled={isViewerMode}
              onRemove={() => setHostIdxToRemove(hostIdx)}
              fieldName={fieldName}
              emptyHostData={emptyHostData}
              enableRemoveHost={field.value.length > 1}
              {...props}
            />

            <Divider />
          </React.Fragment>
        );
      })}

      {canAddHosts && (
        <Flex>
          <FlexItem>
            <Button
              variant="secondary"
              onClick={onAddHost}
              data-testid="add-host"
              isDisabled={!!error}
            >
              Add another host configuration
            </Button>
          </FlexItem>
          {enableCopyAboveConfiguration && (
            <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
              <Checkbox
                label="Copy the YAML content"
                isChecked={copyConfiguration}
                onChange={(_event, val) => setCopyConfiguration(val)}
                aria-label="copy host configuration"
                name="copy-host-configuration"
                id="copy-host-configuration"
                data-testid="copy-host-configuration"
              />
            </FlexItem>
          )}
        </Flex>
      )}

      {hostIdxToRemove !== null && (
        <ConfirmationModal
          title={`Delete ${getHostName(hostIdxToRemove)}?`}
          titleIconVariant="warning"
          confirmationButtonText="Delete"
          confirmationButtonVariant={ButtonVariant.danger}
          content={
            <>
              <p>{`All the network configurations of ${getHostName(
                hostIdxToRemove,
              )} will be lost`}</p>
            </>
          }
          onClose={() => setHostIdxToRemove(null)}
          onConfirm={() => {
            remove(hostIdxToRemove);
            setHostIdxToRemove(null);
          }}
        />
      )}
    </>
  );
};

const StaticIpHostsArray = <HostFieldType,>({ ...props }: HostArrayProps<HostFieldType>) => {
  const renderHosts = React.useCallback(
    (arrayRenderProps: FieldArrayRenderProps) => (
      <Hosts {...Object.assign(props, arrayRenderProps)} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <FieldArray name={fieldName} render={renderHosts} />;
};

export default StaticIpHostsArray;
