import {
  Split,
  SplitItem,
  Spinner,
  Dropdown,
  DropdownItem,
  DropdownGroup,
  Divider,
  Button,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { AddBmcHostModal, AddBmcHostYamlModal, AddHostModal } from '../modals';
import { AddHostDropdownProps } from './types';
import './AddHostDropdown.css';
import { PopoverIcon } from '../../../common';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

type ModalType = 'iso' | 'bmc' | 'yaml' | 'ipxe' | undefined;

const DropdownItemWithLoading = ({
  isLoading,
  label,
  isDisabled,
  ...props
}: { isLoading: boolean; label: string; isDisabled?: boolean } & React.ComponentProps<
  typeof DropdownItem
>) => {
  return (
    <DropdownItem {...props} isDisabled={isDisabled || isLoading}>
      <Split hasGutter>
        <SplitItem>{label}</SplitItem>
        {isLoading && (
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

  const onSelect = (event: React.MouseEvent | undefined, itemId?: string | number) => {
    setIsKebabOpen(false);
    switch (itemId) {
      case 'discovery-iso':
        setAddModalType('iso');
        break;
      case 'ipxe':
        setAddModalType('ipxe');
        break;
      case 'with-credentials':
        setAddModalType('bmc');
        break;
      case 'upload-yaml':
        setAddModalType('yaml');
        break;
    }
  };

  return (
    <>
      <Dropdown
        id="infraenv-actions"
        isOpen={isKebabOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsKebabOpen(isOpen)}
        toggle={(toggleRef) => (
          <Button
            id="dropdown-basic"
            variant="primary"
            onClick={() => setIsKebabOpen(!isKebabOpen)}
            ref={toggleRef}
          >
            {t('ai:Add hosts')}
          </Button>
        )}
        popperProps={{ position: 'right' }}
      >
        <DropdownItem
          itemId="discovery-iso"
          description={t('ai:Discover hosts by booting a discovery image')}
        >
          {t('ai:With Discovery ISO')}
        </DropdownItem>
        <DropdownItem
          itemId="ipxe"
          description={t('ai:Use when you have an iPXE server that has already been set up')}
        >
          {t('ai:With iPXE')}
        </DropdownItem>
        <Divider component="li" />
        <DropdownGroup
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
            itemId="with-credentials"
            description={t('ai:Discover a single host via Baseboard Management Controller')}
            label={t('ai:With BMC form')}
            isLoading={!provisioningConfigLoaded}
            isDisabled={!provisioningConfig && !provisioningConfigError}
          />
          <DropdownItemWithLoading
            itemId="upload-yaml"
            description={t(
              'ai:Discover multiple hosts by providing yaml with Bare Metal Host definitions',
            )}
            label={t('ai:By uploading a YAML')}
            isLoading={!provisioningConfigLoaded}
            isDisabled={!provisioningConfig && !provisioningConfigError}
          />
        </DropdownGroup>
      </Dropdown>
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
