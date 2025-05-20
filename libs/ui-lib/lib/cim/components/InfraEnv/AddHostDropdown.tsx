import {
  Split,
  SplitItem,
  Spinner,
  Dropdown,
  DropdownItem,
  DropdownItemProps,
  MenuToggle,
  MenuToggleElement,
  Divider,
  DropdownList,
  Popover,
  Flex,
} from '@patternfly/react-core';
import * as React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { AddBmcHostModal, AddBmcHostYamlModal, AddHostModal } from '../modals';
import { AddHostDropdownProps } from './types';
import './AddHostDropdown.css';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { useProvisioningConfig } from '../../hooks/useProvisioningConfig';

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
  usedHostnames,
  docVersion,
}: AddHostDropdownProps) => {
  const [addModalType, setAddModalType] = React.useState<ModalType>(undefined);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const [provisioningConfig, loaded, error] = useProvisioningConfig();
  const { t } = useTranslation();

  return (
    <>
      <Dropdown
        id="infraenv-actions"
        isOpen={isKebabOpen}
        onSelect={() => setIsKebabOpen(false)}
        onOpenChange={() => setIsKebabOpen(!isKebabOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            id="dropdown-basic"
            variant="primary"
            ref={toggleRef}
            onClick={() => setIsKebabOpen(!isKebabOpen)}
            isExpanded={isKebabOpen}
          >
            {t('ai:Add hosts')}
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
      >
        {[
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
          <Divider component="li" key="separator" />,
          <DropdownList id="discovery-bmc" key="discovery-bmc" className="ai-discovery-bmc__group">
            {!provisioningConfig && (
              <DropdownItem
                isAriaDisabled
                className="pf-v5-u-color-200" // visually muted
                component="div"
              >
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsMd' }} // Changed to 'spaceItemsMd' for larger spacing
                >
                  <span>{t('ai:Baseboard Management Controller (BMC)')}</span>
                  <Popover
                    triggerAction="hover"
                    position="top"
                    bodyContent={
                      <Trans t={t}>
                        ai:To enable the host's baseboard management controller (BMC) on the hub
                        cluster, you must first{' '}
                        <Link to="/k8s/cluster/metal3.io~v1alpha1~Provisioning/~new">
                          create a provisioning configuration.
                        </Link>
                      </Trans>
                    }
                  >
                    <OutlinedQuestionCircleIcon />
                  </Popover>
                </Flex>
              </DropdownItem>
            )}
            <DropdownItemWithLoading
              key="with-credentials"
              onClick={() => {
                setIsKebabOpen(false);
                setAddModalType('bmc');
              }}
              description={t('ai:Discover a single host via Baseboard Management Controller')}
              label={t('ai:With BMC form')}
              isLoading={!loaded}
              isDisabled={!provisioningConfig || !!error}
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
              isLoading={!loaded}
              isDisabled={!provisioningConfig || !!error}
            />
          </DropdownList>,
        ]}
      </Dropdown>
      {addModalType === 'iso' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          docVersion={docVersion}
        />
      )}
      {addModalType === 'ipxe' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          docVersion={docVersion}
          isIPXE
        />
      )}
      {addModalType === 'bmc' && (
        <AddBmcHostModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          usedHostnames={usedHostnames}
          docVersion={docVersion}
        />
      )}
      {addModalType === 'yaml' && (
        <AddBmcHostYamlModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          docVersion={docVersion}
        />
      )}
    </>
  );
};

export default AddHostDropdown;
