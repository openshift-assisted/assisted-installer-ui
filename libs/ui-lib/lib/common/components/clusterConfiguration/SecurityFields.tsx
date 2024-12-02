import * as React from 'react';
import { useFormikContext } from 'formik';
import { Checkbox, FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import { RenderIf } from '../ui/RenderIf';
import { getFieldId, TextAreaField, trimSshPublicKey, ExternalLink } from '../ui';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { NetworkConfigurationValues } from '../../types/clusters';
import { SSH_GENERATION_DOC_LINK } from '../../config';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const SshPublicKeyHelperText: React.FC<{
  fieldId?: string;
}> = ({ fieldId = 'sshPublicKey' }) => {
  const { t } = useTranslation();
  return (
    <HelperText id={fieldId}>
      <HelperTextItem>
        {t(
          'ai:Paste the content of a public ssh key you want to use to connect to the hosts into this field.',
        )}{' '}
        <ExternalLink href={SSH_GENERATION_DOC_LINK}>{t('ai:Learn more')}</ExternalLink>
      </HelperTextItem>
    </HelperText>
  );
};

interface SecurityFieldsFieldsProps {
  clusterSshKey: Cluster['sshPublicKey'];
  imageSshKey?: Cluster['imageInfo']['sshPublicKey'];
  isDisabled?: boolean;
}

const SecurityFields = ({
  clusterSshKey,
  imageSshKey,
  isDisabled = false,
}: SecurityFieldsFieldsProps) => {
  //shareSshKey shouldn't response to changes. imageSshKey stays the same, there's a loading state while it's requested
  //clusterSshKey updating causes the textarea to disappear when the user clears it to edit it
  const defaultShareSshKey = !!imageSshKey && (clusterSshKey === imageSshKey || !clusterSshKey);
  const [shareSshKey, setShareSshKey] = React.useState(defaultShareSshKey);
  const { values, setFieldValue } =
    useFormikContext<Pick<NetworkConfigurationValues, 'sshPublicKey'>>();

  const handleSshKeyBlur = () => {
    if (values.sshPublicKey) {
      setFieldValue('sshPublicKey', trimSshPublicKey(values.sshPublicKey));
    }
  };

  React.useEffect(() => {
    if (!isDisabled && shareSshKey) {
      setFieldValue('sshPublicKey', imageSshKey);
    }
  }, [shareSshKey, imageSshKey, setFieldValue, isDisabled]);

  const fieldId = getFieldId('shareDiscoverySshKey', 'checkbox');
  const { t } = useTranslation();
  return (
    <>
      <FormGroup
        fieldId={fieldId}
        label={t('ai:Host SSH Public Key for troubleshooting after installation')}
      >
        <RenderIf condition={Boolean(imageSshKey)}>
          <Checkbox
            name="shareDiscoverySshKey"
            id={fieldId}
            label={t('ai:Use the same host discovery SSH key')}
            aria-describedby={`${fieldId}-helper`}
            isChecked={shareSshKey}
            isDisabled={isDisabled}
            onChange={(_event, value) => setShareSshKey(value)}
          />
        </RenderIf>
        <RenderIf condition={!shareSshKey}>
          <TextAreaField
            name="sshPublicKey"
            helperText={<SshPublicKeyHelperText />}
            onBlur={handleSshKeyBlur}
            isDisabled={isDisabled}
          />
        </RenderIf>
      </FormGroup>
    </>
  );
};

export default SecurityFields;
