import React from 'react';
import { Alert, AlertVariant, List, ListItem, Stack, StackItem } from '@patternfly/react-core';
import { CheckboxField } from '../ui';
import { SupportLevel } from '../../types';

type SNODisclaimerProps = {
  snoSupportLevel: SupportLevel;
  isDisabled?: boolean;
  snoExpansionSupported?: boolean;
};
const SNODisclaimer = ({
  snoSupportLevel,
  isDisabled = false,
  snoExpansionSupported = false,
}: SNODisclaimerProps) => {
  if (!['dev-preview', 'supported'].includes(snoSupportLevel)) {
    //if tech preview or unsupported there's no definition which warning to show
    return null;
  }
  const isDevPreview = snoSupportLevel === 'dev-preview';
  const generalSNOFacts = (
    <>
      <ListItem>
        Installing SNO will result in a non-highly available OpenShift deployment.
      </ListItem>
      {!snoExpansionSupported && (
        <ListItem>Adding additional machines to your cluster is currently not supported.</ListItem>
      )}
    </>
  );
  const unsupportedWarnings = (
    <>
      <ListItem>SNO is in a proof-of-concept stage and is not supported in any way.</ListItem>
      <ListItem>
        OpenShift in-place upgrades aren't expected to work with SNO. If an upgrade is needed, your
        system will need a redeployment.
      </ListItem>
    </>
  );

  return (
    <Alert
      variant={isDevPreview ? AlertVariant.warning : AlertVariant.info}
      title="Limitations for using Single Node OpenShift"
      isInline
    >
      <Stack hasGutter>
        <StackItem>
          <List>
            {generalSNOFacts}
            {isDevPreview && unsupportedWarnings}
          </List>
        </StackItem>
        {isDevPreview && (
          <StackItem>
            <CheckboxField
              name="SNODisclaimer"
              label="I understand, accept, and agree to the limitations associated with using Single Node OpenShift."
              isDisabled={isDisabled}
            />
          </StackItem>
        )}
      </Stack>
    </Alert>
  );
};

export default SNODisclaimer;
