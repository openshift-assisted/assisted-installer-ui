import React from 'react';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { useTranslation } from '../../../hooks';

export const CustomManifestsAlert = ({
  usesExternalPlatform,
  usesThirdPartyCNI,
}: {
  usesExternalPlatform: boolean;
  usesThirdPartyCNI: boolean;
}) => {
  const { t } = useTranslation();

  let title: string;
  let body: string;

  if (usesExternalPlatform && usesExternalPlatform) {
    title = t("ai:You're using an external platform and a third-party CNI");
    body = t('ai:Make sure to upload the required custom and CNI manifests in this step.');
  } else if (usesExternalPlatform) {
    title = t("ai:You're using an external platform");
    body = t('ai:Make sure to upload the required custom manifests in this step.');
  } else if (usesThirdPartyCNI) {
    title = t("ai:You're using a third-party CNI");
    body = t('ai:Make sure to upload the required CNI manifests in this step.');
  } else {
    return null;
  }

  return (
    <Stack>
      <StackItem>
        <Alert variant={AlertVariant.info} isInline title={title}>
          {body}
        </Alert>
      </StackItem>
    </Stack>
  );
};
