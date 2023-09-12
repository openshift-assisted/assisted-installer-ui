import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownItemProps,
  DropdownSeparator,
  DropdownToggle,
  Split,
  SplitItem,
  Spinner,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { AddBmcHostModal, AddBmcHostYamlModal, AddHostModal } from '../modals';
import { AddHostDropdownProps } from './types';
import './AddHostDropdown.css';
import { PopoverIcon } from '../../../common';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

type ModalType = 'iso' | 'bmc' | 'yaml' | 'ipxe' | undefined;

const DropdownItemWithLoading = (
  props: DropdownItemProps & { isLoading: boolean; label: string },
) => {
  return (
    <DropdownItem {...props} isDisabled={props.isDisabled || props.isLoading}>
      <Split hasGutter>
        <SplitItem>{props.label}</SplitItem>
        {props.isLoading && (
          <SplitItem>
            <Spinner size="sm" />
          </SplitItem>
        )}
      </Split>
    </DropdownItem>
  );
};

const AddHostDropdown = ({
  infraEnv,
  agentClusterInstall,
  onSaveISOParams,
  usedHostnames,
  onCreateBMH,
  docVersion,
  onCreateBmcByYaml,
  provisioningConfigResult,
}: AddHostDropdownProps) => {
  const [addModalType, setAddModalType] = React.useState<ModalType>(undefined);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const [provisioningConfig, provisioningConfigLoaded, provisioningConfigError] =
    provisioningConfigResult;
  const { t } = useTranslation();
  return (
    <>
      <Dropdown
        id="infraenv-actions"
        toggle={
          <DropdownToggle id="dropdown-basic" onToggle={setIsKebabOpen} toggleVariant="primary">
            {t('ai:Add hosts')}
          </DropdownToggle>
        }
        isOpen={isKebabOpen}
        dropdownItems={[
          <DropdownItem
            key="discovery-iso"
            onClick={() => {
              setIsKebabOpen(false);
              setAddModalType('iso');
            }}
            description={t('ai:Discover hosts by booting a discovery image')}
          >
            {t('ai:With Discovery ISO')}
          </DropdownItem>,
          <DropdownItem
            key="ipxe"
            onClick={() => {
              setIsKebabOpen(false);
              setAddModalType('ipxe');
            }}
            description={t('ai:Use when you have an iPXE server that has already been set up')}
          >
            {t('ai:With iPXE')}
          </DropdownItem>,
          <DropdownSeparator key="separator" />,
          <DropdownGroup
            id="discovery-bmc"
            key="discovery-bmc"
            className="ai-discovery-bmc__group"
            label={
              <Split hasGutter>
                <SplitItem>{t('ai:Baseboard Management Controller (BMC)')}</SplitItem>
                <SplitItem>
                  {!provisioningConfig && (
                    <>
                      {' '}
                      <PopoverIcon
                        noVerticalAlign
                        bodyContent={
                          <Trans t={t}>
                            ai:To enable the host's baseboard management controller (BMC) on the hub
                            cluster, you must first{' '}
                            <Link to="/k8s/cluster/metal3.io~v1alpha1~Provisioning/~new">
                              create a provisioning configuration.
                            </Link>
                          </Trans>
                        }
                      />
                    </>
                  )}
                </SplitItem>
              </Split>
            }
          >
            <DropdownItemWithLoading
              key="with-credentials"
              onClick={() => {
                setIsKebabOpen(false);
                setAddModalType('bmc');
              }}
              description={t('ai:Discover a single host via Baseboard Management Controller')}
              label={t('ai:With BMC form')}
              isLoading={!provisioningConfigLoaded}
              isDisabled={!provisioningConfig && !provisioningConfigError}
            />
            <DropdownItemWithLoading
              key="upload-yaml"
              onClick={() => {
                setIsKebabOpen(false);
                setAddModalType('yaml');
              }}
              description={t(
                'ai:Discover multiple hosts by providing yaml with Bare Metal Host definitions',
              )}
              label={t('ai:By uploading a YAML')}
              isLoading={!provisioningConfigLoaded}
              isDisabled={!provisioningConfig && !provisioningConfigError}
            />
          </DropdownGroup>,
        ]}
        position={'right'}
      />
      {addModalType === 'iso' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onSaveISOParams={onSaveISOParams}
          docVersion={docVersion}
        />
      )}
      {addModalType === 'ipxe' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onSaveISOParams={onSaveISOParams}
          docVersion={docVersion}
          isIPXE
        />
      )}
      {addModalType === 'bmc' && (
        <AddBmcHostModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onCreateBMH={onCreateBMH}
          usedHostnames={usedHostnames}
          docVersion={docVersion}
          provisioningConfigError={provisioningConfigError}
        />
      )}
      {addModalType === 'yaml' && (
        <AddBmcHostYamlModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onCreateBmcByYaml={onCreateBmcByYaml}
          docVersion={docVersion}
          provisioningConfigError={provisioningConfigError}
        />
      )}
    </>
  );
};

export default AddHostDropdown;
